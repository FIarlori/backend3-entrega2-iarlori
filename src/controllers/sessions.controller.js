import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tokenSecretJWT';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send({ 
                status: "error", 
                error: "Incomplete values" 
            });
        }
        
        const exists = await usersService.getUserByEmail(email);
        if (exists) {
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
            password: hashedPassword
        };
        
        let result = await usersService.create(user);
        res.send({ 
            status: "success", 
            payload: result._id,
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).send({ 
            status: "error", 
            error: error.message 
        });
    }
}

const login = async (req, res) => {
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
    
    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.cookie('coderCookie', token, { 
        maxAge: 3600000,
        httpOnly: true,
        secure: false, 
        signed: true
    }).send({ 
        status: "success", 
        message: "Logged in successfully",
        user: userDto
    });
}

const current = async (req, res) => {
    try {
        const cookie = req.signedCookies['coderCookie'];
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

const logout = async (req, res) => {
    res.clearCookie('coderCookie').send({ 
        status: "success", 
        message: "Logged out successfully" 
    });
}

const unprotectedLogin = async (req, res) => {
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
    
    const token = jwt.sign(user.toObject(), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.cookie('unprotectedCookie', token, { 
        maxAge: 3600000,
        httpOnly: true,
        secure: false
    }).send({ 
        status: "success", 
        message: "Unprotected Logged in" 
    });
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