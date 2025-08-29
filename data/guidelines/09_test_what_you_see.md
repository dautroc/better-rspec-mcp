---
title: "Test What You See"
category: organization
tags: ["integration", "behavior", "controllers", "system-tests", "real-behavior"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["single_expectation_and_cases", "shared_examples_and_matchers"]
---

# Test What You See

## Focus on integration tests and real behaviour
Deeply test your models and your application behaviour (integration tests). Don't add useless complexity testing controllers.

When first starting with testing, many developers test controllers extensively. Now the recommendation is different: focus on integration tests using RSpec and Capybara. Why? Because you should **test what you see** and because testing controllers is an extra step you won't usually need.

## Models vs Controllers vs Integration
You'll find that most of your tests go into:
1. **Models** - business logic, validations, scopes
2. **Integration tests** - user-facing behaviour, API endpoints
3. **System tests** - full user journeys

Controller tests often test implementation details rather than behaviour.

## The integration approach
**Bad (controller testing):**
```ruby
# spec/controllers/widgets_controller_spec.rb
RSpec.describe WidgetsController do
  describe 'GET #index' do
    it 'assigns @widgets' do
      widgets = [create(:widget)]
      get :index
      expect(assigns(:widgets)).to eq(widgets)
    end
    
    it 'renders index template' do
      get :index
      expect(response).to render_template(:index)
    end
  end
end
```

**Good (integration testing):**
```ruby
# spec/requests/widgets_spec.rb
RSpec.describe 'Widgets', type: :request do
  describe 'GET /widgets' do
    let!(:widget) { create(:widget, name: 'Gizmo') }
    
    it 'shows the widgets list' do
      get '/widgets'
      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Gizmo')
    end
  end
end
```

## System tests for user journeys
Test complete user workflows with system tests:

```ruby
# spec/system/widget_management_spec.rb
RSpec.describe 'Widget management', type: :system do
  let(:user) { create(:user) }
  
  before { sign_in user }
  
  it 'allows creating a new widget' do
    visit widgets_path
    click_link 'New Widget'
    
    fill_in 'Name', with: 'Super Gizmo'
    fill_in 'Description', with: 'An amazing gadget'
    click_button 'Create Widget'
    
    expect(page).to have_content('Widget was successfully created')
    expect(page).to have_content('Super Gizmo')
    expect(Widget.last.name).to eq('Super Gizmo')
  end
end
```

## When to use each type of test

### Model specs - Always
Test business logic, validations, scopes, and methods:
```ruby
RSpec.describe User do
  it { is_expected.to validate_presence_of(:email) }
  
  describe '.active' do
    it 'returns only active users' do
      # Test the scope logic
    end
  end
end
```

### Request specs - For APIs and key flows
Test HTTP endpoints and their responses:
```ruby
RSpec.describe 'API::Widgets' do
  describe 'POST /api/widgets' do
    context 'with valid params' do
      it 'creates widget and returns 201' do
        # Test the full HTTP interaction
      end
    end
  end
end
```

### System specs - For critical user journeys
Test what users actually see and do:
```ruby
RSpec.describe 'User registration' do
  it 'allows new user to sign up' do
    # Test the complete user flow
  end
end
```

### Controller specs - Rarely needed
Only when you need to test specific controller behaviour that can't be covered by integration tests:
```ruby
# Only if you need to test specific controller logic
RSpec.describe WidgetsController do
  describe '#complex_calculation' do
    # Test controller-specific logic that's hard to test via integration
  end
end
```

## Coverage considerations
This approach provides better coverage because:
- **Integration tests** catch more bugs than unit tests alone
- **System tests** verify the complete user experience
- **Model tests** ensure business logic is solid
- You avoid testing implementation details that might change

## Addressing common concerns

### "Integration tests don't cover all use cases"
**False.** You can easily cover all use cases with integration tests. Structure them with proper contexts:

```ruby
describe 'POST /widgets' do
  context 'when authenticated' do
    context 'with valid params' do
      # Happy path
    end
    
    context 'with invalid params' do
      # Validation errors
    end
  end
  
  context 'when not authenticated' do
    # Auth errors
  end
end
```

### "Integration tests are slow"
**Partially true, but manageable.** You can run single file specs using automated tools like Guard, so you run only the specs you need during development, blazing fast without stopping your flow.

Use focused test runs during development:
```bash
# Run specific file
rspec spec/requests/widgets_spec.rb

# Run specific test
rspec spec/requests/widgets_spec.rb:15

# Run tests matching pattern
rspec --tag focus
```

## Shared examples for integration tests
Integration tests can be easily grouped into shared examples:

```ruby
# spec/support/shared_examples/api_resource.rb
RSpec.shared_examples 'an API resource' do |resource_name|
  let(:resource_path) { "/api/#{resource_name.pluralize}" }
  
  describe "GET #{resource_path}" do
    it_behaves_like 'requires authentication'
    it_behaves_like 'returns paginated results'
  end
  
  describe "POST #{resource_path}" do
    it_behaves_like 'requires authentication'
    it_behaves_like 'validates required fields'
  end
end

# Usage
RSpec.describe 'Widgets API' do
  it_behaves_like 'an API resource', 'widget'
end
```

This approach builds a clear and readable test suite focused on behaviour rather than implementation.
