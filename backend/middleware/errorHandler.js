function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found.`,
  });
}

function globalError(err, req, res, next) {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error.' });
}

module.exports = { notFound, globalError };