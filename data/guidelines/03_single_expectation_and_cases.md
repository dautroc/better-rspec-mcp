---
title: "Single Expectation & Covering Cases"
category: expectations
tags: ["expectations", "single-expectation", "test-cases", "coverage", "isolation"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["contexts_and_descriptions", "expect_syntax_and_subject"]
---

# Single Expectation & Covering Cases

## One expectation per test (when isolated)
The 'one expectation' tip helps you find errors quickly and makes your code readable. Each test should specify one (and only one) behaviour in isolated unit specs.

**Good (isolated):**
```ruby
it { is_expected.to respond_with_content_type(:json) }
it { is_expected.to assign_to(:resource) }
```

Multiple expectations in the same example signal that you may be specifying multiple behaviours.

## Multiple expectations for integrated tests
In tests that integrate with a DB, external webservice, or end-to-end tests, you take a massive performance hit doing the same setup repeatedly. In these slower tests, it's fine to specify multiple related behaviours:

**Good (not isolated):**
```ruby
it 'creates a resource' do
  expect(response).to respond_with_content_type(:json)
  expect(response).to assign_to(:resource)
end
```

## Test all possible cases
Testing is good practice, but if you don't test edge cases, it won't be useful. Test valid, edge and invalid cases. As a rule of thumb, think of all possible inputs and test them.

Consider this action:
```ruby
before_action :find_owned_resources
before_action :find_resource

def destroy
  render 'show'
  @consumption.destroy
end
```

**Bad:**
```ruby
it 'shows the resource'
```

**Good:**
```ruby
describe '#destroy' do
  context 'when resource is found' do
    it 'responds with 200'
    it 'shows the resource'
  end

  context 'when resource is not found' do
    it 'responds with 404'
  end

  context 'when resource is not owned' do
    it 'responds with 404'
  end
end
```

## Examples of comprehensive test coverage

### Authentication method
```ruby
describe '.authenticate' do
  context 'with valid credentials' do
    it 'returns the user'
  end
  
  context 'with invalid email' do
    it 'returns nil'
  end
  
  context 'with invalid password' do
    it 'returns nil'
  end
  
  context 'with nil credentials' do
    it 'returns nil'
  end
end
```

### API endpoint
```ruby
describe 'POST /api/widgets' do
  context 'when authenticated' do
    context 'with valid params' do
      it 'creates the widget'
      it 'returns 201'
      it 'returns the widget data'
    end
    
    context 'with invalid params' do
      it 'returns 422'
      it 'returns validation errors'
    end
  end
  
  context 'when not authenticated' do
    it 'returns 401'
  end
end
```
