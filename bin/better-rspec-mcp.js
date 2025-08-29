#!/usr/bin/env node

/**
 * Wrapper script for Better RSpec MCP Server
 * This script ensures dependencies are available before running the server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');
const nodeModulesPath = join(packageRoot, 'node_modules');

// Check if dependencies are installed
if (!existsSync(nodeModulesPath)) {
  console.error('Installing dependencies...');
  
  const npm = spawn('npm', ['install'], {
    cwd: packageRoot,
    stdio: 'inherit'
  });
  
  npm.on('close', (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.error('Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  const serverPath = join(packageRoot, 'dist', 'index.js');
  
  const server = spawn('node', [serverPath], {
    stdio: 'inherit'
  });
  
  server.on('close', (code) => {
    process.exit(code);
  });
}
