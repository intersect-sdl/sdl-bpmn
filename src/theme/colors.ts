/**
 * ORNL Design System color constants for BPMN diagram theming
 * 
 * This module provides the official ORNL color palette for consistent
 * styling across BPMN diagrams in the Scientific Data Layer (SDL).
 * 
 * @module theme/colors
 * @version 0.1.0
 */

/**
 * Primary ORNL brand colors
 */
export const ORNL_COLORS = {
  /** Primary ORNL Green - main brand color */
  PRIMARY: '#00662C',
  
  /** Hale Navy - secondary brand color */
  SECONDARY: '#00454D',
  
  /** Graphite - neutral tone */
  NEUTRAL: '#DBDCDB',
  
  /** Dark Matter - primary text color */
  TEXT_PRIMARY: '#373A36',
  
  /** White - background and contrast */
  WHITE: '#FFFFFF',
  
  /** Black - text and borders */
  BLACK: '#000000'
} as const;

/**
 * ORNL accent colors for data visualization and highlights
 */
export const ORNL_ACCENTS = {
  /** Forge Orange - energy and innovation */
  FORGE: '#FE5000',
  
  /** Spark Yellow - discovery and insight */
  SPARK: '#F5B800',
  
  /** Plasma Blue - technology and precision */
  PLASMA: '#0077C8',
  
  /** Pulsar Purple - research and advancement */
  PULSAR: '#702F8A'
} as const;

/**
 * Semantic color mappings for BPMN element types
 */
export const BPMN_SEMANTIC_COLORS = {
  /** Start events */
  START_EVENT: ORNL_ACCENTS.SPARK,
  
  /** End events */
  END_EVENT: ORNL_ACCENTS.FORGE,
  
  /** Tasks and activities */
  TASK: ORNL_COLORS.PRIMARY,
  
  /** Gateways and decision points */
  GATEWAY: ORNL_ACCENTS.PLASMA,
  
  /** Sequence flows */
  SEQUENCE_FLOW: ORNL_COLORS.TEXT_PRIMARY,
  
  /** Pools and lanes */
  POOL: ORNL_COLORS.NEUTRAL,
  
  /** Text and labels */
  TEXT: ORNL_COLORS.TEXT_PRIMARY,
  
  /** Borders and outlines */
  BORDER: ORNL_COLORS.SECONDARY,
  
  /** Background fill */
  BACKGROUND: ORNL_COLORS.WHITE,
  
  /** Error states */
  ERROR: ORNL_ACCENTS.FORGE,
  
  /** Highlighted elements */
  HIGHLIGHT: ORNL_ACCENTS.PULSAR
} as const;

/**
 * Type definitions for theme configuration
 */
export type OrnlColor = typeof ORNL_COLORS[keyof typeof ORNL_COLORS];
export type OrnlAccent = typeof ORNL_ACCENTS[keyof typeof ORNL_ACCENTS];
export type BpmnSemanticColor = typeof BPMN_SEMANTIC_COLORS[keyof typeof BPMN_SEMANTIC_COLORS];

/**
 * Complete color palette combining all ORNL colors
 */
export const COMPLETE_PALETTE = {
  ...ORNL_COLORS,
  ...ORNL_ACCENTS,
  ...BPMN_SEMANTIC_COLORS
} as const;
