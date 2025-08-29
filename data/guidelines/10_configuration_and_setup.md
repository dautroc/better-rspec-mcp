---
title: "Configuration and Setup"
category: configuration
tags: ["configuration", "setup", "spec-helper", "rails-helper", "gemfile"]
priority: high
lastUpdated: "2024-01-15"
relatedGuidelines: ["expect_syntax_and_subject", "speed_and_tooling"]
---

# Configuration and Setup

## RSpec configuration best practices
Set up RSpec to enforce Better Specs guidelines from the start.

### Basic spec_helper.rb configuration
```ruby
# spec/spec_helper.rb
RSpec.configure do |config|
  # Use expect syntax only (no should)
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
  
  # Disable monkey patching
  config.disable_monkey_patching!
  
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = ".rspec_status"
  
  # Limit to one failure to get fast feedback
  config.fail_fast = 1
  
  # Use documentation format for better output
  config.default_formatter = 'doc' if config.files_to_run.one?
  
  # Print the slowest examples
  config.profile_examples = 10
  
  # Run specs in random order to surface order dependencies
  config.order = :random
  Kernel.srand config.seed
end
```

### Rails-specific configuration
```ruby
# spec/rails_helper.rb
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'

# Add additional requires below this line. Rails is not loaded until this point!
require 'capybara/rails'
require 'webmock/rspec'

# Requires supporting ruby files with custom matchers and macros, etc
Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }

# Checks for pending migrations and applies them before tests are run
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # Use transactional fixtures
  config.use_transactional_fixtures = true
  
  # Infer spec type from file location
  config.infer_spec_type_from_file_location!
  
  # Filter lines from Rails gems in backtraces
  config.filter_rails_from_backtrace!
  
  # Include FactoryBot methods
  config.include FactoryBot::Syntax::Methods
  
  # Include request helpers
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include Devise::Test::ControllerHelpers, type: :controller
  
  # Clean database between tests
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end
  
  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end
```

## .rspec configuration file
```ruby
# .rspec
--require spec_helper
--format documentation
--color
--fail-fast
--order random
```

## Gemfile setup
```ruby
# Gemfile
group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'pry-byebug'
  gem 'rubocop-rspec'
end

group :test do
  gem 'capybara'
  gem 'selenium-webdriver'
  gem 'webmock'
  gem 'vcr'
  gem 'simplecov', require: false
  gem 'database_cleaner-active_record'
  gem 'shoulda-matchers'
  gem 'timecop'
end

group :development do
  gem 'guard-rspec'
  gem 'fuubar'  # Better progress formatter
end
```

## Directory structure
```
spec/
├── rails_helper.rb
├── spec_helper.rb
├── factories/
│   ├── users.rb
│   └── widgets.rb
├── fixtures/
│   └── files/
├── support/
│   ├── shared_examples/
│   │   ├── api_resource.rb
│   │   └── listable_resource.rb
│   ├── shared_contexts/
│   │   └── authenticated_user.rb
│   ├── matchers/
│   │   └── custom_matchers.rb
│   └── helpers/
│       └── request_helpers.rb
├── models/
├── requests/
├── system/
├── services/
└── jobs/
```

## Factory setup
```ruby
# spec/support/factory_bot.rb
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  
  # Lint factories in development
  config.before(:suite) do
    if Rails.env.development?
      FactoryBot.lint
    end
  end
end
```

## Shoulda matchers configuration
```ruby
# spec/support/shoulda_matchers.rb
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

## SimpleCov configuration
```ruby
# spec/spec_helper.rb (at the very top)
if ENV['COVERAGE']
  require 'simplecov'
  SimpleCov.start 'rails' do
    add_filter '/spec/'
    add_filter '/config/'
    add_filter '/vendor/'
    
    add_group 'Controllers', 'app/controllers'
    add_group 'Models', 'app/models'
    add_group 'Services', 'app/services'
    add_group 'Jobs', 'app/jobs'
    
    minimum_coverage 80
  end
end
```

## WebMock configuration
```ruby
# spec/support/webmock.rb
require 'webmock/rspec'

WebMock.disable_net_connect!(allow_localhost: true)

RSpec.configure do |config|
  config.before(:each) do
    WebMock.reset!
  end
end
```

## VCR configuration
```ruby
# spec/support/vcr.rb
require 'vcr'

VCR.configure do |config|
  config.cassette_library_dir = 'spec/vcr_cassettes'
  config.hook_into :webmock
  config.configure_rspec_metadata!
  config.allow_http_connections_when_no_cassette = false
  
  # Filter sensitive data
  config.filter_sensitive_data('<API_KEY>') { ENV['API_KEY'] }
  config.filter_sensitive_data('<SECRET_TOKEN>') { ENV['SECRET_TOKEN'] }
end

# Usage in specs:
# it 'calls external API', :vcr do
#   # Test that uses external API
# end
```

## Capybara configuration
```ruby
# spec/support/capybara.rb
require 'capybara/rails'
require 'capybara/rspec'

Capybara.configure do |config|
  config.default_driver = :rack_test
  config.javascript_driver = :selenium_chrome_headless
  config.default_max_wait_time = 5
  config.ignore_hidden_elements = true
end

# Custom driver for debugging
Capybara.register_driver :selenium_chrome_debug do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--disable-web-security')
  options.add_argument('--allow-running-insecure-content')
  
  Capybara::Selenium::Driver.new(
    app,
    browser: :chrome,
    options: options
  )
end
```

## Guard configuration
```ruby
# Guardfile
guard :rspec, cmd: 'bundle exec rspec' do
  require 'guard/rspec/dsl'
  dsl = Guard::RSpec::Dsl.new(self)

  # RSpec files
  rspec = dsl.rspec
  watch(rspec.spec_helper) { rspec.spec_dir }
  watch(rspec.spec_support) { rspec.spec_dir }
  watch(rspec.spec_files)

  # Ruby files
  ruby = dsl.ruby
  dsl.watch_spec_files_for(ruby.lib_files)

  # Rails files
  rails = dsl.rails(view_extensions: %w(erb haml slim))
  dsl.watch_spec_files_for(rails.app_files)
  dsl.watch_spec_files_for(rails.views)

  watch(rails.controllers) do |m|
    [
      rspec.spec.call("routing/#{m[1]}_routing"),
      rspec.spec.call("controllers/#{m[1]}_controller"),
      rspec.spec.call("acceptance/#{m[1]}")
    ]
  end

  # Capybara features specs
  watch(rails.view_dirs) { |m| rspec.spec.call("features/#{m[1]}") }
  watch(rails.layouts) { rspec.spec.call('features') }

  # Turnip features and steps
  watch(%r{^spec/acceptance/(.+)\.feature$})
  watch(%r{^spec/acceptance/steps/(.+)_steps\.rb$}) do |m|
    Dir[File.join("**/#{m[1]}.feature")][0] || 'spec/acceptance'
  end
end
```

## Custom matchers example
```ruby
# spec/support/matchers/be_a_valid_email.rb
RSpec::Matchers.define :be_a_valid_email do
  match do |email|
    email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
  end
  
  failure_message do |email|
    "expected '#{email}' to be a valid email address"
  end
  
  failure_message_when_negated do |email|
    "expected '#{email}' not to be a valid email address"
  end
  
  description do
    'be a valid email address'
  end
end
```

## Rake tasks for testing
```ruby
# lib/tasks/spec.rake
if Rails.env.development? || Rails.env.test?
  require 'rspec/core/rake_task'
  
  RSpec::Core::RakeTask.new(:spec)
  
  namespace :spec do
    desc 'Run model specs'
    RSpec::Core::RakeTask.new(:models) do |t|
      t.pattern = 'spec/models/**/*_spec.rb'
    end
    
    desc 'Run request specs'
    RSpec::Core::RakeTask.new(:requests) do |t|
      t.pattern = 'spec/requests/**/*_spec.rb'
    end
    
    desc 'Run system specs'
    RSpec::Core::RakeTask.new(:system) do |t|
      t.pattern = 'spec/system/**/*_spec.rb'
    end
  end
  
  task default: :spec
end
```

This configuration provides a solid foundation for following Better Specs guidelines while maintaining fast, reliable tests.
