import jwt from "jsonwebtoken"
import logger from '#config/logger.js'


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const JWT_EXPIRES_IN = '1d'; // Token expiration time

export const jwttoken = {
    sign: (payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error('Failed to authenticate token', error);
            throw new Error('Failed to authenticate token');
        }
    },
    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Invalid or expired token', error);
            throw new Error('Invalid or expired token');
        }
    }
}