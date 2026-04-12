const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret      = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  const weakSecrets = ['freshnest_secret', 'secret', 'password', '123456', 'default'];

  if (!secret) {
    if (isProduction) throw new Error('JWT_SECRET is required in production!');
    console.warn('⚠️  WARNING: Using temporary JWT_SECRET. Set it in .env for production!');
    return 'dev_temp_secret_do_not_use_in_prod_' + Date.now();
  }
  if (weakSecrets.includes(secret.toLowerCase())) {
    if (isProduction) throw new Error('JWT_SECRET is too weak for production!');
    console.warn('⚠️  WARNING: JWT_SECRET is weak. OK for development only.');
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header)
      return res.status(401).json({ success: false, error: 'No token provided.' });

    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Access denied for your role.' });
      }
      next();
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
  };
}

module.exports = { auth, JWT_SECRET };