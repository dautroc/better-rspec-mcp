---
title: "let / let! and Data Setup"
category: data-setup
tags: ["let", "let!", "factories", "data-setup", "lazy-loading", "memoization"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["expect_syntax_and_subject", "mocks_and_http_stubs"]
---

# `let` / `let!` and Data Setup

## Use `let` instead of instance variables
When you need to assign a variable, use `let` instead of a `before` block to create an instance variable. `let` lazily loads only when used the first time in the test and gets cached until that specific test is finished.

**Bad:**
```ruby
describe '#type_id' do
  before { @resource = FactoryBot.create :device }
  before { @type     = Type.find @resource.type_id }

  it 'sets the type_id field' do
    expect(@resource.type_id).to eq(@type.id)
  end
end
```

**Good:**
```ruby
describe '#type_id' do
  let(:resource) { FactoryBot.create :device }
  let(:type)     { Type.find resource.type_id }

  it 'sets the type_id field' do
    expect(resource.type_id).to eq(type.id)
  end
end
```

## Use `let` for lazy-loaded actions
Use `let` to initialise actions that are lazy loaded to test your specs:

```ruby
context 'when updates a not existing property value' do
  let(:properties) { { id: Settings.resource_id, value: 'on'} }

  def update
    resource.properties = properties
  end

  it 'raises a not found error' do
    expect { update }.to raise_error Mongoid::Errors::DocumentNotFound
  end
end
```

## Understanding `let` vs `let!`
`let` is lazy and memoised. Here's what `let` actually does:

```ruby
# This use of let:
let(:foo) { Foo.new }

# Is very nearly equivalent to this:
def foo
  @foo ||= Foo.new
end
```

Use `let!` for eager creation when you need the variable to exist before the test runs (e.g., seeding relations for a query spec):

```ruby
describe '.active_users' do
  let!(:active_user)   { create(:user, active: true) }
  let!(:inactive_user) { create(:user, active: false) }
  
  it 'returns only active users' do
    expect(User.active_users).to contain_exactly(active_user)
  end
end
```

## Create only the data you need
Heavy factories slow suites and hide intent. Keep factories minimal and use traits for optional branches:

**Good factory design:**
```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email { 'test@example.com' }
    name  { 'Test User' }
    
    trait :admin do
      role { 'admin' }
    end
    
    trait :with_posts do
      after(:create) do |user|
        create_list(:post, 3, author: user)
      end
    end
  end
end
```

**Usage:**
```ruby
let(:user)       { create(:user) }
let(:admin)      { create(:user, :admin) }
let(:author)     { create(:user, :with_posts) }
```

## Prefer FactoryBot over fixtures
FactoryBot provides better control and readability than Rails fixtures:

- **Explicit**: You can see exactly what data is being created
- **Flexible**: Easy to customise with traits and overrides
- **Maintainable**: Changes to models don't break unrelated tests

## Mock or not to mock
As a general rule, don't (over)use mocks and test real behaviour when possible. Testing real cases is useful when validating your application flow.

**Good:**
```ruby
# Simulate a not found resource
context 'when not found' do
  before do
    allow(Resource).to receive(:where).with(created_from: user.id)
                                      .and_return(Resource.none)
  end

  it { is_expected.to respond_with 404 }
end
```
