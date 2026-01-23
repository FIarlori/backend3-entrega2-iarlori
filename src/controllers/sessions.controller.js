import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tokenSecretJWT';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            logger.warn('Registration attempt with incomplete values');
            return res.status(400).send({
                status: "error",
                error: "Incomplete values"
            });
        }

        const exists = await usersService.getUserByEmail(email);
        if (exists) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(400).send({
                status: "error",
                error: "User already exists"
            });
        }

        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            last_connection: new Date()
        };

        let result = await usersService.create(user);
        logger.info(`User registered: ${email} (${result._id})`);
        res.send({
            status: "success",
            payload: result._id,
            message: "User registered successfully"
        });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).send({
            status: "error",
            error: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            logger.warn('Login attempt with incomplete values');
            return res.status(400).send({
                status: "error",
                error: "Incomplete values"
            });
        }

        const user = await usersService.getUserByEmail(email);
        if (!user) {
            logger.warn(`Login attempt with non-existent email: ${email}`);
            return res.status(404).send({
                status: "error",
                error: "User doesn't exist"
            });
        }

        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            logger.warn(`Invalid password attempt for user: ${email}`);
            return res.status(400).send({
                status: "error",
                error: "Incorrect password"
            });
        }

        await usersService.update(user._id, {
            last_connection: new Date()
        });

        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        logger.info(`User logged in: ${email} (${user._id})`);

        res.cookie('coderCookie', token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true
        }).send({
            status: "success",
            message: "Logged in successfully",
            user: userDto
        });
    } catch (error) {
        logger.error(`Login error for ${req.body.email}: ${error.message}`);
        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const current = async (req, res) => {
    try {
        const cookie = req.signedCookies['coderCookie'];
        if (!cookie) {
            logger.warn('Current endpoint accessed without authentication token');
            return res.status(401).send({
                status: "error",
                error: "No authentication token"
            });
        }

        const user = jwt.verify(cookie, JWT_SECRET);
        logger.debug(`Current user accessed: ${user.email}`);
        res.send({
            status: "success",
            payload: user
        });
    } catch (error) {
        logger.error(`Current endpoint error: ${error.message}`);
        res.status(401).send({
            status: "error",
            error: "Invalid or expired token"
        });
    }
}

const logout = async (req, res) => {
    try {
        const cookie = req.signedCookies['coderCookie'];
        if (cookie) {
            try {
                const user = jwt.verify(cookie, JWT_SECRET);
                const dbUser = await usersService.getUserByEmail(user.email);
                if (dbUser) {
                    await usersService.update(dbUser._id, {
                        last_connection: new Date()
                    });
                    logger.info(`User logged out: ${user.email}`);
                }
            } catch (error) {
                logger.debug(`Logout with invalid/expired token: ${error.message}`);
            }
        }

        res.clearCookie('coderCookie').send({
            status: "success",
            message: "Logged out successfully"
        });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const unprotectedLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                status: "error",
                error: "Incomplete values"
            });
        }

        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({
                status: "error",
                error: "User doesn't exist"
            });
        }

        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            return res.status(400).send({
                status: "error",
                error: "Incorrect password"
            });
        }

        await usersService.update(user._id, {
            last_connection: new Date()
        });

        const token = jwt.sign(user.toObject(), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        logger.info(`Unprotected login: ${email}`);

        res.cookie('unprotectedCookie', token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: false
        }).send({
            status: "success",
            message: "Unprotected Logged in"
        });
    } catch (error) {
        logger.error(`Unprotected login error: ${error.message}`);
        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const unprotectedCurrent = async (req, res) => {
    try {
        const cookie = req.cookies['unprotectedCookie'];
        if (!cookie) {
            return res.status(401).send({
                status: "error",
                error: "No authentication token"
            });
        }

        const user = jwt.verify(cookie, JWT_SECRET);
        res.send({
            status: "success",
            payload: user
        });
    } catch (error) {
        res.status(401).send({
            status: "error",
            error: "Invalid or expired token"
        });
    }
}

export default {
    register,
    login,
    current,
    logout,
    unprotectedLogin,
    unprotectedCurrent
};