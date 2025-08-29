import { Prompt } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeBase } from '../knowledge/base.js';

/**
 * RSpec Prompts for MCP
 */
export class RSpecPrompts {
  constructor(private knowledgeBase: KnowledgeBase) {}

  getPromptDefinitions(): Prompt[] {
    return [
      {
        name: 'review_rspec_code',
        description: 'Review RSpec code for Better Specs compliance and suggest improvements',
        arguments: [
          {
            name: 'code',
            description: 'RSpec code to review',
            required: true
          },
          {
            name: 'focus_areas',
            description: 'Specific areas to focus on (e.g., "naming", "structure", "mocking")',
            required: false
          },
          {
            name: 'project_context',
            description: 'Additional context about the project (Rails app, gem, etc.)',
            required: false
          }
        ]
      },
      {
        name: 'plan_comprehensive_tests',
        description: 'Plan comprehensive test coverage for a feature following Better Specs guidelines',
        arguments: [
          {
            name: 'feature_description',
            description: 'Description of the feature to test',
            required: true
          },
          {
            name: 'test_types',
            description: 'Types of tests needed (model, request, system, etc.)',
            required: false
          },
          {
            name: 'complexity',
            description: 'Feature complexity level (simple, moderate, complex)',
            required: false
          }
        ]
      },
      {
        name: 'refactor_test_suite',
        description: 'Analyze existing test suite and suggest refactoring improvements',
        arguments: [
          {
            name: 'current_tests',
            description: 'Current test code or description of test suite',
            required: true
          },
          {
            name: 'pain_points',
            description: 'Known issues with current tests (slow, brittle, hard to maintain)',
            required: false
          },
          {
            name: 'goals',
            description: 'Refactoring goals (speed, maintainability, coverage)',
            required: false
          }
        ]
      },
      {
        name: 'setup_rspec_project',
        description: 'Guide through setting up RSpec for a new project following Better Specs',
        arguments: [
          {
            name: 'project_type',
            description: 'Type of project (Rails app, Ruby gem, Sinatra app, etc.)',
            required: true
          },
          {
            name: 'testing_needs',
            description: 'Specific testing requirements (API testing, system tests, etc.)',
            required: false
          },
          {
            name: 'team_experience',
            description: 'Team experience level with RSpec (beginner, intermediate, advanced)',
            required: false
          }
        ]
      }
    ];
  }

  async getPrompt(name: string, args?: Record<string, string>): Promise<any> {
    switch (name) {
      case 'review_rspec_code':
        return this.getReviewPrompt(args);
      case 'plan_comprehensive_tests':
        return this.getPlanningPrompt(args);
      case 'refactor_test_suite':
        return this.getRefactoringPrompt(args);
      case 'setup_rspec_project':
        return this.getSetupPrompt(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  private async getReviewPrompt(args?: Record<string, string>): Promise<any> {
    const code = args?.code || '';
    const focusAreas = args?.focus_areas || 'all aspects';
    const projectContext = args?.project_context || 'Ruby project';

    const prompt = `# RSpec Code Review - Better Specs Analysis

You are an expert RSpec developer conducting a thorough code review based on Better Specs guidelines (https://www.betterspecs.org). 

## Code to Review
\`\`\`ruby
${code}
\`\`\`

## Review Context
- **Project Type**: ${projectContext}
- **Focus Areas**: ${focusAreas}

## Review Guidelines

Please analyze this RSpec code against Better Specs principles and provide:

### 1. Overall Assessment
- Compliance score (1-10) with Better Specs guidelines
- Main strengths of the current code
- Critical issues that need immediate attention

### 2. Detailed Analysis
Check for these Better Specs principles:

**Naming & Structure:**
- ✅ Method descriptions use \`.method\` or \`#method\` convention
- ✅ Contexts start with "when", "with", or "without"
- ✅ Descriptions are concise (under 40 characters)
- ✅ Proper \`describe\`/\`context\`/\`it\` hierarchy

**Expectations & Syntax:**
- ✅ Uses modern \`expect\` syntax (not \`should\`)
- ✅ One expectation per test (for unit tests)
- ✅ Uses \`is_expected.to\` for one-liners
- ✅ Tests behavior, not implementation

**Data Setup:**
- ✅ Uses \`let\` instead of instance variables
- ✅ Uses \`subject\` appropriately
- ✅ Prefers FactoryBot over fixtures
- ✅ Creates only necessary test data

**Test Coverage:**
- ✅ Tests happy path, edge cases, and failure scenarios
- ✅ Covers all relevant contexts and conditions
- ✅ Appropriate test types for the functionality

**Mocking & Stubbing:**
- ✅ Mocks sparingly and appropriately
- ✅ Stubs external boundaries (HTTP, time, file system)
- ✅ Doesn't over-mock internal objects

### 3. Specific Improvements
For each issue found:
- **Issue**: What's wrong
- **Impact**: Why it matters
- **Solution**: How to fix it
- **Example**: Show the improved code

### 4. Refactoring Suggestions
- Opportunities to use shared examples
- Ways to improve test organization
- Performance improvements
- Better use of RSpec features

### 5. Next Steps
- Priority order for addressing issues
- Additional tests that might be needed
- Recommended resources for the team

## Better Specs Resources
Reference these principles from Better Specs:
- Describe your methods clearly
- Use contexts for different scenarios  
- Keep descriptions short
- One expectation per test (when appropriate)
- Test all possible cases
- Use expect syntax
- Use subject when helpful
- Use let and let! for data setup
- Mock sparingly
- Create only needed data
- Use shared examples to DRY up tests
- Test what you see (integration over unit when appropriate)

Provide actionable, specific feedback that will help improve the test quality and maintainability.`;

    return {
      description: 'Comprehensive RSpec code review based on Better Specs guidelines',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }

  private async getPlanningPrompt(args?: Record<string, string>): Promise<any> {
    const featureDescription = args?.feature_description || '';
    const testTypes = args?.test_types || 'all relevant types';
    const complexity = args?.complexity || 'moderate';

    const prompt = `# Test Planning - Comprehensive Coverage Strategy

You are an expert test architect planning comprehensive test coverage for a new feature following Better Specs guidelines.

## Feature to Test
${featureDescription}

## Planning Context
- **Test Types Needed**: ${testTypes}
- **Feature Complexity**: ${complexity}

## Planning Framework

Please create a comprehensive test plan that covers:

### 1. Test Strategy Overview
- **Primary testing approach** (unit, integration, system)
- **Test pyramid distribution** (how many of each type)
- **Key testing principles** to follow
- **Success criteria** for the test suite

### 2. Test Type Breakdown

For each relevant test type, plan:

**Model Tests** (if applicable):
- Validations to test
- Associations to verify
- Scopes and class methods
- Instance methods and behavior
- Edge cases and error conditions

**Request/API Tests** (if applicable):
- Endpoints to test
- Authentication scenarios
- Input validation cases
- Response format verification
- Error handling scenarios

**System/Feature Tests** (if applicable):
- User workflows to test
- Happy path scenarios
- Error handling from user perspective
- Browser/device considerations

**Service/Job Tests** (if applicable):
- Core functionality
- Success and failure scenarios
- Side effects and integrations
- Error handling and retries

### 3. Test Organization Structure

Suggest file organization:
\`\`\`
spec/
├── models/
├── requests/ (or controllers/)
├── system/ (or features/)
├── services/
├── jobs/
├── support/
│   ├── shared_examples/
│   └── helpers/
└── factories/
\`\`\`

### 4. Data Setup Strategy
- **FactoryBot factories** needed
- **Test data relationships** and dependencies
- **Shared setup** across test types
- **Database seeding** requirements

### 5. Mocking & Stubbing Strategy
- **External services** to stub
- **Time-dependent** behavior to mock
- **File system** operations to stub
- **Third-party APIs** to mock

### 6. Shared Examples Opportunities
- **Common behaviors** across models
- **Repeated API patterns**
- **Standard authentication checks**
- **Error handling patterns**

### 7. Test Implementation Priorities

**Phase 1 - Core Functionality:**
- Most critical happy path tests
- Basic validation and error handling
- Core business logic verification

**Phase 2 - Edge Cases:**
- Boundary conditions
- Error scenarios
- Integration points

**Phase 3 - User Experience:**
- End-to-end workflows
- Performance considerations
- Accessibility testing

### 8. Better Specs Compliance Checklist

Ensure all tests follow:
- ✅ Clear, descriptive test names
- ✅ Proper describe/context/it structure
- ✅ One expectation per test (unit tests)
- ✅ Appropriate use of let/subject
- ✅ Modern expect syntax
- ✅ Comprehensive scenario coverage
- ✅ Minimal, focused mocking
- ✅ Fast, reliable execution

### 9. Implementation Guidelines

**Test Writing Standards:**
- Naming conventions for files and examples
- Code organization within spec files
- Comment and documentation standards
- Shared example usage patterns

**Quality Gates:**
- Code coverage targets
- Test performance benchmarks
- Review criteria for new tests
- Continuous integration requirements

### 10. Maintenance Considerations
- **Refactoring strategies** as feature evolves
- **Test data management** over time
- **Performance monitoring** for test suite
- **Documentation updates** needed

Provide a detailed, actionable test plan that ensures comprehensive coverage while following Better Specs principles for maintainable, reliable tests.`;

    return {
      description: 'Comprehensive test planning following Better Specs guidelines',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }

  private async getRefactoringPrompt(args?: Record<string, string>): Promise<any> {
    const currentTests = args?.current_tests || '';
    const painPoints = args?.pain_points || 'general improvements needed';
    const goals = args?.goals || 'improve maintainability and speed';

    const prompt = `# Test Suite Refactoring - Better Specs Alignment

You are an expert RSpec consultant analyzing an existing test suite for refactoring opportunities based on Better Specs guidelines.

## Current Test Suite
${currentTests}

## Refactoring Context
- **Known Pain Points**: ${painPoints}
- **Refactoring Goals**: ${goals}

## Refactoring Analysis Framework

Please provide a comprehensive refactoring strategy:

### 1. Current State Assessment

**Strengths Analysis:**
- What's working well in the current tests
- Better Specs principles already being followed
- Test patterns worth preserving

**Issues Identification:**
- Anti-patterns and violations of Better Specs
- Performance bottlenecks
- Maintainability problems
- Coverage gaps or redundancies

**Technical Debt:**
- Deprecated syntax usage
- Over-complicated test setup
- Brittle test dependencies
- Slow or flaky tests

### 2. Refactoring Strategy

**Priority Matrix:**
- **High Impact, Low Effort**: Quick wins to implement first
- **High Impact, High Effort**: Major improvements for later phases
- **Low Impact, Low Effort**: Nice-to-have improvements
- **Low Impact, High Effort**: Changes to avoid

**Phased Approach:**
- **Phase 1**: Critical fixes and quick wins
- **Phase 2**: Structural improvements
- **Phase 3**: Advanced optimizations

### 3. Better Specs Alignment

**Syntax Modernization:**
- Migrate from \`should\` to \`expect\` syntax
- Update to use \`is_expected.to\` for one-liners
- Remove deprecated RSpec features

**Structure Improvements:**
- Better describe/context organization
- Clearer test naming conventions
- Proper test hierarchy

**Data Setup Refactoring:**
- Convert instance variables to \`let\`
- Implement proper \`subject\` usage
- Migrate fixtures to FactoryBot
- Optimize test data creation

### 4. Performance Optimizations

**Speed Improvements:**
- Identify and fix slow tests
- Optimize database interactions
- Reduce unnecessary test setup
- Implement proper mocking strategies

**Reliability Enhancements:**
- Fix flaky tests
- Remove order dependencies
- Improve test isolation
- Handle timing issues

### 5. Organization Refactoring

**File Structure:**
- Reorganize spec files logically
- Create shared examples for common patterns
- Extract helper methods appropriately
- Implement proper support file organization

**Shared Examples Opportunities:**
- Identify repeated test patterns
- Create reusable shared examples
- Standardize common behaviors
- Reduce code duplication

### 6. Mocking & Stubbing Cleanup

**Appropriate Mocking:**
- Remove over-mocking of internal objects
- Implement proper external service stubbing
- Use WebMock for HTTP requests
- Mock time-dependent behavior appropriately

**Integration vs Unit Balance:**
- Identify tests that should be integration tests
- Convert over-mocked unit tests to integration tests
- Maintain appropriate test pyramid balance

### 7. Implementation Roadmap

**Week 1-2: Foundation**
- Fix critical syntax issues
- Address flaky tests
- Implement basic performance improvements

**Week 3-4: Structure**
- Reorganize test files
- Implement shared examples
- Improve data setup patterns

**Week 5-6: Optimization**
- Advanced performance tuning
- Complete mocking strategy implementation
- Final Better Specs alignment

### 8. Migration Strategies

**Gradual Migration:**
- File-by-file refactoring approach
- Maintaining test coverage during changes
- Parallel old/new pattern implementation

**Automated Tools:**
- Use transpec for syntax migration
- RuboCop rules for consistency
- Custom scripts for pattern detection

### 9. Quality Assurance

**Validation Checklist:**
- All tests pass after refactoring
- Performance improvements measured
- Coverage maintained or improved
- Team feedback incorporated

**Monitoring:**
- Test suite performance tracking
- Flaky test identification
- Coverage trend analysis
- Developer experience metrics

### 10. Team Adoption

**Training Needs:**
- Better Specs principles education
- New patterns and practices
- Tool usage (FactoryBot, shared examples)
- Code review guidelines

**Documentation Updates:**
- Testing guidelines documentation
- Example patterns and templates
- Troubleshooting guides
- Best practices reference

Provide specific, actionable refactoring recommendations with code examples where helpful. Focus on practical steps that will improve test maintainability, speed, and reliability while aligning with Better Specs principles.`;

    return {
      description: 'Test suite refactoring strategy based on Better Specs guidelines',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }

  private async getSetupPrompt(args?: Record<string, string>): Promise<any> {
    const projectType = args?.project_type || 'Ruby project';
    const testingNeeds = args?.testing_needs || 'standard testing requirements';
    const teamExperience = args?.team_experience || 'intermediate';

    const prompt = `# RSpec Project Setup - Better Specs Foundation

You are an expert RSpec consultant helping set up a new testing environment following Better Specs guidelines from the ground up.

## Project Context
- **Project Type**: ${projectType}
- **Testing Requirements**: ${testingNeeds}
- **Team Experience**: ${teamExperience}

## Setup Strategy

Please provide a comprehensive setup guide:

### 1. Initial Assessment & Planning

**Project Analysis:**
- Identify specific testing needs for this project type
- Determine appropriate test types (unit, integration, system)
- Plan test pyramid distribution
- Consider performance and scalability requirements

**Team Readiness:**
- Assess current RSpec knowledge gaps
- Identify training needs
- Plan knowledge sharing strategies
- Set up mentoring or pair programming

### 2. Dependency Setup

**Core Gems:**
\`\`\`ruby
# Provide complete Gemfile testing section
group :development, :test do
  # Core testing gems with versions
end

group :test do
  # Test-only gems
end

group :development do
  # Development testing tools
end
\`\`\`

**Installation Steps:**
1. Detailed gem installation process
2. Bundle configuration
3. Initial RSpec setup commands
4. Verification steps

### 3. Configuration Files

**spec_helper.rb:**
- Complete configuration following Better Specs
- Explanation of each setting
- Project-specific customizations
- Performance optimizations

**rails_helper.rb** (if Rails):
- Rails-specific configuration
- Database setup and cleaning
- FactoryBot integration
- Authentication helpers
- Support file loading

**.rspec:**
- Command-line options
- Formatter configuration
- Output customization
- Development vs CI settings

### 4. Directory Structure

**Recommended Organization:**
\`\`\`
spec/
├── spec_helper.rb
├── rails_helper.rb (if Rails)
├── support/
│   ├── shared_examples/
│   ├── shared_contexts/
│   ├── matchers/
│   └── helpers/
├── factories/
├── fixtures/
├── models/
├── requests/ (or controllers/)
├── system/ (or features/)
├── services/
├── jobs/
└── lib/
\`\`\`

**File Naming Conventions:**
- Spec file naming patterns
- Factory file organization
- Support file structure
- Shared example naming

### 5. FactoryBot Setup

**Factory Organization:**
- Factory file structure
- Naming conventions
- Trait usage patterns
- Association handling
- Sequence definitions

**Best Practices:**
- Minimal factory definitions
- Trait-based variations
- Performance considerations
- Faker integration

### 6. Testing Patterns & Standards

**Better Specs Compliance:**
- Method naming conventions (\`.method\` vs \`#method\`)
- Context usage patterns
- Description length guidelines
- Expectation syntax standards

**Code Organization:**
- Describe/context/it hierarchy
- Subject and let usage
- Shared example implementation
- Helper method extraction

### 7. Continuous Integration Setup

**CI Configuration:**
- Test command setup
- Database preparation
- Environment variables
- Parallel test execution
- Coverage reporting

**Quality Gates:**
- Minimum coverage thresholds
- Performance benchmarks
- Linting requirements
- Security scanning

### 8. Development Workflow

**Guard Setup:**
- Guardfile configuration
- File watching patterns
- Notification setup
- Performance tuning

**Editor Integration:**
- RSpec snippets and templates
- Syntax highlighting
- Test runner integration
- Debugging setup

### 9. Team Guidelines

**Coding Standards:**
- Test writing guidelines
- Review checklist
- Shared example usage
- Mocking policies

**Documentation:**
- Testing guidelines document
- Example patterns
- Troubleshooting guide
- FAQ for common issues

### 10. Advanced Features

**Performance Optimization:**
- Database optimization strategies
- Parallel test execution
- Test profiling setup
- Memory usage monitoring

**Advanced Testing:**
- System test configuration (Capybara)
- API testing setup
- Background job testing
- Time-dependent test handling

### 11. Maintenance & Evolution

**Ongoing Maintenance:**
- Gem update strategies
- Performance monitoring
- Flaky test detection
- Coverage trend analysis

**Scaling Considerations:**
- Large test suite management
- Team growth accommodation
- CI/CD pipeline optimization
- Test data management

### 12. Implementation Checklist

**Phase 1 - Foundation (Week 1):**
- [ ] Install and configure core gems
- [ ] Set up basic configuration files
- [ ] Create directory structure
- [ ] Write first example spec

**Phase 2 - Standards (Week 2):**
- [ ] Implement FactoryBot setup
- [ ] Create shared examples
- [ ] Set up Guard for development
- [ ] Establish team guidelines

**Phase 3 - Advanced (Week 3-4):**
- [ ] Configure CI/CD integration
- [ ] Set up performance monitoring
- [ ] Implement advanced testing features
- [ ] Complete team training

### 13. Success Metrics

**Technical Metrics:**
- Test coverage percentage
- Test suite execution time
- Flaky test frequency
- Code quality scores

**Team Metrics:**
- Developer satisfaction with testing
- Time to write new tests
- Bug detection rate
- Code review efficiency

Provide detailed, step-by-step instructions that will result in a robust, maintainable testing setup aligned with Better Specs principles. Include code examples, configuration files, and practical tips for success.`;

    return {
      description: 'Comprehensive RSpec project setup guide following Better Specs',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }
}
