const express = require('express');
const { analyzeError } = require('../agents/claudeAgent');

const router = express.Router();

// Frontend ErrorBoundary calls this to get a Claude-generated user-friendly explanation
router.post('/explain-error', async (req, res) => {
  const { errorMessage, componentStack, url } = req.body;

  const fallback = {
    userMessage: 'An unexpected error occurred.',
    suggestion: 'Try refreshing the page or returning to the dashboard.',
  };

  if (!errorMessage) {
    return res.json(fallback);
  }

  try {
    const analysis = await analyzeError(
      {
        errorType: 'FRONTEND',
        message: errorMessage,
        componentStack: componentStack?.slice(0, 400),
        url,
      },
      'claude-haiku-4-5'
    );

    res.json(analysis || fallback);
  } catch {
    res.json(fallback);
  }
});

module.exports = router;
