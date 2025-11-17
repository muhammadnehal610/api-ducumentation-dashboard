import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

export const generateToken = (id: string): string => {
    // FIX: Explicitly typed options object to resolve jwt.sign overload ambiguity.
    const options: jwt.SignOptions = { expiresIn: JWT_EXPIRE };
    return jwt.sign({ id }, JWT_SECRET, options);
};

export const generateRefreshToken = (id: string): string => {
    // FIX: Explicitly typed options object to resolve jwt.sign overload ambiguity.
    const options: jwt.SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRE };
    return jwt.sign({ id }, REFRESH_TOKEN_SECRET, options);
};