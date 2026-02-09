const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION || '24h',
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id_user: user.id_user,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    }
  );
};

// Hash Password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Verify Token
const verifyTokenUtil = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  verifyTokenUtil,
};
