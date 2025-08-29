import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeBase } from '../knowledge/base.js';
import { ValidateSpecInputSchema, ValidationResult, ValidationIssue } from '../types/index.js';

/**
 * RSpec Code Validation Tools
 */
export class RSpecValidationTools {
  constructor(private knowledgeBase: KnowledgeBase) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'validate_spec_code',
        description: 'Validate RSpec code against Better Specs guidelines',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'RSpec code to validate'
            },
            checkAll: {
              type: 'boolean',
              default: true,
              description: 'Whether to run all validation checks'
            },
            specificChecks: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific validation rules to check'
            },
            returnSuggestions: {
              type: 'boolean',
              default: true,
              description: 'Whether to include improvement suggestions'
            }
          },
          required: ['code']
        }
      }
    ];
  }

  canHandle(toolName: string): boolean {
    return toolName === 'validate_spec_code';
  }

  async handleTool(name: string, args: any): Promise<any> {
    if (name === 'validate_spec_code') {
      return this.validateSpecCode(args);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  private async validateSpecCode(args: any): Promise<any> {
    const input = ValidateSpecInputSchema.parse(args);
    
    const validationResult = this.performValidation(input.code, input.checkAll, input.specificChecks);
    
    let response = `# RSpec Code Validation Results\n\n`;
    
    // Overall score and status
    response += `**Overall Score:** ${validationResult.score}/100\n`;
    response += `**Status:** ${validationResult.isValid ? '✅ Passes' : '❌ Issues Found'}\n\n`;
    
    // Summary
    response += `## Summary\n\n${validationResult.summary}\n\n`;
    
    // Issues breakdown
    if (validationResult.issues.length > 0) {
      response += `## Issues Found (${validationResult.issues.length})\n\n`;
      
      const errors = validationResult.issues.filter(i => i.type === 'error');
      const warnings = validationResult.issues.filter(i => i.type === 'warning');
      const suggestions = validationResult.issues.filter(i => i.type === 'suggestion');
      
      if (errors.length > 0) {
        response += `### ❌ Errors (${errors.length})\n\n`;
        errors.forEach((issue, index) => {
          response += `${index + 1}. **${issue.rule}**\n`;
          response += `   ${issue.message}\n`;
          if (issue.line) response += `   Line: ${issue.line}\n`;
          if (issue.suggestion) response += `   💡 Suggestion: ${issue.suggestion}\n`;
          response += '\n';
        });
      }
      
      if (warnings.length > 0) {
        response += `### ⚠️ Warnings (${warnings.length})\n\n`;
        warnings.forEach((issue, index) => {
          response += `${index + 1}. **${issue.rule}**\n`;
          response += `   ${issue.message}\n`;
          if (issue.line) response += `   Line: ${issue.line}\n`;
          if (issue.suggestion) response += `   💡 Suggestion: ${issue.suggestion}\n`;
          response += '\n';
        });
      }
      
      if (suggestions.length > 0) {
        response += `### 💡 Suggestions (${suggestions.length})\n\n`;
        suggestions.forEach((issue, index) => {
          response += `${index + 1}. **${issue.rule}**\n`;
          response += `   ${issue.message}\n`;
          if (issue.line) response += `   Line: ${issue.line}\n`;
          if (issue.suggestion) response += `   💡 Suggestion: ${issue.suggestion}\n`;
          response += '\n';
        });
      }
    } else {
      response += `## ✅ No Issues Found\n\nYour code follows Better Specs guidelines well!\n\n`;
    }
    
    // Improvement suggestions
    if (input.returnSuggestions && validationResult.suggestions && validationResult.suggestions.length > 0) {
      response += `## 🚀 Improvement Suggestions\n\n`;
      validationResult.suggestions.forEach((suggestion, index) => {
        response += `${index + 1}. ${suggestion}\n`;
      });
      response += '\n';
    }
    
    // Better Specs guidelines reference
    response += `## 📚 Better Specs Guidelines\n\n`;
    response += `For more detailed guidance, check out:\n`;
    response += `- [Better Specs Website](https://www.betterspecs.org)\n`;
    response += `- Use \`get_rspec_guidance\` tool for specific topics\n`;
    response += `- Use \`generate_spec_example\` tool for code examples\n`;

    return {
      content: [{
        type: 'text',
        text: response
      }]
    };
  }

  private performValidation(code: string, checkAll: boolean, specificChecks?: string[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];
    
    const lines = code.split('\n');
    let score = 100;
    
    // Define validation rules
    const validationRules = [
      { name: 'should_syntax', check: this.checkShouldSyntax.bind(this) },
      { name: 'describe_naming', check: this.checkDescribeNaming.bind(this) },
      { name: 'context_usage', check: this.checkContextUsage.bind(this) },
      { name: 'expectation_count', check: this.checkExpectationCount.bind(this) },
      { name: 'test_structure', check: this.checkTestStructure.bind(this) },
      { name: 'let_usage', check: this.checkLetUsage.bind(this) },
      { name: 'subject_usage', check: this.checkSubjectUsage.bind(this) },
      { name: 'factory_usage', check: this.checkFactoryUsage.bind(this) }
    ];
    
    // Run validation rules
    for (const rule of validationRules) {
      if (checkAll || (specificChecks && specificChecks.includes(rule.name))) {
        const ruleIssues = rule.check(lines);
        issues.push(...ruleIssues);
      }
    }
    
    // Calculate score based on issues
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const suggestionCount = issues.filter(i => i.type === 'suggestion').length;
    
    score -= (errorCount * 20) + (warningCount * 10) + (suggestionCount * 5);
    score = Math.max(0, score);
    
    // Generate suggestions based on issues
    if (errorCount > 0) {
      suggestions.push('Fix critical errors first - they violate core Better Specs principles');
    }
    if (warningCount > 0) {
      suggestions.push('Address warnings to improve test maintainability');
    }
    if (issues.some(i => i.rule.includes('should_syntax'))) {
      suggestions.push('Migrate from should syntax to expect syntax using the transpec gem');
    }
    if (issues.some(i => i.rule.includes('expectation_count'))) {
      suggestions.push('Consider splitting tests with multiple expectations into separate examples');
    }
    
    const summary = this.generateSummary(score, errorCount, warningCount, suggestionCount);
    
    return {
      isValid: errorCount === 0,
      score,
      issues,
      suggestions,
      summary
    };
  }

  private checkShouldSyntax(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    lines.forEach((line, index) => {
      if (line.includes('.should ') || line.includes('.should_not ')) {
        issues.push({
          type: 'error',
          message: 'Using deprecated should syntax',
          line: index + 1,
          rule: 'should_syntax',
          suggestion: 'Use expect syntax: expect(object).to matcher'
        });
      }
    });
    
    return issues;
  }

  private checkDescribeNaming(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    lines.forEach((line, index) => {
      const describeMatch = line.match(/describe\s+['"](.+?)['"]/);
      if (describeMatch) {
        const description = describeMatch[1];
        
        // Check for method naming conventions
        if (description.includes('method') && !description.match(/^[.#]/)) {
          issues.push({
            type: 'warning',
            message: 'Method descriptions should use . for class methods or # for instance methods',
            line: index + 1,
            rule: 'describe_naming',
            suggestion: 'Use ".method_name" for class methods or "#method_name" for instance methods'
          });
        }
        
        // Check for overly long descriptions
        if (description.length > 40) {
          issues.push({
            type: 'suggestion',
            message: 'Description is quite long, consider using context blocks',
            line: index + 1,
            rule: 'describe_naming',
            suggestion: 'Split long descriptions using context blocks'
          });
        }
      }
    });
    
    return issues;
  }

  private checkContextUsage(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    lines.forEach((line, index) => {
      const contextMatch = line.match(/context\s+['"](.+?)['"]/);
      if (contextMatch) {
        const description = contextMatch[1];
        
        // Check if context starts with when/with/without
        if (!description.match(/^(when|with|without)\s/i)) {
          issues.push({
            type: 'suggestion',
            message: 'Context descriptions should start with "when", "with", or "without"',
            line: index + 1,
            rule: 'context_usage',
            suggestion: 'Start context with "when", "with", or "without" to clarify conditions'
          });
        }
      }
    });
    
    return issues;
  }

  private checkExpectationCount(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    let inItBlock = false;
    let expectationCount = 0;
    let itStartLine = 0;
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('it ')) {
        inItBlock = true;
        expectationCount = 0;
        itStartLine = index + 1;
      } else if (line.trim() === 'end' && inItBlock) {
        if (expectationCount > 1) {
          issues.push({
            type: 'warning',
            message: `Test has ${expectationCount} expectations - consider splitting into separate tests`,
            line: itStartLine,
            rule: 'expectation_count',
            suggestion: 'Split into separate tests with one expectation each for better failure isolation'
          });
        }
        inItBlock = false;
      } else if (inItBlock && (line.includes('expect(') || line.includes('is_expected'))) {
        expectationCount++;
      }
    });
    
    return issues;
  }

  private checkTestStructure(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for proper nesting and structure
    let hasDescribe = false;
    let hasIt = false;
    
    lines.forEach((line, index) => {
      if (line.includes('describe ')) hasDescribe = true;
      if (line.includes('it ')) hasIt = true;
      
      // Check for tests outside describe blocks
      if (line.includes('it ') && !hasDescribe) {
        issues.push({
          type: 'error',
          message: 'Test found outside of describe block',
          line: index + 1,
          rule: 'test_structure',
          suggestion: 'Wrap tests in describe blocks to organize them properly'
        });
      }
    });
    
    return issues;
  }

  private checkLetUsage(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    lines.forEach((line, index) => {
      // Check for instance variables in tests
      if (line.includes('@') && line.includes('=') && !line.includes('let')) {
        issues.push({
          type: 'suggestion',
          message: 'Consider using let instead of instance variables',
          line: index + 1,
          rule: 'let_usage',
          suggestion: 'Use let for lazy-loaded test data instead of instance variables'
        });
      }
    });
    
    return issues;
  }

  private checkSubjectUsage(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Look for repeated object references that could use subject
    const objectReferences: Record<string, number[]> = {};
    
    lines.forEach((line, index) => {
      const expectMatch = line.match(/expect\(([^)]+)\)/);
      if (expectMatch) {
        const object = expectMatch[1];
        if (!objectReferences[object]) {
          objectReferences[object] = [];
        }
        objectReferences[object].push(index + 1);
      }
    });
    
    // Check for objects referenced multiple times
    Object.entries(objectReferences).forEach(([object, lineNumbers]) => {
      if (lineNumbers.length > 2 && !object.includes('subject')) {
        issues.push({
          type: 'suggestion',
          message: `Object "${object}" is referenced ${lineNumbers.length} times - consider using subject`,
          line: lineNumbers[0],
          rule: 'subject_usage',
          suggestion: `Define subject { ${object} } and use is_expected.to for cleaner tests`
        });
      }
    });
    
    return issues;
  }

  private checkFactoryUsage(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    lines.forEach((line, index) => {
      // Check for Model.create usage instead of factories
      if (line.match(/\w+\.create\(/)) {
        issues.push({
          type: 'suggestion',
          message: 'Consider using FactoryBot instead of Model.create',
          line: index + 1,
          rule: 'factory_usage',
          suggestion: 'Use create(:model) or build(:model) from FactoryBot for better test data management'
        });
      }
    });
    
    return issues;
  }

  private generateSummary(score: number, errorCount: number, warningCount: number, suggestionCount: number): string {
    if (score >= 90) {
      return 'Excellent! Your code follows Better Specs guidelines very well.';
    } else if (score >= 70) {
      return 'Good adherence to Better Specs guidelines with some room for improvement.';
    } else if (score >= 50) {
      return 'Moderate adherence to Better Specs guidelines. Several improvements recommended.';
    } else {
      return 'Significant improvements needed to align with Better Specs guidelines.';
    }
  }
}
