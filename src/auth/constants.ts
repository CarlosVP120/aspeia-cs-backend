export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secret', // Always use environment variables in production
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
};
