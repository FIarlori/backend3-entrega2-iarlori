import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tokenSecretJWT';

const authMiddleware = (req, res, next) => {
    try {
        const cookie = req.signedCookies['coderCookie'];

        if (!cookie) {
            return res.status(401).json({
                status: "error",
                error: "No authentication token - Access denied"
            });
        }

        const decoded = jwt.verify(cookie, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: "error",
                error: "Invalid token"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "error",
                error: "Token expired"
            });
        }

        return res.status(401).json({
            status: "error",
            error: "Authentication failed"
        });
    }
};

export default authMiddleware;