import { adoptionsService, petsService, usersService } from "../services/index.js";
import logger from '../utils/logger.js';

const getAllAdoptions = async (req, res) => {
    try {
        logger.info('Fetching all adoptions');
        const result = await adoptionsService.getAll();

        logger.info(`Retrieved ${result.length} adoptions`);
        res.send({
            status: "success",
            payload: result,
            count: result.length
        });

    } catch (error) {
        logger.error(`Error getting all adoptions: ${error.message}`, { stack: error.stack });
        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not retrieve adoptions"
        });
    }
}

const getAdoption = async (req, res) => {
    try {
        const adoptionId = req.params.aid;

        logger.debug(`Fetching adoption with ID: ${adoptionId}`);

        const adoption = await adoptionsService.getBy({ _id: adoptionId });
        if (!adoption) {
            logger.warn(`Adoption not found: ${adoptionId}`);
            return res.status(404).send({
                status: "error",
                error: "Adoption not found",
                requested_id: adoptionId,
                suggestion: "Check available adoptions at: GET /api/adoptions"
            });
        }

        logger.info(`Adoption retrieved: ${adoptionId}`);
        res.send({
            status: "success",
            payload: adoption
        });

    } catch (error) {
        logger.error(`Error getting adoption ${req.params.aid}: ${error.message}`, {
            adoption_id: req.params.aid,
            stack: error.stack
        });

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid adoption ID format",
                details: "The provided ID is not a valid MongoDB ObjectId",
                expected_format: "24-character hexadecimal string",
                example: "507f1f77bcf86cd799439011"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not retrieve adoption"
        });
    }
}

const createAdoption = async (req, res) => {
    try {
        const { uid, pid } = req.params;

        logger.info(`Creating adoption: user=${uid}, pet=${pid}`);


        const user = await usersService.getUserById(uid);
        if (!user) {
            logger.warn(`User not found for adoption: ${uid}`);
            return res.status(404).send({
                status: "error",
                error: "User not found",
                user_id: uid,
                suggestion: "Check available users at: GET /api/users"
            });
        }


        const pet = await petsService.getBy({ _id: pid });
        if (!pet) {
            logger.warn(`Pet not found for adoption: ${pid}`);
            return res.status(404).send({
                status: "error",
                error: "Pet not found",
                pet_id: pid,
                suggestion: "Check available pets at: GET /api/pets"
            });
        }

        if (pet.adopted) {
            logger.warn(`Attempt to adopt already adopted pet: ${pid}, current owner: ${pet.owner}`);
            return res.status(400).send({
                status: "error",
                error: "Pet is already adopted",
                pet_id: pid,
                pet_name: pet.name,
                current_owner: pet.owner,
                suggestion: "Try another pet from: GET /api/pets?adopted=false"
            });
        }

        logger.debug(`Processing adoption: user=${user.email}, pet=${pet.name}`);

        user.pets.push(pet._id);
        await usersService.update(user._id, { pets: user.pets });
        logger.debug(`User ${user.email} updated with pet ${pet._id}`);

        await petsService.update(pet._id, {
            adopted: true,
            owner: user._id
        });
        logger.debug(`Pet ${pet.name} marked as adopted by ${user.email}`);

        const adoption = await adoptionsService.create({
            owner: user._id,
            pet: pet._id
        });
        logger.debug(`Adoption record created: ${adoption._id}`);

        logger.info(`Adoption successful: ${user.email} adopted ${pet.name}`);

        res.send({
            status: "success",
            message: "Pet adopted successfully",
            adoption: {
                id: adoption._id,
                timestamp: adoption.createdAt || new Date().toISOString(),
                user: {
                    id: user._id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    total_pets: user.pets.length
                },
                pet: {
                    id: pet._id,
                    name: pet.name,
                    specie: pet.specie,
                    birthDate: pet.birthDate,
                    adopted: true,
                    owner: user._id
                }
            },
            links: {
                user: `/api/users/${user._id}`,
                pet: `/api/pets/${pet._id}`,
                adoption: `/api/adoptions/${adoption._id}`
            }
        });

    } catch (error) {
        logger.error(`Error creating adoption (user=${req.params.uid}, pet=${req.params.pid}): ${error.message}`, {
            user_id: req.params.uid,
            pet_id: req.params.pid,
            stack: error.stack
        });

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid ID format",
                details: "One or more IDs are not valid MongoDB ObjectIds",
                help: "IDs should be 24-character hexadecimal strings"
            });
        }

        if (error.code === 11000 || error.message.includes('duplicate')) {
            return res.status(409).send({
                status: "error",
                error: "Adoption already exists",
                message: "This pet may already be adopted by this user",
                suggestion: "Check existing adoptions at: GET /api/adoptions"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not complete adoption process"
        });
    }
}

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption
}