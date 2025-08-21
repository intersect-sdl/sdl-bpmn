/**
 * BPMN Rendering Library for SDL
 * 
 * A comprehensive library for rendering BPMN diagrams with ORNL design system
 * integration, supporting both static SVG generation and interactive viewing.
 * 
 * @module @sdl/bpmn
 * @version 0.1.0
 */

// Core functionality
export * from './core/index.js';

// Theme and styling
export * from './theme/index.js';

// Utilities (basic exports only due to Node.js compatibility)
export {
  type FileLoadOptions,
  type FileLoadResult,
  FileLoadError,
  validateFilePath,
  clearBpmnFileCache
} from './utils/file-loader.js';

// Re-export key functions for convenience
export {
  generateStaticSVG,
  validateBpmnXml,
  type SvgGenerationOptions,
  type SvgGenerationResult,
  SvgGenerationError
} from './core/svg-generator.js';

export {
  ORNL_COLORS,
  ORNL_ACCENTS,
  BPMN_SEMANTIC_COLORS,
  generateOrnlBpmnStyles,
  generateOrnlCssVariables,
  OrnlBpmnTheme,
  type BpmnThemeOptions
} from './theme/ornl-theme.js';
