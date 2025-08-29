import { z } from 'zod';

/**
 * Core data types for Better RSpec MCP Server
 */

// RSpec Guideline Schema
export const RSpecGuidelineSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    'naming',
    'organization', 
    'expectations',
    'data-setup',
    'mocking',
    'shared-examples',
    'performance',
    'configuration'
  ]),
  content: z.string(),
  examples: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  relatedGuidelines: z.array(z.string()).optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  lastUpdated: z.string().optional(),
});

export type RSpecGuideline = z.infer<typeof RSpecGuidelineSchema>;

// Code Example Schema
export const CodeExampleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  specType: z.enum(['model', 'request', 'system', 'service', 'job', 'controller', 'helper']),
  scenario: z.string(),
  badCode: z.string().optional(),
  goodCode: z.string(),
  explanation: z.string(),
  tags: z.array(z.string()),
  relatedGuidelines: z.array(z.string()).optional(),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

export type CodeExample = z.infer<typeof CodeExampleSchema>;

// Anti-pattern Schema
export const AntiPatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  problematicCode: z.string(),
  improvedCode: z.string(),
  explanation: z.string(),
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  tags: z.array(z.string()),
});

export type AntiPattern = z.infer<typeof AntiPatternSchema>;

// Configuration Template Schema
export const ConfigurationTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['spec_helper', 'rails_helper', 'guardfile', 'gemfile', 'rspec_config']),
  content: z.string(),
  dependencies: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type ConfigurationTemplate = z.infer<typeof ConfigurationTemplateSchema>;

// Tool Input Schemas
export const GetGuidanceInputSchema = z.object({
  topic: z.string().describe('RSpec topic to get guidance on'),
  category: z.enum(['naming', 'organization', 'expectations', 'data-setup', 'mocking', 'shared-examples', 'performance', 'configuration']).optional(),
  includeExamples: z.boolean().default(true),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export const GenerateExampleInputSchema = z.object({
  specType: z.enum(['model', 'request', 'system', 'service', 'job', 'controller', 'helper']),
  scenario: z.string().describe('What you want to test'),
  includeSetup: z.boolean().default(true),
  style: z.enum(['minimal', 'comprehensive']).default('comprehensive'),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

export const ValidateSpecInputSchema = z.object({
  code: z.string().describe('RSpec code to validate'),
  checkAll: z.boolean().default(true),
  specificChecks: z.array(z.string()).optional(),
  returnSuggestions: z.boolean().default(true),
});

export const GetConfigurationInputSchema = z.object({
  type: z.enum(['spec_helper', 'rails_helper', 'guardfile', 'gemfile', 'rspec_config']),
  projectType: z.enum(['rails', 'ruby', 'gem']).default('rails'),
  includeComments: z.boolean().default(true),
  features: z.array(z.string()).optional(),
});

// Search and Filter Types
export const SearchOptionsSchema = z.object({
  query: z.string(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  limit: z.number().min(1).max(50).default(10),
});

export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

// Validation Result Types
export const ValidationIssueSchema = z.object({
  type: z.enum(['error', 'warning', 'suggestion']),
  message: z.string(),
  line: z.number().optional(),
  column: z.number().optional(),
  rule: z.string(),
  suggestion: z.string().optional(),
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(ValidationIssueSchema),
  suggestions: z.array(z.string()).optional(),
  summary: z.string(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Resource URI patterns
export const RESOURCE_URIS = {
  GUIDELINES: 'better-specs://guidelines',
  GUIDELINE_BY_ID: 'better-specs://guidelines/{id}',
  EXAMPLES: 'better-specs://examples',
  EXAMPLE_BY_TYPE: 'better-specs://examples/{type}',
  ANTIPATTERNS: 'better-specs://antipatterns',
  CONFIGURATIONS: 'better-specs://configurations',
  CHEATSHEET: 'better-specs://cheatsheet',
} as const;
