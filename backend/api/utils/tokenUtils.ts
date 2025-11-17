import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

export const generateToken = (id: string): string => {
    // Fix: Explicitly define payload and options to help TS compiler resolve overloads.
    const payload = { id };
    // Fix: Removed explicit SignOptions type to resolve type inference issue with expiresIn.
    const options = { expiresIn: JWT_EXPIRE };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (id: string): string => {
    // Fix: Explicitly define payload and options to help TS compiler resolve overloads.
    const payload = { id };
    // Fix: Removed explicit SignOptions type to resolve type inference issue with expiresIn.
    const options = { expiresIn: REFRESH_TOKEN_EXPIRE };
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};