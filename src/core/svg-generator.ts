/**
 * BPMN SVG generator using headless bpmn-js for static rendering
 * 
 * This module provides functionality to convert BPMN XML into SVG format
 * using a headless JSDOM environment, enabling server-side rendering (SSR)
 * and build-time processing for optimal performance.
 * 
 * @module core/svg-generator
 * @version 0.1.0
 */

import { JSDOM } from 'jsdom';
// @ts-ignore - bpmn-js types may not be available
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import {
  generateOrnlBpmnStyles,
  type BpmnThemeOptions,
  DEFAULT_ORNL_THEME
} from '../theme/ornl-theme.js';

/**
 * Configuration options for SVG generation
 */
export interface SvgGenerationOptions {
  /** Theme configuration for ORNL styling */
  theme?: BpmnThemeOptions;
  
  /** Width of the generated SVG */
  width?: number;
  
  /** Height of the generated SVG */
  height?: number;
  
  /** Whether to fit the diagram to the viewport */
  fitViewport?: boolean;
  
  /** Zoom level (1.0 = 100%) */
  zoom?: number;
  
  /** Minimum zoom level for auto-fit */
  minZoom?: number;
  
  /** Maximum zoom level for auto-fit */
  maxZoom?: number;
  
  /** Additional CSS to inject into the SVG */
  additionalCss?: string;
  
  /** Whether to include ORNL theme styles */
  includeTheme?: boolean;
}

/**
 * Default SVG generation options
 */
export const DEFAULT_SVG_OPTIONS: Required<SvgGenerationOptions> = {
  theme: DEFAULT_ORNL_THEME,
  width: 800,
  height: 600,
  fitViewport: true,
  zoom: 1.0,
  minZoom: 0.2,
  maxZoom: 4.0,
  additionalCss: '',
  includeTheme: true
};

/**
 * Result from SVG generation process
 */
export interface SvgGenerationResult {
  /** Generated SVG content as string */
  svg: string;
  
  /** Width of the generated diagram */
  width: number;
  
  /** Height of the generated diagram */
  height: number;
  
  /** Applied zoom level */
  zoom: number;
  
  /** Processing time in milliseconds */
  processingTime: number;
  
  /** Any warnings generated during processing */
  warnings: string[];
}

/**
 * Error class for SVG generation failures
 */
export class SvgGenerationError extends Error {
  constructor(
    message: string,
    public readonly bpmnXml?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SvgGenerationError';
  }
}

/**
 * Generate SVG from BPMN XML using headless bpmn-js
 * 
 * This function creates a JSDOM environment, instantiates a BPMN viewer,
 * imports the XML, applies ORNL theming, and exports the result as SVG.
 * 
 * @param bpmnXml - Valid BPMN 2.0 XML content
 * @param options - SVG generation configuration options
 * @returns Promise resolving to SVG generation result
 * 
 * @throws {SvgGenerationError} When BPMN XML is invalid or processing fails
 * 
 * @example
 * ```typescript
 * const bpmnXml = await fs.readFile('process.bpmn', 'utf-8');
 * const result = await generateStaticSVG(bpmnXml, {
 *   width: 1000,
 *   height: 800,
 *   theme: { primaryColor: '#00662C' }
 * });
 * 
 * console.log(`Generated SVG (${result.width}x${result.height}):`, result.svg);
 * ```
 */
export async function generateStaticSVG(
  bpmnXml: string,
  options: SvgGenerationOptions = {}
): Promise<SvgGenerationResult> {
  const startTime = Date.now();
  const config = { ...DEFAULT_SVG_OPTIONS, ...options };
  const warnings: string[] = [];
  
  // Validate input
  if (!bpmnXml || typeof bpmnXml !== 'string') {
    throw new SvgGenerationError('Invalid BPMN XML: must be a non-empty string');
  }
  
  // Basic XML validation
  if (!bpmnXml.includes('<bpmn') && !bpmnXml.includes('<definitions')) {
    throw new SvgGenerationError(
      'Invalid BPMN XML: missing BPMN definitions',
      bpmnXml
    );
  }

  let dom: JSDOM | null = null;
  let viewer: NavigatedViewer | null = null;

  try {
    // Create JSDOM environment for headless rendering
    dom = new JSDOM(
      `<!DOCTYPE html>
       <html>
         <head>
           <meta charset="utf-8">
           <title>BPMN SVG Generation</title>
           <style>
             body { margin: 0; padding: 0; }
             #bpmn-container { 
               width: ${config.width}px; 
               height: ${config.height}px; 
             }
           </style>
         </head>
         <body>
           <div id="bpmn-container"></div>
         </body>
       </html>`,
      {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true
      }
    );

    // Set up global objects for bpmn-js
    const window = dom.window;
    (globalThis as any).window = window;
    (globalThis as any).document = window.document;
    (globalThis as any).navigator = window.navigator;
    (globalThis as any).HTMLElement = window.HTMLElement;
    (globalThis as any).SVGElement = window.SVGElement;

    // Create BPMN viewer
    const container = window.document.getElementById('bpmn-container');
    if (!container) {
      throw new SvgGenerationError('Failed to create container element');
    }

    viewer = new NavigatedViewer({
      container,
      width: config.width,
      height: config.height
    });

    // Import BPMN XML
    try {
      await viewer.importXML(bpmnXml);
    } catch (importError) {
      const error = importError as Error;
      throw new SvgGenerationError(
        `Failed to import BPMN XML: ${error.message}`,
        bpmnXml,
        error
      );
    }

    // Get canvas for viewport operations
    const canvas = viewer.get('canvas') as any;
    const elementRegistry = viewer.get('elementRegistry') as any;
    
    // Check if diagram has elements
    const rootElements = elementRegistry?.getAll() || [];
    if (rootElements.length === 0) {
      warnings.push('BPMN diagram appears to be empty');
    }

    // Apply zoom and viewport settings
    let finalZoom = config.zoom;
    
    if (config.fitViewport && rootElements.length > 0 && canvas) {
      try {
        // Fit diagram to viewport
        canvas.zoom('fit-viewport', 'auto');
        
        // Get current zoom level
        const currentZoom = canvas.zoom();
        
        // Respect min/max zoom constraints
        if (currentZoom < config.minZoom) {
          finalZoom = config.minZoom;
          canvas.zoom(finalZoom);
          warnings.push(`Zoom constrained to minimum: ${config.minZoom}`);
        } else if (currentZoom > config.maxZoom) {
          finalZoom = config.maxZoom;
          canvas.zoom(finalZoom);
          warnings.push(`Zoom constrained to maximum: ${config.maxZoom}`);
        } else {
          finalZoom = currentZoom;
        }
      } catch (zoomError) {
        const error = zoomError as Error;
        warnings.push(`Zoom fit failed, using default: ${error.message}`);
        if (canvas) {
          canvas.zoom(config.zoom);
        }
        finalZoom = config.zoom;
      }
    } else if (canvas) {
      canvas.zoom(config.zoom);
    }

    // Generate SVG
    let svgResult: { svg: string };
    try {
      svgResult = await viewer.saveSVG();
    } catch (svgError) {
      const error = svgError as Error;
      throw new SvgGenerationError(
        `Failed to generate SVG: ${error.message}`,
        bpmnXml,
        error
      );
    }

    let { svg } = svgResult;

    // Apply ORNL theme styling if enabled
    if (config.includeTheme) {
      svg = applyOrnlThemeToSvg(svg, config.theme || {}, config.additionalCss);
    }

    // Get final dimensions
    const viewBox = canvas?.viewbox() || { outer: { width: config.width, height: config.height } };
    const finalWidth = Math.round(viewBox.outer.width);
    const finalHeight = Math.round(viewBox.outer.height);

    const processingTime = Date.now() - startTime;

    return {
      svg,
      width: finalWidth,
      height: finalHeight,
      zoom: finalZoom,
      processingTime,
      warnings
    };

  } catch (error) {
    if (error instanceof SvgGenerationError) {
      throw error;
    }
    
    const err = error as Error;
    throw new SvgGenerationError(
      `Unexpected error during SVG generation: ${err.message}`,
      bpmnXml,
      err
    );
    
  } finally {
    // Cleanup
    if (viewer) {
      try {
        viewer.destroy();
      } catch (destroyError) {
        const error = destroyError as Error;
        warnings.push(`Viewer cleanup warning: ${error.message}`);
      }
    }

    if (dom) {
      try {
        dom.window.close();
      } catch (closeError) {
        const error = closeError as Error;
        warnings.push(`DOM cleanup warning: ${error.message}`);
      }
    }

    // Restore global objects
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    delete (globalThis as any).navigator;
    delete (globalThis as any).HTMLElement;
    delete (globalThis as any).SVGElement;
  }
}

/**
 * Apply ORNL theme styling to generated SVG
 * 
 * @param svg - Raw SVG content from bpmn-js
 * @param themeOptions - ORNL theme configuration
 * @param additionalCss - Additional CSS to include
 * @returns SVG with embedded ORNL styling
 * 
 * @internal
 */
function applyOrnlThemeToSvg(
  svg: string, 
  themeOptions: BpmnThemeOptions,
  additionalCss: string = ''
): string {
  // Generate ORNL theme CSS
  const ornlCss = generateOrnlBpmnStyles(themeOptions);
  
  // Combine with additional CSS
  const completeCss = [ornlCss, additionalCss].filter(Boolean).join('\n');
  
  // Inject styles into SVG
  const styleTag = `<style><![CDATA[${completeCss}]]></style>`;
  
  // Find the appropriate insertion point (after opening <svg> tag)
  const svgOpenTag = svg.match(/<svg[^>]*>/);
  if (svgOpenTag) {
    const insertIndex = svg.indexOf('>') + 1;
    return svg.slice(0, insertIndex) + '\n' + styleTag + '\n' + svg.slice(insertIndex);
  }
  
  // Fallback: prepend to content
  return styleTag + '\n' + svg;
}

/**
 * Validate BPMN XML structure
 * 
 * @param bpmnXml - BPMN XML content to validate
 * @returns Validation result with success status and error details
 * 
 * @example
 * ```typescript
 * const validation = validateBpmnXml(xmlContent);
 * if (!validation.isValid) {
 *   console.error('Invalid BPMN:', validation.errors);
 * }
 * ```
 */
export function validateBpmnXml(bpmnXml: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!bpmnXml || typeof bpmnXml !== 'string') {
    errors.push('BPMN XML must be a non-empty string');
    return { isValid: false, errors, warnings };
  }
  
  // Basic XML structure validation
  if (!bpmnXml.trim().startsWith('<')) {
    errors.push('Invalid XML: must start with opening tag');
  }
  
  // BPMN namespace validation
  if (!bpmnXml.includes('xmlns:bpmn') && !bpmnXml.includes('http://www.omg.org/spec/BPMN')) {
    errors.push('Invalid BPMN: missing BPMN namespace declaration');
  }
  
  // Definitions element validation
  if (!bpmnXml.includes('<definitions') && !bpmnXml.includes('<bpmn:definitions')) {
    errors.push('Invalid BPMN: missing definitions element');
  }
  
  // Process element validation
  if (!bpmnXml.includes('<process') && !bpmnXml.includes('<bpmn:process')) {
    warnings.push('BPMN appears to contain no process definitions');
  }
  
  // Basic XML well-formedness check
  const openTags = (bpmnXml.match(/</g) || []).length;
  const closeTags = (bpmnXml.match(/>/g) || []).length;
  if (openTags !== closeTags) {
    warnings.push('XML structure may be malformed (unmatched tags)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
