---
title: "Shared Examples & Readable Matchers"
category: shared-examples
tags: ["shared-examples", "matchers", "dry", "reusability", "custom-matchers"]
priority: medium
lastUpdated: "2024-01-15"
relatedGuidelines: ["let_and_factories", "test_what_you_see"]
---

# Shared Examples & Readable Matchers

## Shared examples reduce duplication
Making tests is great and you get more confident day after day. But eventually you'll start to see code duplication everywhere. Use shared examples to DRY your test suite up.

**Bad:**
```ruby
describe 'GET /devices' do
  let!(:resource) { FactoryBot.create :device, created_from: user.id }
  let!(:uri)      { '/devices' }

  context 'when shows all resources' do
    let!(:not_owned) { FactoryBot.create factory }

    it 'shows all owned resources' do
      page.driver.get uri
      expect(page.status_code).to be(200)
      contains_owned_resource resource
      does_not_contain_resource not_owned
    end
  end

  describe '?start=:uri' do
    it 'shows the next page' do
      page.driver.get uri, start: resource.uri
      expect(page.status_code).to be(200)
      contains_resource resources.first
      expect(page).to_not have_content resource.id.to_s
    end
  end
end
```

**Good:**
```ruby
describe 'GET /devices' do
  let!(:resource) { FactoryBot.create :device, created_from: user.id }
  let!(:uri)       { '/devices' }

  it_behaves_like 'a listable resource'
  it_behaves_like 'a paginable resource'
  it_behaves_like 'a searchable resource'
  it_behaves_like 'a filterable list'
end
```

## Creating shared examples
Shared examples are used mainly for controllers, since models are usually quite different from each other:

```ruby
# spec/support/shared_examples/listable_resource.rb
RSpec.shared_examples 'a listable resource' do
  it 'returns only owned resources' do
    get uri
    expect(response).to have_http_status(:ok)
    expect(json_response).to include(resource.as_json)
    expect(json_response).not_to include(not_owned_resource.as_json)
  end
end

# spec/support/shared_examples/paginable_resource.rb
RSpec.shared_examples 'a paginable resource' do
  context 'with pagination params' do
    it 'returns paginated results' do
      get uri, params: { page: 1, per_page: 10 }
      expect(response).to have_http_status(:ok)
      expect(json_response['meta']).to include('current_page' => 1)
    end
  end
end
```

## Parameterised shared examples
You can pass parameters to shared examples:

```ruby
# spec/support/shared_examples/api_authentication.rb
RSpec.shared_examples 'requires authentication' do |http_method, endpoint|
  context 'when not authenticated' do
    it 'returns 401' do
      send(http_method, endpoint)
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

# Usage in specs
describe 'GET /api/widgets' do
  it_behaves_like 'requires authentication', :get, '/api/widgets'
end

describe 'POST /api/widgets' do
  it_behaves_like 'requires authentication', :post, '/api/widgets'
end
```

## Shared contexts for common setup
Use shared contexts for common setup that multiple specs need:

```ruby
# spec/support/shared_contexts/authenticated_user.rb
RSpec.shared_context 'with authenticated user' do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{user.auth_token}" } }
  
  before do
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
  end
end

# Usage
describe 'Protected API endpoints' do
  include_context 'with authenticated user'
  
  it 'allows access to protected resources' do
    get '/api/profile', headers: auth_headers
    expect(response).to have_http_status(:ok)
  end
end
```

## Prefer readable matchers
Use RSpec's expressive matchers for better readability:

```ruby
# Basic matchers
expect(user).to be_valid
expect(user.errors).to be_empty
expect(response).to have_http_status(:ok)
expect(json).to include('name' => 'Gizmo')

# Collection matchers
expect(users).to contain_exactly(user1, user2)
expect(users).to all(be_valid)
expect(users.map(&:name)).to match_array(['Alice', 'Bob'])

# Change matchers
expect { user.save! }.to change(User, :count).by(1)
expect { user.destroy }.to change { user.reload.deleted_at }.from(nil)

# Error matchers
expect { invalid_operation }.to raise_error(StandardError)
expect { user.save! }.to raise_error(ActiveRecord::RecordInvalid)

# Output matchers
expect { puts 'hello' }.to output("hello\n").to_stdout
expect { warn 'danger' }.to output(/danger/).to_stderr
```

## Custom matchers for domain-specific assertions
Create custom matchers for complex or repeated assertions:

```ruby
# spec/support/matchers/be_a_valid_email.rb
RSpec::Matchers.define :be_a_valid_email do
  match do |email|
    email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
  end
  
  failure_message do |email|
    "expected '#{email}' to be a valid email address"
  end
end

# Usage
expect(user.email).to be_a_valid_email
```

## Combining shared examples with let
```ruby
RSpec.shared_examples 'a timestamped model' do
  it { is_expected.to respond_to(:created_at) }
  it { is_expected.to respond_to(:updated_at) }
  
  describe 'on creation' do
    it 'sets created_at' do
      expect { subject.save! }.to change(subject, :created_at).from(nil)
    end
  end
end

# Usage with different models
RSpec.describe User do
  subject { build(:user) }
  it_behaves_like 'a timestamped model'
end

RSpec.describe Post do
  subject { build(:post) }
  it_behaves_like 'a timestamped model'
end
```
