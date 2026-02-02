import authController from '../controllers/auth.controller.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (authHeader) {
    token = authHeader;
  }

  const payload = token ? authController.verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // attach decoded token payload to request for handlers to use if needed
  req.user = payload;
  next();
};

export default requireAuth;
