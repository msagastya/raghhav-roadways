// api/index.js
// Vercel Serverless Function Entry Point
// This wraps the Express app for Vercel deployment

const app = require('../src/app');

module.exports = app;
