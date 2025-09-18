/**
 * File loading utilities for BPMN content with error handling
 * 
 * This module provides robust file loading functionality for BPMN files,
 * supporting both Node.js filesystem operations and browser fetch API,
 * with comprehensive error handling and validation.
 * 
 * @module utils/file-loader
 * @version 0.1.0
 */

import { validateBpmnXml } from '../core/svg-generator.js';

/**
 * Options for file loading operations
 */
export interface FileLoadOptions {
  /** Timeout for file operations (in milliseconds) */
  timeout?: number;
  
  /** Whether to validate BPMN content after loading */
  validate?: boolean;
  
  /** Expected file encoding */
  encoding?: string;
  
  /** Maximum file size in bytes */
  maxSize?: number;
  
  /** Additional HTTP headers for fetch requests */
  headers?: Record<string, string>;
}

/**
 * Default file loading options
 */
export const DEFAULT_FILE_OPTIONS: Required<FileLoadOptions> = {
  timeout: 30000,      // 30 seconds
  validate: true,
  encoding: 'utf-8',
  maxSize: 10485760,   // 10MB
  headers: {}
};

/**
 * Result from file loading operation
 */
export interface FileLoadResult {
  /** Loaded file content */
  content: string;
  
  /** File size in bytes */
  size: number;
  
  /** MIME type (if available) */
  mimeType?: string;
  
  /** Last modified date (if available) */
  lastModified?: Date;
  
  /** Loading time in milliseconds */
  loadTime: number;
  
  /** Validation result (if validation enabled) */
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Error class for file loading failures
 */
export class FileLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileLoadError';
  }
}

/**
 * Load BPMN content from filesystem or URL
 * 
 * This function automatically detects the environment and uses the appropriate
 * loading mechanism (fetch for browsers and URLs). For Node.js filesystem access,
 * users should read files manually and pass content to generateStaticSVG.
 * 
 * @param filePath - Path to BPMN file (local path or URL)
 * @param options - File loading configuration options
 * @returns Promise resolving to file load result
 * 
 * @throws {FileLoadError} When file cannot be loaded or is invalid
 * 
 * @example
 * ```typescript
 * // Load from URL (browser or Node.js)
 * const result = await loadBpmnFile('https://example.com/process.bpmn2', {
 *   timeout: 15000,
 *   validate: true
 * });
 * 
 * // Load relative file in browser
 * const result = await loadBpmnFile('./workflow.bpmn');
 * 
 * if (result.validation?.isValid) {
 *   //console.log('Valid BPMN loaded successfully');
 * }
 * ```
 */
export async function loadBpmnFile(
  filePath: string,
  options: FileLoadOptions = {}
): Promise<FileLoadResult> {
  const startTime = Date.now();
  const config = { ...DEFAULT_FILE_OPTIONS, ...options };
  
  // Validate input
  if (!filePath || typeof filePath !== 'string') {
    throw new FileLoadError('Invalid file path: must be a non-empty string', filePath);
  }
  
  try {
    // Use fetch for all file loading (URLs and relative paths)
    const result = await loadFromUrl(filePath, config);
    
    // Perform BPMN validation if requested
    if (config.validate) {
      const validation = validateBpmnXml(result.content);
      result.validation = validation;
      
      if (!validation.isValid) {
        throw new FileLoadError(
          `Invalid BPMN content: ${validation.errors.join(', ')}`,
          filePath
        );
      }
    }
    
    result.loadTime = Date.now() - startTime;
    return result;
    
  } catch (error) {
    if (error instanceof FileLoadError) {
      throw error;
    }
    
    const err = error as Error;
    throw new FileLoadError(
      `Failed to load BPMN file: ${err.message}`,
      filePath,
      err
    );
  }
}

/**
 * Load BPMN content from URL using fetch API
 * 
 * @param url - URL to load from
 * @param options - Loading options
 * @returns Promise resolving to file load result
 * 
 * @internal
 */
async function loadFromUrl(
  url: string,
  options: Required<FileLoadOptions>
): Promise<FileLoadResult> {
  // Create timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/xml, text/xml, text/plain, */*',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > options.maxSize) {
      throw new Error(`File too large: ${contentLength} bytes (max: ${options.maxSize})`);
    }
    
    const content = await response.text();
    
    // Validate size after loading
    const size = new TextEncoder().encode(content).length;
    if (size > options.maxSize) {
      throw new Error(`File too large: ${size} bytes (max: ${options.maxSize})`);
    }
    
    return {
      content,
      size,
      mimeType: response.headers.get('content-type') || undefined,
      lastModified: response.headers.get('last-modified') 
        ? new Date(response.headers.get('last-modified')!) 
        : undefined,
      loadTime: 0 // Will be set by caller
    };
    
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Determine MIME type based on file extension
 * 
 * @param filePath - File path to analyze
 * @returns Appropriate MIME type
 * 
 * @internal
 */
function getBpmnMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'bpmn':
    case 'bpmn2':
      return 'application/xml';
    case 'xml':
      return 'text/xml';
    default:
      return 'text/plain';
  }
}

/**
 * Validate file path format and accessibility
 * 
 * @param filePath - Path to validate
 * @returns Validation result with details
 * 
 * @example
 * ```typescript
 * const validation = validateFilePath('./workflow.bpmn');
 * if (!validation.isValid) {
 *   console.error('Invalid path:', validation.errors);
 * }
 * ```
 */
export function validateFilePath(filePath: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!filePath || typeof filePath !== 'string') {
    errors.push('File path must be a non-empty string');
    return { isValid: false, errors, warnings };
  }
  
  const trimmedPath = filePath.trim();
  if (trimmedPath.length === 0) {
    errors.push('File path cannot be empty or whitespace only');
  }
  
  // Check for dangerous characters
  const dangerousChars = ['<', '>', '|', '"', '*', '?'];
  const hasDangerousChars = dangerousChars.some(char => trimmedPath.includes(char));
  if (hasDangerousChars) {
    errors.push('File path contains invalid characters');
  }
  
  // Check for BPMN file extensions
  const validExtensions = ['.bpmn', '.bpmn2', '.xml'];
  const hasValidExtension = validExtensions.some(ext => 
    trimmedPath.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    warnings.push('File does not have a recognized BPMN extension (.bpmn, .bpmn2, .xml)');
  }
  
  // Check for URL format
  const isUrl = trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://');
  if (isUrl) {
    try {
      new URL(trimmedPath);
    } catch {
      errors.push('Invalid URL format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Cache for loaded BPMN files to improve performance
 */
const fileCache = new Map<string, { result: FileLoadResult; timestamp: number }>();

/**
 * Load BPMN file with caching support
 * 
 * @param filePath - Path to BPMN file
 * @param options - Loading options with cache configuration
 * @returns Promise resolving to cached or fresh file load result
 * 
 * @example
 * ```typescript
 * // First load - fetches from source
 * const result1 = await loadBpmnFileWithCache('./process.bpmn');
 * 
 * // Second load - returns cached result (if within cache TTL)
 * const result2 = await loadBpmnFileWithCache('./process.bpmn');
 * ```
 */
export async function loadBpmnFileWithCache(
  filePath: string,
  options: FileLoadOptions & { cacheTtl?: number } = {}
): Promise<FileLoadResult> {
  const cacheTtl = options.cacheTtl || 300000; // 5 minutes default
  const now = Date.now();
  
  // Check cache
  const cached = fileCache.get(filePath);
  if (cached && (now - cached.timestamp) < cacheTtl) {
    return { ...cached.result, loadTime: 0 }; // Return copy
  }
  
  // Load fresh content
  const result = await loadBpmnFile(filePath, options);
  
  // Cache result
  fileCache.set(filePath, { result: { ...result }, timestamp: now });
  
  return result;
}

/**
 * Clear BPMN file cache
 * 
 * @param filePath - Specific file to clear, or undefined to clear all
 */
export function clearBpmnFileCache(filePath?: string): void {
  if (filePath) {
    fileCache.delete(filePath);
  } else {
    fileCache.clear();
  }
}
