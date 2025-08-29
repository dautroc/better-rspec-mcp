---
title: "Expect Syntax, is_expected, and subject"
category: expectations
tags: ["expect", "syntax", "subject", "is_expected", "should"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["describe_naming", "let_usage"]
---

# `expect` Syntax, `is_expected`, and `subject`

## Prefer `expect` over `should`
On new projects, always use the `expect` syntax.

**Bad:**
```ruby
it 'creates a resource' do
  response.should respond_with_content_type(:json)
end
```

**Good:**
```ruby
it 'creates a resource' do
  expect(response).to respond_with_content_type(:json)
end
```

## Configure RSpec to enforce expect syntax
Configure RSpec to only accept the new syntax on new projects, to avoid having both syntaxes throughout your codebase:

```ruby
# spec/spec_helper.rb
RSpec.configure do |config|
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
end
```

## Use `is_expected` for one-liners
On one-line expectations or with implicit subject, use `is_expected.to`:

**Bad:**
```ruby
context 'when not valid' do
  it { should respond_with 422 }
end
```

**Good:**
```ruby
context 'when not valid' do
  it { is_expected.to respond_with 422 }
end
```

## `subject` for the thing under specification
Use `subject` to DRY repeated expectations against the same object:

**Bad:**
```ruby
it { expect(assigns('message')).to match /it was born in Belville/ }
```

**Good:**
```ruby
subject { assigns('message') }
it { is_expected.to match /it was born in Billville/ }
```

## Named subjects for clarity
RSpec allows named subjects for better readability:

```ruby
subject(:hero) { Hero.first }

it 'carries a sword' do
  expect(hero.equipment).to include('sword')
end
```

## Migration from should to expect
For existing projects, use the [transpec](https://github.com/yujinakayama/transpec) gem to convert from should to expect syntax:

```bash
gem install transpec
transpec
```

This automatically converts your specs to use the modern expect syntax.

## Complete example
```ruby
RSpec.describe User do
  subject(:user) { build(:user, email: 'test@example.com') }
  
  it { is_expected.to be_valid }
  it { is_expected.to respond_to(:admin?) }
  
  describe '#full_name' do
    subject { user.full_name }
    
    context 'when first and last name are present' do
      let(:user) { build(:user, first_name: 'John', last_name: 'Doe') }
      it { is_expected.to eq('John Doe') }
    end
  end
end
```
