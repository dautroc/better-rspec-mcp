import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { RSpecGuidanceTools } from './tools/guidance.js';
import { RSpecExampleTools } from './tools/examples.js';
import { RSpecValidationTools } from './tools/validation.js';
import { RSpecConfigurationTools } from './tools/configuration.js';
import { RSpecResources } from './resources/index.js';
import { RSpecPrompts } from './prompts/index.js';
import { KnowledgeBase } from './knowledge/base.js';

/**
 * Better RSpec MCP Server
 * 
 * Provides comprehensive RSpec guidance through MCP tools, resources, and prompts
 */
export class BetterRSpecMCPServer {
  private server: Server;
  private knowledgeBase: KnowledgeBase;
  private guidanceTools: RSpecGuidanceTools;
  private exampleTools: RSpecExampleTools;
  private validationTools: RSpecValidationTools;
  private configurationTools: RSpecConfigurationTools;
  private resources: RSpecResources;
  private prompts: RSpecPrompts;

  constructor() {
    this.server = new Server(
      {
        name: 'better-rspec-mcp',
        version: '1.0.0',
        description: 'Better RSpec guidance and examples MCP server',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    // Initialize knowledge base and components
    this.knowledgeBase = new KnowledgeBase();
    this.guidanceTools = new RSpecGuidanceTools(this.knowledgeBase);
    this.exampleTools = new RSpecExampleTools(this.knowledgeBase);
    this.validationTools = new RSpecValidationTools(this.knowledgeBase);
    this.configurationTools = new RSpecConfigurationTools(this.knowledgeBase);
    this.resources = new RSpecResources(this.knowledgeBase);
    this.prompts = new RSpecPrompts(this.knowledgeBase);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Tools handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        ...this.guidanceTools.getToolDefinitions(),
        ...this.exampleTools.getToolDefinitions(),
        ...this.validationTools.getToolDefinitions(),
        ...this.configurationTools.getToolDefinitions(),
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Route to appropriate tool handler
      if (this.guidanceTools.canHandle(name)) {
        return await this.guidanceTools.handleTool(name, args);
      }
      
      if (this.exampleTools.canHandle(name)) {
        return await this.exampleTools.handleTool(name, args);
      }
      
      if (this.validationTools.canHandle(name)) {
        return await this.validationTools.handleTool(name, args);
      }
      
      if (this.configurationTools.canHandle(name)) {
        return await this.configurationTools.handleTool(name, args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });

    // Resources handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: this.resources.getResourceDefinitions(),
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      return await this.resources.readResource(uri);
    });

    // Prompts handlers
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: this.prompts.getPromptDefinitions(),
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await this.prompts.getPrompt(name, args);
    });
  }

  async connect(transport: any): Promise<void> {
    // Initialize knowledge base
    await this.knowledgeBase.initialize();
    
    // Connect server
    await this.server.connect(transport);
  }
}
