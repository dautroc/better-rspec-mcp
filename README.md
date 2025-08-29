# Better RSpec MCP Server

A Model Context Protocol (MCP) server that provides comprehensive RSpec guidance, examples, and best practices based on [Better Specs](https://www.betterspecs.org) guidelines.

## Overview

This MCP server enables AI assistants to access structured RSpec knowledge and provide intelligent testing guidance. It includes tools for generating examples, validating code, getting configuration help, and accessing comprehensive Better Specs guidelines.

## Features

### 🛠️ Tools
- **`get_rspec_guidance`** - Get Better Specs guidance for specific topics
- **`generate_spec_example`** - Generate RSpec examples following best practices
- **`validate_spec_code`** - Validate RSpec code against Better Specs guidelines
- **`get_rspec_configuration`** - Get configuration templates and setup guidance

### 📚 Resources
- **Better Specs Guidelines** - Complete collection of guidelines by category
- **Code Examples Library** - Comprehensive examples for different spec types
- **Anti-patterns Database** - Common mistakes and how to avoid them
- **Configuration Templates** - Ready-to-use RSpec configurations
- **Cheatsheet** - Quick reference for Better Specs principles

### 💬 Prompts
- **Code Review** - Comprehensive RSpec code review templates
- **Test Planning** - Templates for planning comprehensive test coverage
- **Refactoring** - Guidance for improving existing test suites
- **Project Setup** - Complete setup guides for new RSpec projects

## Installation

### Prerequisites
- Node.js 18+

### Quick Setup (Recommended)

**Using npx (no installation required):**

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "better-rspec": {
      "command": "npx",
      "args": ["--yes", "better-rspec-mcp@latest"]
    }
  }
}
```

### Alternative: Local Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd better-rspec-mcp
npm install
```

2. **Build the project:**
```bash
npm run build
```

3. **Configure MCP client:**

```json
{
  "mcpServers": {
    "better-rspec": {
      "command": "node",
      "args": ["/path/to/better-rspec-mcp/dist/index.js"]
    }
  }
}
```

## Usage

### Getting RSpec Guidance

```typescript
// Get guidance on specific topics
await callTool('get_rspec_guidance', {
  topic: 'let vs before blocks',
  category: 'data-setup',
  includeExamples: true
});
```

### Generating Examples

```typescript
// Generate spec examples
await callTool('generate_spec_example', {
  specType: 'model',
  scenario: 'user validation',
  style: 'comprehensive'
});
```

### Validating Code

```typescript
// Validate existing RSpec code
await callTool('validate_spec_code', {
  code: `describe User do
    it 'should be valid' do
      user.should be_valid
    end
  end`,
  returnSuggestions: true
});
```

### Getting Configuration Help

```typescript
// Get configuration templates
await callTool('get_rspec_configuration', {
  type: 'spec_helper',
  projectType: 'rails',
  features: ['webmock', 'simplecov']
});
```

## Development

### Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # Main MCP server
├── types/                # TypeScript type definitions
├── tools/                # MCP tools implementation
│   ├── guidance.ts       # RSpec guidance tools
│   ├── examples.ts       # Example generation
│   ├── validation.ts     # Code validation
│   └── configuration.ts  # Configuration help
├── resources/            # MCP resources
├── prompts/              # MCP prompts
├── knowledge/            # Knowledge base system
└── utils/                # Utility functions

data/
├── guidelines/           # Better Specs guidelines (Markdown)
├── examples.json         # Code examples database
├── antipatterns.json     # Anti-patterns database
└── configurations.json   # Configuration templates
```

### Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Adding New Guidelines

1. Create a new Markdown file in `data/guidelines/`:
```markdown
---
title: "Your Guideline Title"
category: "naming|organization|expectations|data-setup|mocking|shared-examples|performance|configuration"
tags: ["tag1", "tag2"]
priority: "high|medium|low"
relatedGuidelines: ["other-guideline-ids"]
---

# Your guideline content here
```

2. The knowledge base will automatically load it on server restart.

### Adding New Examples

Add entries to `data/examples.json`:
```json
{
  "id": "unique-example-id",
  "title": "Example Title",
  "description": "What this example demonstrates",
  "specType": "model|request|system|service|job|controller|helper",
  "scenario": "What you're testing",
  "badCode": "Example of what not to do (optional)",
  "goodCode": "Example of the right way",
  "explanation": "Why this is better",
  "tags": ["relevant", "tags"],
  "complexity": "beginner|intermediate|advanced"
}
```

## Better Specs Principles

This MCP server is built around the core Better Specs principles:

- **Describe methods clearly** - Use `.method` for class methods, `#method` for instance methods
- **Use contexts** - Start with "when", "with", or "without"
- **Keep descriptions short** - Under 40 characters, use contexts for longer scenarios
- **One expectation per test** - In unit tests (exceptions for integration tests)
- **Test all cases** - Happy path, edge cases, and failures
- **Use expect syntax** - Modern `expect().to` instead of deprecated `should`
- **Use subject appropriately** - For the main object under test
- **Use let/let!** - Instead of instance variables for test data
- **Mock sparingly** - Prefer real behavior, mock external boundaries only
- **Test what you see** - Focus on integration tests over controller unit tests

## API Reference

### Tools

#### `get_rspec_guidance`
Get Better Specs guidance for specific topics.

**Parameters:**
- `topic` (string, required) - RSpec topic to get guidance on
- `category` (string, optional) - Specific category to focus on
- `includeExamples` (boolean, default: true) - Whether to include examples
- `complexity` (string, optional) - Complexity level filter

#### `generate_spec_example`
Generate RSpec example code following Better Specs guidelines.

**Parameters:**
- `specType` (string, required) - Type of spec (model, request, system, etc.)
- `scenario` (string, required) - What you want to test
- `includeSetup` (boolean, default: true) - Include setup code
- `style` (string, default: "comprehensive") - Example style
- `complexity` (string, default: "intermediate") - Complexity level

#### `validate_spec_code`
Validate RSpec code against Better Specs guidelines.

**Parameters:**
- `code` (string, required) - RSpec code to validate
- `checkAll` (boolean, default: true) - Run all validation checks
- `specificChecks` (array, optional) - Specific rules to check
- `returnSuggestions` (boolean, default: true) - Include suggestions

#### `get_rspec_configuration`
Get RSpec configuration templates and setup guidance.

**Parameters:**
- `type` (string, required) - Configuration type (spec_helper, rails_helper, etc.)
- `projectType` (string, default: "rails") - Project type
- `includeComments` (boolean, default: true) - Include explanatory comments
- `features` (array, optional) - Additional features to include

### Resources

- `better-specs://guidelines` - All guidelines
- `better-specs://examples` - All examples
- `better-specs://antipatterns` - All anti-patterns
- `better-specs://configurations` - All configuration templates
- `better-specs://cheatsheet` - Quick reference guide

### Prompts

- `review_rspec_code` - Comprehensive code review
- `plan_comprehensive_tests` - Test planning guidance
- `refactor_test_suite` - Refactoring recommendations
- `setup_rspec_project` - Project setup guidance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## Acknowledgments

- [Better Specs](https://www.betterspecs.org) - The original source of RSpec best practices
- [RSpec](https://rspec.info/) - The testing framework this server supports
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
