import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeBase } from '../knowledge/base.js';
import { GenerateExampleInputSchema } from '../types/index.js';

/**
 * RSpec Example Generation Tools
 */
export class RSpecExampleTools {
  constructor(private knowledgeBase: KnowledgeBase) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'generate_spec_example',
        description: 'Generate RSpec example code following Better Specs guidelines',
        inputSchema: {
          type: 'object',
          properties: {
            specType: {
              type: 'string',
              enum: ['model', 'request', 'system', 'service', 'job', 'controller', 'helper'],
              description: 'Type of spec to generate'
            },
            scenario: {
              type: 'string',
              description: 'What you want to test (e.g., "user validation", "API endpoint", "email sending")'
            },
            includeSetup: {
              type: 'boolean',
              default: true,
              description: 'Whether to include setup code (let, before, etc.)'
            },
            style: {
              type: 'string',
              enum: ['minimal', 'comprehensive'],
              default: 'comprehensive',
              description: 'Style of example to generate'
            },
            complexity: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              default: 'intermediate',
              description: 'Complexity level of the example'
            }
          },
          required: ['specType', 'scenario']
        }
      }
    ];
  }

  canHandle(toolName: string): boolean {
    return toolName === 'generate_spec_example';
  }

  async handleTool(name: string, args: any): Promise<any> {
    if (name === 'generate_spec_example') {
      return this.generateSpecExample(args);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  private async generateSpecExample(args: any): Promise<any> {
    const input = GenerateExampleInputSchema.parse(args);
    
    // Find existing examples that match the criteria
    const matchingExamples = this.knowledgeBase.getExamplesByType(input.specType);
    const relevantExample = matchingExamples.find(ex => 
      ex.scenario.toLowerCase().includes(input.scenario.toLowerCase()) ||
      ex.tags.some(tag => input.scenario.toLowerCase().includes(tag.toLowerCase()))
    );

    let generatedCode: string;
    let explanation: string;

    if (relevantExample) {
      generatedCode = relevantExample.goodCode;
      explanation = relevantExample.explanation;
    } else {
      // Generate based on spec type and scenario
      const generated = this.generateCodeForScenario(input);
      generatedCode = generated.code;
      explanation = generated.explanation;
    }

    const response = `# ${input.specType.charAt(0).toUpperCase() + input.specType.slice(1)} Spec Example

**Scenario:** ${input.scenario}
**Style:** ${input.style}
**Complexity:** ${input.complexity}

## Generated Code

\`\`\`ruby
${generatedCode}
\`\`\`

## Explanation

${explanation}

## Better Specs Guidelines Applied

${this.getAppliedGuidelines(input.specType)}

## Next Steps

1. Customize the example for your specific use case
2. Add additional test cases for edge cases
3. Ensure proper test data setup with FactoryBot
4. Consider adding shared examples if applicable
`;

    return {
      content: [{
        type: 'text',
        text: response
      }]
    };
  }

  private generateCodeForScenario(input: any): { code: string; explanation: string } {
    switch (input.specType) {
      case 'model':
        return this.generateModelSpec(input);
      case 'request':
        return this.generateRequestSpec(input);
      case 'system':
        return this.generateSystemSpec(input);
      case 'service':
        return this.generateServiceSpec(input);
      case 'job':
        return this.generateJobSpec(input);
      default:
        return {
          code: '# Example not available for this spec type yet',
          explanation: 'This spec type is not yet supported by the generator.'
        };
    }
  }

  private generateModelSpec(input: any): { code: string; explanation: string } {
    const code = `# spec/models/${input.scenario.toLowerCase().replace(/\s+/g, '_')}_spec.rb
RSpec.describe ${this.extractModelName(input.scenario)}, type: :model do
  subject(:${input.scenario.toLowerCase().replace(/\s+/g, '_')}) { build(:${input.scenario.toLowerCase().replace(/\s+/g, '_')}) }

  it { is_expected.to be_valid }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:email) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:items) }
    it { is_expected.to belong_to(:category) }
  end

  describe 'scopes' do
    describe '.active' do
      let!(:active_record) { create(:${input.scenario.toLowerCase().replace(/\s+/g, '_')}, active: true) }
      let!(:inactive_record) { create(:${input.scenario.toLowerCase().replace(/\s+/g, '_')}, active: false) }

      it 'returns only active records' do
        expect(described_class.active).to contain_exactly(active_record)
      end
    end
  end
end`;

    const explanation = `This model spec follows Better Specs guidelines:
- Uses \`subject\` with a descriptive name
- One expectation per test using \`it { is_expected.to }\` syntax
- Groups related tests with \`describe\` blocks
- Uses \`let!\` for data that needs to exist before the test
- Tests validations, associations, and scopes separately
- Uses FactoryBot for test data creation`;

    return { code, explanation };
  }

  private generateRequestSpec(input: any): { code: string; explanation: string } {
    const code = `# spec/requests/${input.scenario.toLowerCase().replace(/\s+/g, '_')}_spec.rb
RSpec.describe '${input.scenario}', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer \#{user.auth_token}" } }

  describe 'GET /api/resources' do
    context 'when authenticated' do
      let!(:resource) { create(:resource, user: user) }

      it 'returns success status' do
        get '/api/resources', headers: auth_headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns user resources' do
        get '/api/resources', headers: auth_headers
        expect(json_response).to include(
          hash_including('id' => resource.id)
        )
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized status' do
        get '/api/resources'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def json_response
    JSON.parse(response.body)
  end
end`;

    const explanation = `This request spec follows Better Specs guidelines:
- Tests both authenticated and unauthenticated scenarios
- Uses contexts to group related test cases
- One expectation per test for clear failure messages
- Uses \`let\` for lazy-loaded test data
- Tests HTTP status codes and response content separately
- Includes helper methods for common operations`;

    return { code, explanation };
  }

  private generateSystemSpec(input: any): { code: string; explanation: string } {
    const code = `# spec/system/${input.scenario.toLowerCase().replace(/\s+/g, '_')}_spec.rb
RSpec.describe '${input.scenario}', type: :system do
  let(:user) { create(:user) }

  before do
    sign_in user
  end

  context 'when user performs action' do
    it 'shows success message' do
      visit root_path
      click_link 'New Action'
      
      fill_in 'Name', with: 'Test Action'
      fill_in 'Description', with: 'Test description'
      click_button 'Create'

      expect(page).to have_content('Action was successfully created')
      expect(page).to have_content('Test Action')
    end
  end

  context 'when validation fails' do
    it 'shows error message' do
      visit root_path
      click_link 'New Action'
      
      click_button 'Create'

      expect(page).to have_content('Name can\\'t be blank')
      expect(current_path).to eq(new_action_path)
    end
  end
end`;

    const explanation = `This system spec follows Better Specs guidelines:
- Tests complete user workflows from the UI perspective
- Uses contexts to separate happy path from error cases
- Tests what the user actually sees and experiences
- Uses descriptive test names that explain the user action
- Includes both success and failure scenarios
- Focuses on behavior rather than implementation`;

    return { code, explanation };
  }

  private generateServiceSpec(input: any): { code: string; explanation: string } {
    const serviceName = this.extractServiceName(input.scenario);
    
    const code = `# spec/services/${serviceName.toLowerCase()}_spec.rb
RSpec.describe ${serviceName}, type: :service do
  subject(:service) { described_class.new(user) }
  
  let(:user) { create(:user) }

  describe '#call' do
    context 'when operation succeeds' do
      it 'returns success result' do
        result = service.call
        expect(result).to be_success
      end

      it 'performs expected action' do
        expect { service.call }.to change { user.reload.status }.to('processed')
      end
    end

    context 'when operation fails' do
      let(:user) { create(:user, :invalid_state) }

      it 'returns failure result' do
        result = service.call
        expect(result).to be_failure
      end

      it 'includes error message' do
        result = service.call
        expect(result.error).to include('Invalid state')
      end
    end
  end
end`;

    const explanation = `This service spec follows Better Specs guidelines:
- Uses \`subject\` to define the service instance
- Tests both success and failure scenarios
- Uses contexts to group related test cases
- Tests return values and side effects separately
- Uses descriptive test names that explain the behavior
- Focuses on the service's public interface`;

    return { code, explanation };
  }

  private generateJobSpec(input: any): { code: string; explanation: string } {
    const jobName = this.extractJobName(input.scenario);
    
    const code = `# spec/jobs/${jobName.toLowerCase()}_spec.rb
RSpec.describe ${jobName}, type: :job do
  let(:user) { create(:user) }

  describe '#perform' do
    it 'processes the job successfully' do
      expect { described_class.perform_now(user.id) }.not_to raise_error
    end

    it 'performs expected action' do
      expect(SomeService).to receive(:call).with(user)
      described_class.perform_now(user.id)
    end

    context 'when user does not exist' do
      it 'handles missing user gracefully' do
        expect { described_class.perform_now(999) }.not_to raise_error
      end
    end

    context 'when job fails' do
      before do
        allow(SomeService).to receive(:call).and_raise(StandardError, 'Service error')
      end

      it 'logs the error' do
        expect(Rails.logger).to receive(:error).with(/Service error/)
        described_class.perform_now(user.id)
      end
    end
  end
end`;

    const explanation = `This job spec follows Better Specs guidelines:
- Tests the job's \`perform\` method behavior
- Uses contexts to separate different scenarios
- Tests both success and error handling
- Uses mocking appropriately for external dependencies
- Tests error logging and graceful failure handling
- Focuses on the job's responsibility and side effects`;

    return { code, explanation };
  }

  private extractModelName(scenario: string): string {
    // Extract likely model name from scenario
    const words = scenario.split(' ');
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }

  private extractServiceName(scenario: string): string {
    // Convert scenario to service class name
    return scenario.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Service';
  }

  private extractJobName(scenario: string): string {
    // Convert scenario to job class name
    return scenario.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Job';
  }

  private getAppliedGuidelines(specType: string): string {
    const commonGuidelines = [
      '✅ **Expect syntax**: Uses modern `expect` syntax instead of deprecated `should`',
      '✅ **One expectation per test**: Each test focuses on a single behavior',
      '✅ **Descriptive names**: Test names clearly describe what is being tested',
      '✅ **Proper structure**: Uses `describe`/`context`/`it` hierarchy appropriately'
    ];

    const typeSpecificGuidelines: Record<string, string[]> = {
      model: [
        '✅ **Subject usage**: Uses `subject` for the model instance',
        '✅ **Grouped tests**: Separates validations, associations, and scopes',
        '✅ **Factory usage**: Uses FactoryBot for test data creation'
      ],
      request: [
        '✅ **Context usage**: Groups tests by authentication state',
        '✅ **HTTP testing**: Tests both status codes and response content',
        '✅ **Helper methods**: Includes helper for JSON parsing'
      ],
      system: [
        '✅ **User perspective**: Tests what users actually see and do',
        '✅ **Complete workflows**: Tests end-to-end user interactions',
        '✅ **Error scenarios**: Includes both success and failure paths'
      ],
      service: [
        '✅ **Service pattern**: Tests the service\'s public interface',
        '✅ **Result testing**: Tests both return values and side effects',
        '✅ **Error handling**: Includes failure scenario testing'
      ],
      job: [
        '✅ **Job testing**: Tests the perform method behavior',
        '✅ **Error handling**: Tests graceful failure and error logging',
        '✅ **Dependency mocking**: Uses mocks for external services appropriately'
      ]
    };

    const guidelines = [...commonGuidelines, ...(typeSpecificGuidelines[specType] || [])];
    return guidelines.join('\n');
  }
}
