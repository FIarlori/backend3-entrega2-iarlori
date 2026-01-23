import { usersService } from "../services/index.js";
import logger from '../utils/logger.js';

const getAllUsers = async (req, res) => {
    try {
        const users = await usersService.getAll();
        logger.info(`Retrieved ${users.length} users`);
        res.send({ status: "success", payload: users })
    } catch (error) {
        logger.error(`Error getting all users: ${error.message}`);
        res.status(500).send({ status: "error", error: "Internal server error" })
    }
}

const getUser = async (req, res) => {
    try {
        const userId = req.params.uid;

        if (!userId || userId.trim() === '') {
            return res.status(400).send({
                status: "error",
                error: "User ID is required"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(userId)) {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format. Must be a 24-character hexadecimal string"
            });
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            logger.warn(`User not found: ${userId}`);
            return res.status(404).send({
                status: "error",
                error: "User not found"
            });
        }

        logger.info(`User retrieved: ${user.email}`);
        res.send({
            status: "success",
            payload: user
        });
    } catch (error) {
        logger.error(`Error getting user ${req.params.uid}: ${error.message}`);

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format",
                details: "The provided ID is not a valid MongoDB ObjectId"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;

        if (!userId || userId.trim() === '') {
            return res.status(400).send({
                status: "error",
                error: "User ID is required"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(userId)) {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            logger.warn(`User not found for update: ${userId}`);
            return res.status(404).send({
                status: "error",
                error: "User not found"
            });
        }

        const result = await usersService.update(userId, updateBody);
        logger.info(`User updated: ${userId}`);
        res.send({
            status: "success",
            message: "User updated"
        });
    } catch (error) {
        logger.error(`Error updating user ${req.params.uid}: ${error.message}`);

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.uid;

        if (!userId || userId.trim() === '') {
            return res.status(400).send({
                status: "error",
                error: "User ID is required"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(userId)) {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            logger.warn(`User not found for deletion: ${userId}`);
            return res.status(404).send({
                status: "error",
                error: "User not found"
            });
        }

        const result = await usersService.delete(userId);
        logger.info(`User deleted: ${userId} (${user.email})`);
        res.send({
            status: "success",
            message: "User deleted"
        });
    } catch (error) {
        logger.error(`Error deleting user ${req.params.uid}: ${error.message}`);

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const uploadDocuments = async (req, res) => {
    try {
        const userId = req.params.uid;
        const files = req.files || [];

        logger.info(`Uploading documents for user ${userId}, files: ${files.length}`);

        if (!userId || userId.trim() === '') {
            return res.status(400).send({
                status: "error",
                error: "User ID is required"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(userId)) {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            logger.warn(`User not found for document upload: ${userId}`);
            return res.status(404).send({
                status: "error",
                error: "User not found"
            });
        }

        if (files.length === 0) {
            logger.warn(`No files uploaded for user ${userId}`);
            return res.status(400).send({
                status: "error",
                error: "No files uploaded"
            });
        }

        const uploadedDocuments = [];

        for (const file of files) {
            const document = {
                name: file.originalname,
                reference: `/documents/${file.filename}`,
                type: determineDocumentType(file.originalname)
            };

            uploadedDocuments.push(document);
            logger.debug(`Document processed: ${file.originalname} -> ${document.reference}`);
        }

        const updatedDocuments = [...user.documents, ...uploadedDocuments];
        await usersService.update(userId, { documents: updatedDocuments });

        logger.info(`Documents uploaded successfully for user ${userId}: ${uploadedDocuments.length} files`);

        res.send({
            status: "success",
            message: "Documents uploaded successfully",
            count: uploadedDocuments.length,
            documents: uploadedDocuments,
            totalDocuments: updatedDocuments.length
        });

    } catch (error) {
        logger.error(`Error uploading documents for user ${req.params.uid}: ${error.message}`);

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const determineDocumentType = (filename) => {
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.includes('dni') || lowerFilename.includes('identificacion') ||
        lowerFilename.includes('cedula') || lowerFilename.includes('pasaporte')) {
        return 'identification';
    }

    if (lowerFilename.includes('domicilio') || lowerFilename.includes('direccion') ||
        lowerFilename.includes('residencia') || lowerFilename.includes('servicio')) {
        return 'address';
    }

    if (lowerFilename.includes('cuenta') || lowerFilename.includes('estado') ||
        lowerFilename.includes('extrato') || lowerFilename.includes('bank')) {
        return 'account';
    }

    return 'other';
};

const updateLastConnection = async (userId) => {
    try {
        if (!userId) return;

        await usersService.update(userId, {
            last_connection: new Date()
        });

        logger.debug(`Last connection updated for user: ${userId}`);
    } catch (error) {
        logger.error(`Error updating last connection for user ${userId}: ${error.message}`);
    }
};

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    uploadDocuments,
    updateLastConnection
}