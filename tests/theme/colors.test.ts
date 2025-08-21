/**
 * Unit tests for ORNL theme color constants
 * 
 * @group theme
 */

import { describe, it, expect } from 'vitest';
import {
  ORNL_COLORS,
  ORNL_ACCENTS,
  BPMN_SEMANTIC_COLORS,
  COMPLETE_PALETTE,
  type OrnlColor,
  type OrnlAccent,
  type BpmnSemanticColor
} from '../../src/theme/colors.js';

describe('ORNL Colors', () => {
  it('should export primary ORNL brand colors', () => {
    expect(ORNL_COLORS.PRIMARY).toBe('#00662C');
    expect(ORNL_COLORS.SECONDARY).toBe('#00454D');
    expect(ORNL_COLORS.NEUTRAL).toBe('#DBDCDB');
    expect(ORNL_COLORS.TEXT_PRIMARY).toBe('#373A36');
    expect(ORNL_COLORS.WHITE).toBe('#FFFFFF');
    expect(ORNL_COLORS.BLACK).toBe('#000000');
  });

  it('should export ORNL accent colors', () => {
    expect(ORNL_ACCENTS.FORGE).toBe('#FE5000');
    expect(ORNL_ACCENTS.SPARK).toBe('#F5B800');
    expect(ORNL_ACCENTS.PLASMA).toBe('#0077C8');
    expect(ORNL_ACCENTS.PULSAR).toBe('#702F8A');
  });

  it('should map semantic BPMN colors correctly', () => {
    expect(BPMN_SEMANTIC_COLORS.START_EVENT).toBe(ORNL_ACCENTS.SPARK);
    expect(BPMN_SEMANTIC_COLORS.END_EVENT).toBe(ORNL_ACCENTS.FORGE);
    expect(BPMN_SEMANTIC_COLORS.TASK).toBe(ORNL_COLORS.PRIMARY);
    expect(BPMN_SEMANTIC_COLORS.GATEWAY).toBe(ORNL_ACCENTS.PLASMA);
    expect(BPMN_SEMANTIC_COLORS.SEQUENCE_FLOW).toBe(ORNL_COLORS.TEXT_PRIMARY);
    expect(BPMN_SEMANTIC_COLORS.ERROR).toBe(ORNL_ACCENTS.FORGE);
  });

  it('should provide complete color palette', () => {
    expect(COMPLETE_PALETTE.PRIMARY).toBe('#00662C');
    expect(COMPLETE_PALETTE.FORGE).toBe('#FE5000');
    expect(COMPLETE_PALETTE.TASK).toBe('#00662C');
    
    // Should contain all color sets
    const keys = Object.keys(COMPLETE_PALETTE);
    expect(keys.length).toBeGreaterThan(15);
  });

  it('should have valid hex color format', () => {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    
    Object.values(ORNL_COLORS).forEach(color => {
      expect(color).toMatch(hexColorRegex);
    });
    
    Object.values(ORNL_ACCENTS).forEach(color => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  it('should have correct TypeScript types', () => {
    const primaryColor: OrnlColor = ORNL_COLORS.PRIMARY;
    const accentColor: OrnlAccent = ORNL_ACCENTS.FORGE;
    const semanticColor: BpmnSemanticColor = BPMN_SEMANTIC_COLORS.TASK;
    
    expect(typeof primaryColor).toBe('string');
    expect(typeof accentColor).toBe('string');
    expect(typeof semanticColor).toBe('string');
  });
});
