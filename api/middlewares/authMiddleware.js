import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';

export const verifyUser = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(errorHandler(401, 'Unauthorized: No token provided!'));
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        const errorMsg = err.name === 'TokenExpiredError' ? 'Token expired!' : 'Invalid token!';
        return next(errorHandler(401, errorMsg));
      }

      // Fetch user details excluding password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(errorHandler(401, 'User not found!'));
      }

      next();
    });
  } catch (error) {
    return next(errorHandler(500, 'Internal server error!'));
  }
};
