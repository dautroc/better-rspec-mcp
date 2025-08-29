---
title: "Contexts & Descriptions"
category: organization
tags: ["context", "descriptions", "conditions", "edge-cases", "organization"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["describe_and_naming", "single_expectation_and_cases"]
---

# Contexts & Descriptions

## Use `context` blocks for conditions
Contexts are a powerful method to make your tests clear and well organised. Start contexts with **when/with/without** to clarify preconditions:

**Bad:**
```ruby
it 'has 200 status code if logged in' do
  expect(response).to respond_with 200
end

it 'has 401 status code if not logged in' do
  expect(response).to respond_with 401
end
```

**Good:**
```ruby
context 'when logged in' do
  it { is_expected.to respond_with 200 }
end

context 'when logged out' do
  it { is_expected.to respond_with 401 }
end
```

## Test all possible cases
Testing is good practice, but if you don't test edge cases, it won't be useful. Test valid, edge and invalid cases.

Consider this destroy action:
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

## Context naming patterns
Use consistent patterns for context descriptions:

```ruby
describe '#calculate_total' do
  context 'when cart is empty' do
    it 'returns zero'
  end
  
  context 'when cart has items' do
    it 'sums item prices'
  end
  
  context 'with discount applied' do
    it 'reduces total by discount amount'
  end
  
  context 'without valid payment method' do
    it 'raises payment error'
  end
end
```

This structure makes intent explicit, reduces duplication, and helps you think through all the scenarios your code should handle.
