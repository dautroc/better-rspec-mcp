---
title: "Describe & Naming"
category: naming
tags: ["describe", "naming", "methods", "classes", "documentation"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["contexts_and_descriptions", "expect_syntax_and_subject"]
---

# Describe & Naming

## Describe the exact method or class
Use Ruby's documentation convention to disambiguate targets clearly:

**Bad:**
```ruby
describe 'the authenticate method for User' do
describe 'if the user is an admin' do
```

**Good:**
```ruby
describe '.authenticate' do  # class method (or ::authenticate)
describe '#admin?' do        # instance method
```

This follows Ruby documentation standards and makes it immediately clear what you're testing.

## Keep `it` descriptions short and active
Use present tense, third person. Avoid "should" in descriptions.

**Bad:**
```ruby
it 'should not change timings' do
it 'should have 422 status code if an unexpected params will be added' do
```

**Good:**
```ruby
it 'does not change timings' do
it 'returns 422 when params are invalid' do
```

## Split long descriptions with contexts
If a description grows past ~40 characters, split it using a context:

**Bad:**
```ruby
it 'has 422 status code if an unexpected params will be added' do
```

**Good:**
```ruby
context 'when params are invalid' do
  it { is_expected.to respond_with 422 }
end
```

When you run this test with `rspec filename`, you get readable output:
```
when params are invalid
  it should respond with 422
```

## Example: Complete method specification
```ruby
RSpec.describe User do
  describe '.authenticate' do
    context 'when credentials are valid' do
      it 'returns the user'
    end
    
    context 'when credentials are invalid' do
      it 'returns nil'
    end
  end
  
  describe '#admin?' do
    context 'when user has admin role' do
      it { is_expected.to be_truthy }
    end
    
    context 'when user has regular role' do
      it { is_expected.to be_falsey }
    end
  end
end
```
