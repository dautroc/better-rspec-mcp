---
title: "Mocks, Stubs, and HTTP"
category: mocking
tags: ["mocks", "stubs", "http", "webmock", "vcr", "external-apis"]
priority: medium
lastUpdated: "2024-01-15"
relatedGuidelines: ["let_and_factories", "test_what_you_see"]
---

# Mocks, Stubs, and HTTP

## Mock sparingly - test real behaviour when possible
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

Over-mocking couples specs to implementation details and makes them brittle. Mock only when necessary.

## When to use mocks and stubs
Use stubs to simulate *truly external* boundaries:
- **HTTP requests** to external APIs
- **Time-dependent** behaviour
- **Random** values
- **File system** operations
- **Queue/job** systems

```ruby
# Time-dependent behaviour
allow(Time).to receive(:current).and_return(Time.parse('2023-01-01'))

# Random values
allow(SecureRandom).to receive(:uuid).and_return('fixed-id')

# External API calls
allow(PaymentGateway).to receive(:charge).and_return(success: true)
```

## Stubbing HTTP requests with WebMock
Sometimes you need to access external services. You can't rely on the real service, so stub it with WebMock:

```ruby
require 'webmock/rspec'

context 'with unauthorised access' do
  let(:uri) { 'http://api.lelylan.com/types' }
  
  before do
    stub_request(:get, uri).to_return(
      status: 401, 
      body: fixture('401.json')
    )
  end

  it 'gets a not authorised notification' do
    page.driver.get uri
    expect(page).to have_content 'Access denied'
  end
end
```

## More comprehensive WebMock examples

### Basic HTTP stubbing
```ruby
# Stub a successful API response
stub_request(:post, 'https://api.example.com/v1/widgets')
  .with(
    body: { name: 'Gizmo' }.to_json,
    headers: { 'Content-Type' => 'application/json' }
  )
  .to_return(
    status: 201,
    body: { id: 123, name: 'Gizmo' }.to_json,
    headers: { 'Content-Type' => 'application/json' }
  )

expect { WidgetClient.create('Gizmo') }.not_to raise_error
```

### Pattern matching URLs
```ruby
# Stub any request to the API domain
stub_request(:any, %r{https://api\.example\.com/.*})
  .to_return(status: 503, body: 'Service Unavailable')
```

### Using fixtures for response bodies
```ruby
# spec/fixtures/api_responses/widget_created.json
stub_request(:post, 'https://api.example.com/widgets')
  .to_return(
    status: 201,
    body: file_fixture('api_responses/widget_created.json').read,
    headers: { 'Content-Type' => 'application/json' }
  )
```

## VCR for recording real HTTP interactions
For more complex scenarios, consider using VCR to record real HTTP interactions:

```ruby
# spec/spec_helper.rb
require 'vcr'

VCR.configure do |config|
  config.cassette_library_dir = 'spec/vcr_cassettes'
  config.hook_into :webmock
end

# In your spec
VCR.use_cassette('widget_api') do
  response = WidgetClient.fetch_all
  expect(response).to be_successful
end
```

## Testing error conditions
Don't forget to test how your code handles external service failures:

```ruby
context 'when external API is down' do
  before do
    stub_request(:post, 'https://api.example.com/widgets')
      .to_timeout
  end

  it 'raises a timeout error' do
    expect { WidgetClient.create('Gizmo') }.to raise_error(Net::TimeoutError)
  end
end

context 'when external API returns error' do
  before do
    stub_request(:post, 'https://api.example.com/widgets')
      .to_return(status: 500, body: 'Internal Server Error')
  end

  it 'handles the error gracefully' do
    expect { WidgetClient.create('Gizmo') }.to raise_error(WidgetClient::ServerError)
  end
end
```
