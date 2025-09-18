/**
 * ORNL theme configuration and CSS generation for BPMN diagrams
 * 
 * This module handles theme application, CSS generation, and styling
 * utilities for rendering BPMN diagrams with ORNL design system compliance.
 * 
 * @module theme/ornl-theme
 * @version 0.1.0
 */

import {
  ORNL_COLORS,
  ORNL_ACCENTS,
  BPMN_SEMANTIC_COLORS,
  type OrnlColor,
  type BpmnSemanticColor
} from './colors.js';

/**
 * Theme configuration options for BPMN diagram rendering
 */
export interface BpmnThemeOptions {
  /** Primary color for tasks and activities */
  primaryColor?: OrnlColor;
  
  /** Secondary color for borders and accents */
  secondaryColor?: OrnlColor;
  
  /** Background color for diagram canvas */
  backgroundColor?: OrnlColor;
  
  /** Text color for labels and annotations */
  textColor?: OrnlColor;
  
  /** Error color for invalid elements */
  errorColor?: BpmnSemanticColor;
  
  /** Font family for text elements */
  fontFamily?: string;
  
  /** Base font size for text elements */
  fontSize?: string;
  
  /** Border width for elements */
  borderWidth?: string;
  
  /** Border radius for rounded elements */
  borderRadius?: string;
}

/**
 * Default ORNL theme configuration
 */
export const DEFAULT_ORNL_THEME: Required<BpmnThemeOptions> = {
  primaryColor: ORNL_COLORS.PRIMARY,
  secondaryColor: ORNL_COLORS.SECONDARY,
  backgroundColor: ORNL_COLORS.WHITE,
  textColor: ORNL_COLORS.TEXT_PRIMARY,
  errorColor: BPMN_SEMANTIC_COLORS.ERROR,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: '12px',
  borderWidth: '1.5px',
  borderRadius: '4px'
};

/**
 * Generates CSS variables for ORNL theme integration
 * 
 * @param options - Theme configuration options
 * @returns CSS custom properties as a string
 * 
 * @example
 * ```typescript
 * const cssVars = generateOrnlCssVariables();
 * //console.log(cssVars);
 * // Output: "--ornl-primary: #00662C; --ornl-secondary: #00454D; ..."
 * ```
 */
export function generateOrnlCssVariables(
  options: BpmnThemeOptions = {}
): string {
  const theme = { ...DEFAULT_ORNL_THEME, ...options };
  
  return [
    `--ornl-primary: ${theme.primaryColor}`,
    `--ornl-secondary: ${theme.secondaryColor}`,
    `--ornl-background: ${theme.backgroundColor}`,
    `--ornl-text: ${theme.textColor}`,
    `--ornl-error: ${theme.errorColor}`,
    `--ornl-font-family: ${theme.fontFamily}`,
    `--ornl-font-size: ${theme.fontSize}`,
    `--ornl-border-width: ${theme.borderWidth}`,
    `--ornl-border-radius: ${theme.borderRadius}`,
    
    // Semantic BPMN colors
    `--bpmn-start-event: ${BPMN_SEMANTIC_COLORS.START_EVENT}`,
    `--bpmn-end-event: ${BPMN_SEMANTIC_COLORS.END_EVENT}`,
    `--bpmn-task: ${BPMN_SEMANTIC_COLORS.TASK}`,
    `--bpmn-gateway: ${BPMN_SEMANTIC_COLORS.GATEWAY}`,
    `--bpmn-sequence-flow: ${BPMN_SEMANTIC_COLORS.SEQUENCE_FLOW}`,
    `--bpmn-pool: ${BPMN_SEMANTIC_COLORS.POOL}`,
    `--bpmn-border: ${BPMN_SEMANTIC_COLORS.BORDER}`,
    `--bpmn-highlight: ${BPMN_SEMANTIC_COLORS.HIGHLIGHT}`
  ].join('; ');
}

/**
 * Generates complete CSS stylesheet for ORNL-themed BPMN diagrams
 * 
 * @param options - Theme configuration options
 * @returns Complete CSS stylesheet as string
 * 
 * @example
 * ```typescript
 * const css = generateOrnlBpmnStyles();
 * document.head.appendChild(createStyleElement(css));
 * ```
 */
export function generateOrnlBpmnStyles(
  options: BpmnThemeOptions = {}
): string {
  const cssVars = generateOrnlCssVariables(options);
  
  return `
/* ORNL BPMN Theme - Generated Styles */
.bpmn-diagram.ornl-theme {
  ${cssVars};
  
  /* Container styling */
  background: var(--ornl-background);
  border: var(--ornl-border-width) solid var(--ornl-secondary);
  border-radius: var(--ornl-border-radius);
  font-family: var(--ornl-font-family);
  font-size: var(--ornl-font-size);
  overflow: hidden;
}

/* BPMN Element Styling */
.bpmn-diagram.ornl-theme .djs-element {
  color: var(--ornl-text);
}

/* Task Elements */
.bpmn-diagram.ornl-theme .djs-element[data-element-id] rect.djs-visual {
  fill: var(--ornl-background);
  stroke: var(--bpmn-task);
  stroke-width: var(--ornl-border-width);
}

/* Start Events */
.bpmn-diagram.ornl-theme .djs-element[data-element-id*="StartEvent"] circle {
  fill: var(--bpmn-start-event);
  stroke: var(--ornl-secondary);
  stroke-width: var(--ornl-border-width);
}

/* End Events */
.bpmn-diagram.ornl-theme .djs-element[data-element-id*="EndEvent"] circle {
  fill: var(--bpmn-end-event);
  stroke: var(--ornl-secondary);
  stroke-width: var(--ornl-border-width);
}

/* Gateways */
.bpmn-diagram.ornl-theme .djs-element[data-element-id*="Gateway"] path {
  fill: var(--ornl-background);
  stroke: var(--bpmn-gateway);
  stroke-width: var(--ornl-border-width);
}

/* Sequence Flows */
.bpmn-diagram.ornl-theme .djs-element[data-element-id*="SequenceFlow"] path {
  stroke: var(--bpmn-sequence-flow);
  stroke-width: var(--ornl-border-width);
  fill: none;
}

/* Text Labels */
.bpmn-diagram.ornl-theme .djs-label {
  font-family: var(--ornl-font-family);
  font-size: var(--ornl-font-size);
  color: var(--ornl-text);
  fill: var(--ornl-text);
}

/* Pools and Lanes */
.bpmn-diagram.ornl-theme .djs-element[data-element-id*="Pool"] rect,
.bpmn-diagram.ornl-theme .djs-element[data-element-id*="Lane"] rect {
  fill: var(--bpmn-pool);
  stroke: var(--bpmn-border);
  stroke-width: var(--ornl-border-width);
}

/* Error States */
.bpmn-diagram.ornl-theme .bpmn-error {
  border-color: var(--ornl-error);
  background-color: rgba(254, 80, 0, 0.1); /* FORGE orange with opacity */
}

/* Loading States */
.bpmn-diagram.ornl-theme .bpmn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--ornl-text);
}

.bpmn-diagram.ornl-theme .bpmn-loading .spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ornl-secondary);
  border-top: 2px solid var(--ornl-primary);
  border-radius: 50%;
  animation: ornl-spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes ornl-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .bpmn-diagram.ornl-theme {
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bpmn-diagram.ornl-theme .spinner {
    animation: none;
  }
}
`;
}

/**
 * Creates a style element with ORNL BPMN styles
 * 
 * @param options - Theme configuration options
 * @returns HTMLStyleElement ready for DOM insertion
 * 
 * @example
 * ```typescript
 * const styleElement = createOrnlStyleElement();
 * document.head.appendChild(styleElement);
 * ```
 */
export function createOrnlStyleElement(
  options: BpmnThemeOptions = {}
): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = generateOrnlBpmnStyles(options);
  style.setAttribute('data-ornl-bpmn-theme', 'true');
  return style;
}

/**
 * Theme utility class for managing ORNL BPMN styling
 */
export class OrnlBpmnTheme {
  private options: Required<BpmnThemeOptions>;
  private styleElement: HTMLStyleElement | null = null;

  /**
   * Creates a new ORNL BPMN theme instance
   * 
   * @param options - Theme configuration options
   */
  constructor(options: BpmnThemeOptions = {}) {
    this.options = { ...DEFAULT_ORNL_THEME, ...options };
  }

  /**
   * Apply theme to the document
   * 
   * @returns The created style element
   */
  apply(): HTMLStyleElement {
    if (typeof document === 'undefined') {
      throw new Error('Theme can only be applied in browser environment');
    }

    if (this.styleElement) {
      this.remove();
    }

    this.styleElement = createOrnlStyleElement(this.options);
    document.head.appendChild(this.styleElement);
    
    return this.styleElement;
  }

  /**
   * Remove theme from the document
   */
  remove(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Update theme options and re-apply
   * 
   * @param newOptions - Updated theme options
   */
  update(newOptions: Partial<BpmnThemeOptions>): void {
    this.options = { ...this.options, ...newOptions };
    if (this.styleElement) {
      this.apply();
    }
  }

  /**
   * Get current theme options
   * 
   * @returns Current theme configuration
   */
  getOptions(): Required<BpmnThemeOptions> {
    return { ...this.options };
  }
}

/**
 * Export theme utilities and constants
 */
export {
  ORNL_COLORS,
  ORNL_ACCENTS,
  BPMN_SEMANTIC_COLORS
};
