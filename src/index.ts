#!/usr/bin/env node

/**
 * Better RSpec MCP Server
 * 
 * A Model Context Protocol server that provides comprehensive RSpec guidance,
 * examples, and best practices based on Better Specs guidelines.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BetterRSpecMCPServer } from './server.js';

async function main(): Promise<void> {
  const server = new BetterRSpecMCPServer();
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    console.error('Better RSpec MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start Better RSpec MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
