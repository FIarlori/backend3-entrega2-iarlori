import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js'; 

const JWT_SECRET = process.env.JWT_SECRET || 'tokenSecretJWT';

const authMiddleware = (req, res, next) => {
    try {
        const cookie = req.signedCookies['coderCookie'];

        if (!cookie) {
            logger.warn('Auth middleware: No authentication token provided', {
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            
            return res.status(401).json({
                status: "error",
                error: "No authentication token - Access denied",
                message: "Please login first at /api/sessions/login"
            });
        }

        const decoded = jwt.verify(cookie, JWT_SECRET);

        req.user = decoded;
        
        logger.debug('Auth middleware: User authenticated', {
            user: decoded.email,
            path: req.path,
            method: req.method
        });

        next();
    } catch (error) {
        logger.error('Auth middleware error:', {
            message: error.message,
            path: req.path,
            method: req.method,
            errorType: error.name
        });

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: "error",
                error: "Invalid token",
                message: "The authentication token is invalid or malformed"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "error",
                error: "Token expired",
                message: "Please login again at /api/sessions/login"
            });
        }

        return res.status(401).json({
            status: "error",
            error: "Authentication failed",
            message: error.message
        });
    }
};

export default authMiddleware;