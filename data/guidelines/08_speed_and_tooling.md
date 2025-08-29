---
title: "Speed, Feedback, and Tooling"
category: performance
tags: ["speed", "performance", "guard", "tooling", "feedback", "automation"]
priority: medium
lastUpdated: "2024-01-15"
relatedGuidelines: ["configuration_and_setup", "test_what_you_see"]
---

# Speed, Feedback, and Tooling

## Automatic tests with Guard
Running all the test suite every time you change your app can be cumbersome. It takes a lot of time and can break your flow. With Guard you can automate your test suite, running only the tests related to the updated spec, model, controller or file you are working on.

```bash
bundle exec guard
```

Here's a sample Guardfile with some basic reloading rules:

```ruby
guard 'rspec', cli: '--drb --format Fuubar --color', version: 2 do
  # run every updated spec file
  watch(%r{^spec/.+_spec\.rb$})
  # run the lib specs when a file in lib/ changes
  watch(%r{^lib/(.+)\.rb$}) { |m| "spec/lib/#{m[1]}_spec.rb" }
  # run the model specs related to the changed model
  watch(%r{^app/(.+)\.rb$}) { |m| "spec/#{m[1]}_spec.rb" }
  # run the view specs related to the changed view
  watch(%r{^app/(.*)(\.erb|\.haml)$}) { |m| "spec/#{m[1]}#{m[2]}_spec.rb" }
  # run the integration specs related to the changed controller
  watch(%r{^app/controllers/(.+)\.rb}) { |m| "spec/requests/#{m[1]}_spec.rb" }
  # run all integration tests when application controller changes
  watch('app/controllers/application_controller.rb') { "spec/requests" }
end
```

Guard is a fine tool but doesn't fit all needs. Sometimes your TDD workflow works best with a keybinding that makes it easy to run just the examples you want. You can use a rake task to run the entire suite before pushing code.

## Faster tests (preloading Rails)
When running a test on Rails, the whole Rails app is loaded. This can take time and break your development flow. Use solutions like **Zeus**, **Spin** or **Spork** to solve this problem. These solutions preload all libraries you usually don't change and reload controllers, models, views, factories and files you change most often.

### Using Spork
Here's a spec helper configuration based on Spork:

```ruby
# spec/spec_helper.rb
require 'spork'

Spork.prefork do
  ENV["RAILS_ENV"] ||= 'test'
  require File.expand_path("../../config/environment", __FILE__)
  require 'rspec/rails'
  
  # Requires supporting ruby files with custom matchers and macros, etc,
  # in spec/support/ and its subdirectories.
  Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}
  
  RSpec.configure do |config|
    config.mock_with :rspec
    config.use_transactional_fixtures = true
    config.infer_base_class_for_anonymous_controllers = false
  end
end

Spork.each_run do
  # This code will be run each time you run your specs.
  FactoryBot.reload
end
```

### Using Zeus
Zeus takes a less aggressive approach than Spork. Here's a Guardfile configuration for Zeus:

```ruby
guard 'rspec', zeus: true do
  watch(%r{^spec/.+_spec\.rb$})
  watch(%r{^app/(.+)\.rb$}) { |m| "spec/#{m[1]}_spec.rb" }
  watch(%r{^lib/(.+)\.rb$}) { |m| "spec/lib/#{m[1]}_spec.rb" }
end
```

You'll need to run `zeus start` in a console before running your tests. Zeus requires Ruby 1.9.3+ and an operating system that supports FSEvents or inotify.

**Note:** Many criticisms are directed at these solutions. They're often considered band-aids on a problem better solved through better design and being intentional about only loading the dependencies you need.

## Useful formatter
Use a formatter that can give you useful information about the test suite. **Fuubar** is particularly nice:

```ruby
# Gemfile
group :development, :test do
  gem 'fuubar'
end

# .rspec configuration file
--drb
--format Fuubar
--color
```

Other useful formatters:
- **Documentation**: Shows nested describe/context structure
- **Progress**: Simple dots for quick feedback
- **JSON**: For CI/CD integration

## Output & formatters
Prefer a simple, readable formatter and keep output deterministic. Avoid formatters that add unnecessary noise or randomness to your test output.

## Coverage & linting (recommended)
- **SimpleCov** for coverage tracking (track trends; avoid chasing 100% mindlessly)
- **RuboCop + rubocop-rspec** to enforce layout and idioms
- **Database Cleaner** for reliable test isolation

```ruby
# Gemfile
group :test do
  gem 'simplecov', require: false
  gem 'database_cleaner-active_record'
end

group :development, :test do
  gem 'rubocop-rspec'
end
```

## Continuous testing workflow
Set up your development environment for continuous feedback:

1. **Guard** for automatic test running
2. **Fast test suite** with proper preloading
3. **Focused runs** during development (`rspec spec/models/user_spec.rb`)
4. **Full suite** before commits (`rake spec`)
5. **CI/CD integration** for pull requests

## Performance tips
- **Database**: Use `build` instead of `create` when persistence isn't needed
- **Factories**: Keep them minimal; use traits for variations
- **Transactional fixtures**: Faster than database cleaning between tests
- **Parallel testing**: Use `parallel_tests` gem for multi-core utilisation
- **Selective loading**: Only load what you need in `spec_helper.rb`

```ruby
# Fast model spec
RSpec.describe User, type: :model do
  subject { build(:user) }  # build, don't create
  
  it { is_expected.to be_valid }
end

# Parallel testing
# Run with: bundle exec parallel_rspec spec/
```
