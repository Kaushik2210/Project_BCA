import jwt from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler.js";

// JWT-based auth. 
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }

  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const expires = Date.now() + 1000 * 60 * 60; 

  return res.status(200).json({ token, expires });
});

export const verifyToken = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

export default { login, verifyToken };
