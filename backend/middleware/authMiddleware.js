import authController from '../controllers/auth.controller.js';
import { ApiError } from "../utils/apiError.js";

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (authHeader) {
    token = authHeader;
  }else{
    return res.status(401).json(new ApiError(401, "Unauthorized").toJSON());
  }

  const payload = token ? authController.verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json(new ApiError(401, 'Unauthorized').toJSON());
  }

  // attach decoded token payload to request for handlers to use if needed
  req.user = payload;
  next();
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(new ApiError(403,"Access denied"));
    }
    next();
  };
};


export {requireAuth,authorize};
