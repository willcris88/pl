#!/usr/bin/env node

// Development script to run the server with tsx
import { spawn } from 'child_process';

const child = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});