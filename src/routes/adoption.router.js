import { Router } from 'express';
import adoptionsController from '../controllers/adoptions.controller.js';
import logger from '../utils/logger.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

const adoptionLogger = (req, res, next) => {
    const { uid, pid, aid } = req.params;
    const method = req.method;
    const path = req.originalUrl;

    logger.http(`Adoption ${method} ${path}`, {
        user_id: uid,
        pet_id: pid,
        adoption_id: aid,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    next();
};

const validateAdoptionCreation = (req, res, next) => {
    const { uid, pid } = req.params;

    if (!uid && !pid) {
        logger.warn('Adoption creation attempt without parameters');
        return res.status(400).send({
            status: "error",
            error: "Missing parameters",
            message: "User ID and Pet ID are required to create an adoption",
            solution: "Use the format: POST /api/adoptions/:user_id/:pet_id",
            example: "POST /api/adoptions/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012",
            quick_fix: {
                step1: "Get a user ID from: GET /api/users",
                step2: "Get a pet ID from: GET /api/pets",
                step3: "Use both IDs in the URL"
            }
        });
    }

    if (uid && !pid) {
        logger.warn(`Adoption creation attempt with only user_id: ${uid}`);

        if (!isValidObjectId(uid)) {
            return res.status(400).send({
                status: "error",
                error: "Invalid User ID format",
                details: "The provided User ID is not a valid MongoDB ObjectId",
                received: uid,
                expected_format: "24-character hexadecimal string",
                example: "507f1f77bcf86cd799439011"
            });
        }

        return res.status(400).send({
            status: "error",
            error: "Pet ID is missing",
            message: "You provided a User ID but missing the Pet ID",
            provided: {
                user_id: uid,
                user_id_valid: true
            },
            missing: "pet_id",
            solution: "Add a Pet ID to the URL",
            format: "POST /api/adoptions/:user_id/:pet_id",
            example: `POST /api/adoptions/${uid}/507f1f77bcf86cd799439012`
        });
    }

    if (!uid && pid) {
        logger.warn(`Adoption creation attempt with only pet_id: ${pid}`);

        if (!isValidObjectId(pid)) {
            return res.status(400).send({
                status: "error",
                error: "Invalid Pet ID format",
                details: "The provided Pet ID is not a valid MongoDB ObjectId",
                received: pid
            });
        }

        return res.status(400).send({
            status: "error",
            error: "User ID is missing",
            message: "You provided a Pet ID but missing the User ID",
            provided: {
                pet_id: pid,
                pet_id_valid: true
            },
            missing: "user_id",
            solution: "Add a User ID to the URL",
            format: "POST /api/adoptions/:user_id/:pet_id",
            example: `POST /api/adoptions/507f1f77bcf86cd799439011/${pid}`
        });
    }

    if (!isValidObjectId(uid)) {
        logger.warn(`Invalid user_id format: ${uid}`);
        return res.status(400).send({
            status: "error",
            error: "Invalid User ID format",
            details: "User ID must be a 24-character hexadecimal MongoDB ObjectId",
            received: uid,
            expected_format: "24-character hexadecimal string",
            example: "507f1f77bcf86cd799439011",
            note: "You can get valid user IDs from: GET /api/users"
        });
    }

    if (!isValidObjectId(pid)) {
        logger.warn(`Invalid pet_id format: ${pid}`);
        return res.status(400).send({
            status: "error",
            error: "Invalid Pet ID format",
            details: "Pet ID must be a 24-character hexadecimal MongoDB ObjectId",
            received: pid,
            expected_format: "24-character hexadecimal string",
            example: "507f1f77bcf86cd799439012",
            note: "You can get valid pet IDs from: GET /api/pets"
        });
    }

    logger.debug(`Adoption parameters validated: user_id=${uid}, pet_id=${pid}`);
    next();
};

router.use(adoptionLogger);

router.get('/', authMiddleware, adoptionsController.getAllAdoptions);
router.get('/:aid', authMiddleware, adoptionsController.getAdoption);
router.post('/:uid/:pid', authMiddleware, validateAdoptionCreation, adoptionsController.createAdoption);
router.post('/', authMiddleware, validateAdoptionCreation);
router.post('/:uid', authMiddleware, validateAdoptionCreation);

export default router;