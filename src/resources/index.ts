import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeBase } from '../knowledge/base.js';
import { RESOURCE_URIS } from '../types/index.js';

/**
 * RSpec Resources for MCP
 */
export class RSpecResources {
  constructor(private knowledgeBase: KnowledgeBase) {}

  getResourceDefinitions(): Resource[] {
    return [
      {
        uri: RESOURCE_URIS.GUIDELINES,
        name: 'Better Specs Guidelines',
        description: 'Complete collection of Better Specs guidelines',
        mimeType: 'application/json'
      },
      {
        uri: RESOURCE_URIS.EXAMPLES,
        name: 'RSpec Code Examples',
        description: 'Comprehensive RSpec examples following Better Specs',
        mimeType: 'application/json'
      },
      {
        uri: RESOURCE_URIS.ANTIPATTERNS,
        name: 'RSpec Anti-patterns',
        description: 'Common RSpec mistakes and how to avoid them',
        mimeType: 'application/json'
      },
      {
        uri: RESOURCE_URIS.CONFIGURATIONS,
        name: 'RSpec Configuration Templates',
        description: 'Ready-to-use RSpec configuration templates',
        mimeType: 'application/json'
      },
      {
        uri: RESOURCE_URIS.CHEATSHEET,
        name: 'Better Specs Cheatsheet',
        description: 'Quick reference for Better Specs guidelines',
        mimeType: 'text/markdown'
      }
    ];
  }

  async readResource(uri: string): Promise<any> {
    switch (uri) {
      case RESOURCE_URIS.GUIDELINES:
        return this.getAllGuidelines();
      case RESOURCE_URIS.EXAMPLES:
        return this.getAllExamples();
      case RESOURCE_URIS.ANTIPATTERNS:
        return this.getAllAntiPatterns();
      case RESOURCE_URIS.CONFIGURATIONS:
        return this.getAllConfigurations();
      case RESOURCE_URIS.CHEATSHEET:
        return this.getCheatsheet();
      default:
        // Handle parameterized URIs
        if (uri.startsWith('better-specs://guidelines/')) {
          const id = uri.replace('better-specs://guidelines/', '');
          return this.getGuidelineById(id);
        }
        if (uri.startsWith('better-specs://examples/')) {
          const type = uri.replace('better-specs://examples/', '');
          return this.getExamplesByType(type);
        }
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  }

  private async getAllGuidelines(): Promise<any> {
    const guidelines = this.knowledgeBase.getAllGuidelines();
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify({
          total: guidelines.length,
          guidelines: guidelines.map(g => ({
            id: g.id,
            title: g.title,
            category: g.category,
            tags: g.tags,
            priority: g.priority,
            summary: g.content.split('\n\n')[0] // First paragraph as summary
          }))
        }, null, 2)
      }]
    };
  }

  private async getAllExamples(): Promise<any> {
    const examples = this.knowledgeBase.getAllExamples();
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify({
          total: examples.length,
          examples: examples.map(e => ({
            id: e.id,
            title: e.title,
            specType: e.specType,
            scenario: e.scenario,
            complexity: e.complexity,
            tags: e.tags,
            hasGoodCode: !!e.goodCode,
            hasBadCode: !!e.badCode
          }))
        }, null, 2)
      }]
    };
  }

  private async getAllAntiPatterns(): Promise<any> {
    const antiPatterns = this.knowledgeBase.getAllAntiPatterns();
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify({
          total: antiPatterns.length,
          antiPatterns: antiPatterns.map(ap => ({
            id: ap.id,
            name: ap.name,
            category: ap.category,
            severity: ap.severity,
            description: ap.description,
            tags: ap.tags
          }))
        }, null, 2)
      }]
    };
  }

  private async getAllConfigurations(): Promise<any> {
    const configurations = this.knowledgeBase.getAllConfigurations();
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify({
          total: configurations.length,
          configurations: configurations.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            description: c.description,
            dependencies: c.dependencies
          }))
        }, null, 2)
      }]
    };
  }

  private async getGuidelineById(id: string): Promise<any> {
    const guideline = this.knowledgeBase.getGuideline(id);
    
    if (!guideline) {
      throw new Error(`Guideline not found: ${id}`);
    }
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify(guideline, null, 2)
      }]
    };
  }

  private async getExamplesByType(type: string): Promise<any> {
    const examples = this.knowledgeBase.getExamplesByType(type);
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify({
          specType: type,
          total: examples.length,
          examples
        }, null, 2)
      }]
    };
  }

  private async getCheatsheet(): Promise<any> {
    const cheatsheet = `# Better Specs Cheatsheet

## Quick Reference

### Naming & Structure
- **Class methods**: \`describe '.method_name'\`
- **Instance methods**: \`describe '#method_name'\`
- **Contexts**: Start with "when", "with", or "without"
- **Short descriptions**: Keep under 40 characters

### Expectations
- **Modern syntax**: \`expect(object).to matcher\` (not \`should\`)
- **One per test**: Each \`it\` block should have one expectation
- **Use \`is_expected\`**: For one-liner tests with subject

### Data Setup
- **Use \`let\`**: Instead of instance variables
- **Use \`let!\`**: When you need eager evaluation
- **FactoryBot**: Prefer over fixtures
- **Subject**: For the main object under test

### Test Organization
- **describe**: For methods or classes
- **context**: For different conditions
- **it**: For specific behaviors
- **Test all paths**: Happy, edge, and failure cases

### Mocking & Stubbing
- **Mock sparingly**: Prefer real objects when possible
- **Stub boundaries**: HTTP, time, randomness, file system
- **WebMock**: For HTTP requests
- **Timecop**: For time-dependent tests

### Performance
- **Guard**: For automatic test running
- **Transactional fixtures**: For speed
- **Database Cleaner**: For complex scenarios
- **Parallel tests**: For large suites

### Configuration
\`\`\`ruby
# .rspec
--require spec_helper
--format documentation
--color
--fail-fast
--order random

# spec_helper.rb
RSpec.configure do |config|
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
  config.order = :random
  config.disable_monkey_patching!
end
\`\`\`

### Common Matchers
\`\`\`ruby
# Equality
expect(actual).to eq(expected)
expect(actual).to be(expected)

# Truthiness
expect(actual).to be_truthy
expect(actual).to be_falsey
expect(actual).to be_nil

# Collections
expect(array).to include(item)
expect(array).to contain_exactly(item1, item2)
expect(array).to match_array([item1, item2])

# Changes
expect { action }.to change(Model, :count).by(1)
expect { action }.to change { object.attribute }

# Errors
expect { action }.to raise_error(ErrorClass)
expect { action }.not_to raise_error

# HTTP (with rspec-rails)
expect(response).to have_http_status(:ok)
expect(response).to redirect_to(path)
\`\`\`

### Anti-patterns to Avoid
- ❌ Using \`should\` syntax
- ❌ Multiple expectations per test (in unit tests)
- ❌ Testing implementation details
- ❌ Over-mocking
- ❌ Long test descriptions
- ❌ Instance variables instead of \`let\`
- ❌ Fixtures instead of factories
- ❌ Tests without contexts for edge cases

### Best Practices
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Group related tests with contexts
- ✅ Keep tests DRY with shared examples
- ✅ Test what the user sees (integration over unit)
- ✅ Fast feedback with focused test runs
- ✅ Consistent test structure across the project

For detailed guidance, use the Better RSpec MCP tools:
- \`get_rspec_guidance\` - Get specific guidance
- \`generate_spec_example\` - Generate code examples
- \`validate_spec_code\` - Check your specs
- \`get_rspec_configuration\` - Setup help`;

    return {
      contents: [{
        type: 'text',
        text: cheatsheet
      }]
    };
  }
}
