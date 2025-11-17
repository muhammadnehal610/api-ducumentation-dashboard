
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

export const generateToken = (id: string): string => {
    // FIX: Using a namespace import for `jsonwebtoken` helps TypeScript correctly resolve the overloads for `jwt.sign`.
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const generateRefreshToken = (id: string): string => {
    // FIX: Using a namespace import for `jsonwebtoken` helps TypeScript correctly resolve the overloads for `jwt.sign`.
    return jwt.sign({ id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};