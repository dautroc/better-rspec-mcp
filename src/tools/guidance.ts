import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeBase } from '../knowledge/base.js';
import { GetGuidanceInputSchema } from '../types/index.js';

/**
 * RSpec Guidance Tools
 * 
 * Provides tools for getting Better Specs guidance on specific topics
 */
export class RSpecGuidanceTools {
  constructor(private knowledgeBase: KnowledgeBase) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'get_rspec_guidance',
        description: 'Get Better Specs guidance for specific RSpec topics',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'RSpec topic to get guidance on (e.g., "let vs before", "mocking", "contexts")'
            },
            category: {
              type: 'string',
              enum: ['naming', 'organization', 'expectations', 'data-setup', 'mocking', 'shared-examples', 'performance', 'configuration'],
              description: 'Specific category to focus on'
            },
            includeExamples: {
              type: 'boolean',
              default: true,
              description: 'Whether to include code examples'
            },
            complexity: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Complexity level of guidance'
            }
          },
          required: ['topic']
        }
      },
      {
        name: 'search_rspec_guidelines',
        description: 'Search through Better Specs guidelines using keywords',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for guidelines'
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by specific categories'
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 20,
              default: 5,
              description: 'Maximum number of results to return'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_category_overview',
        description: 'Get an overview of all guidelines in a specific category',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['naming', 'organization', 'expectations', 'data-setup', 'mocking', 'shared-examples', 'performance', 'configuration'],
              description: 'Category to get overview for'
            },
            includeDetails: {
              type: 'boolean',
              default: false,
              description: 'Whether to include detailed content for each guideline'
            }
          },
          required: ['category']
        }
      }
    ];
  }

  canHandle(toolName: string): boolean {
    return [
      'get_rspec_guidance',
      'search_rspec_guidelines', 
      'get_category_overview'
    ].includes(toolName);
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_rspec_guidance':
        return this.getRSpecGuidance(args);
      case 'search_rspec_guidelines':
        return this.searchRSpecGuidelines(args);
      case 'get_category_overview':
        return this.getCategoryOverview(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async getRSpecGuidance(args: any): Promise<any> {
    const input = GetGuidanceInputSchema.parse(args);
    
    // Search for relevant guidelines
    const searchResults = this.knowledgeBase.searchGuidelines({
      query: input.topic,
      limit: 5
    });

    // Filter by category if specified
    const filteredResults = input.category 
      ? searchResults.filter(g => g.category === input.category)
      : searchResults;

    if (filteredResults.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No specific guidance found for "${input.topic}". Here are some general Better Specs principles:

1. **Be clear about what you're testing** - Use descriptive test names
2. **One expectation per test** - Keep tests focused
3. **Test behavior, not implementation** - Focus on what the code does
4. **Use proper test structure** - describe/context/it hierarchy
5. **Keep tests DRY** - Use let, subject, and shared examples appropriately

Try searching for more specific terms or browse by category.`
        }]
      };
    }

    let response = `# Better Specs Guidance: ${input.topic}\n\n`;
    
    for (const guideline of filteredResults.slice(0, 3)) {
      response += `## ${guideline.title}\n\n`;
      response += `**Category:** ${guideline.category}\n\n`;
      response += `${guideline.content}\n\n`;
      
      if (input.includeExamples && guideline.examples && guideline.examples.length > 0) {
        response += `### Examples\n\n`;
        for (const exampleId of guideline.examples.slice(0, 2)) {
          const example = this.knowledgeBase.getExample(exampleId);
          if (example) {
            response += `**${example.title}**\n\n`;
            if (example.badCode) {
              response += `❌ **Bad:**\n\`\`\`ruby\n${example.badCode}\n\`\`\`\n\n`;
            }
            response += `✅ **Good:**\n\`\`\`ruby\n${example.goodCode}\n\`\`\`\n\n`;
            response += `${example.explanation}\n\n`;
          }
        }
      }
      
      if (guideline.tags.length > 0) {
        response += `**Tags:** ${guideline.tags.join(', ')}\n\n`;
      }
      
      response += '---\n\n';
    }

    // Add related guidelines
    const relatedGuidelines = new Set<string>();
    filteredResults.forEach(g => {
      g.relatedGuidelines?.forEach(id => relatedGuidelines.add(id));
    });

    if (relatedGuidelines.size > 0) {
      response += `## Related Guidelines\n\n`;
      for (const relatedId of Array.from(relatedGuidelines).slice(0, 3)) {
        const related = this.knowledgeBase.getGuideline(relatedId);
        if (related) {
          response += `- **${related.title}** (${related.category})\n`;
        }
      }
    }

    return {
      content: [{
        type: 'text',
        text: response
      }]
    };
  }

  private async searchRSpecGuidelines(args: any): Promise<any> {
    const { query, categories, limit = 5 } = args;
    
    const searchResults = this.knowledgeBase.searchGuidelines({
      query,
      categories,
      limit
    });

    if (searchResults.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No guidelines found matching "${query}". Try different keywords or browse by category.`
        }]
      };
    }

    let response = `# Search Results for "${query}"\n\n`;
    response += `Found ${searchResults.length} guideline(s):\n\n`;

    for (const guideline of searchResults) {
      response += `## ${guideline.title}\n\n`;
      response += `**Category:** ${guideline.category}\n`;
      response += `**Tags:** ${guideline.tags.join(', ')}\n\n`;
      
      // Show first paragraph of content
      const firstParagraph = guideline.content.split('\n\n')[0];
      response += `${firstParagraph}\n\n`;
      response += '---\n\n';
    }

    return {
      content: [{
        type: 'text',
        text: response
      }]
    };
  }

  private async getCategoryOverview(args: any): Promise<any> {
    const { category, includeDetails = false } = args;
    
    const guidelines = this.knowledgeBase.getGuidelinesByCategory(category);
    
    if (guidelines.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No guidelines found for category "${category}".`
        }]
      };
    }

    let response = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Guidelines\n\n`;
    response += `${guidelines.length} guideline(s) in this category:\n\n`;

    for (const guideline of guidelines) {
      response += `## ${guideline.title}\n\n`;
      
      if (includeDetails) {
        response += `${guideline.content}\n\n`;
      } else {
        // Show first sentence or paragraph
        const firstSentence = guideline.content.split('.')[0] + '.';
        response += `${firstSentence}\n\n`;
      }
      
      if (guideline.tags.length > 0) {
        response += `**Tags:** ${guideline.tags.join(', ')}\n\n`;
      }
      
      response += '---\n\n';
    }

    return {
      content: [{
        type: 'text',
        text: response
      }]
    };
  }
}
