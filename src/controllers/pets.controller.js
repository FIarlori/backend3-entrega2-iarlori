import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js";
import __dirname from "../utils/index.js";
import logger from '../utils/logger.js';

const getAllPets = async (req, res) => {
    try {
        logger.info('Fetching all pets');
        const pets = await petsService.getAll();

        const adoptedCount = pets.filter(pet => pet.adopted).length;
        const speciesCount = pets.reduce((acc, pet) => {
            acc[pet.specie] = (acc[pet.specie] || 0) + 1;
            return acc;
        }, {});

        logger.info(`Retrieved ${pets.length} pets (${adoptedCount} adopted)`);
        logger.debug(`Species distribution: ${JSON.stringify(speciesCount)}`);

        res.send({
            status: "success",
            payload: pets,
            count: pets.length,
            statistics: {
                total: pets.length,
                adopted: adoptedCount,
                available: pets.length - adoptedCount,
                species: speciesCount
            }
        });

    } catch (error) {
        logger.error(`Error getting all pets: ${error.message}`, {
            stack: error.stack,
            path: req.path,
            method: req.method
        });

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not retrieve pets"
        });
    }
}

const createPet = async (req, res) => {
    try {
        const { name, specie, birthDate } = req.body;
        logger.info(`Creating pet: ${name} (${specie})`);

        if (!name || !specie || !birthDate) {
            logger.warn('Attempt to create pet with incomplete values', { body: req.body });
            return res.status(400).send({
                status: "error",
                error: "Incomplete values",
                required: ["name", "specie", "birthDate"],
                received: Object.keys(req.body)
            });
        }

        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        logger.debug(`Pet DTO created: ${JSON.stringify(pet)}`);

        const result = await petsService.create(pet);
        logger.info(`Pet created successfully: ${result._id} - ${name}`);

        res.send({
            status: "success",
            payload: result,
            message: "Pet created successfully",
            pet_id: result._id
        });

    } catch (error) {
        logger.error(`Error creating pet: ${error.message}`, {
            body: req.body,
            stack: error.stack,
            path: req.path
        });

        if (error.name === 'ValidationError') {
            return res.status(400).send({
                status: "error",
                error: "Validation error",
                details: error.message,
                fields: error.errors
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not create pet"
        });
    }
}

const updatePet = async (req, res) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;

        logger.info(`Updating pet: ${petId}`, { updates: petUpdateBody });

        if (!petId || petId.trim() === '') {
            logger.warn('Attempt to update pet without ID');
            return res.status(400).send({
                status: "error",
                error: "Pet ID is required",
                format: "PUT /api/pets/:pid"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(petId)) {
            logger.warn(`Invalid pet ID format: ${petId}`);
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format",
                received: petId,
                expected_format: "24-character hexadecimal string"
            });
        }

        const existingPet = await petsService.getBy({ _id: petId });
        if (!existingPet) {
            logger.warn(`Pet not found for update: ${petId}`);
            return res.status(404).send({
                status: "error",
                error: "Pet not found",
                pet_id: petId,
                suggestion: "Check available pets at: GET /api/pets"
            });
        }

        logger.debug(`Pet found: ${existingPet.name} (${existingPet.specie})`);

        if (petUpdateBody.adopted !== undefined && petUpdateBody.adopted !== existingPet.adopted) {
            logger.info(`Pet adoption status changing: ${existingPet.adopted} -> ${petUpdateBody.adopted}`);
        }

        const result = await petsService.update(petId, petUpdateBody);

        if (!result) {
            logger.error(`Update operation returned null for pet: ${petId}`);
            return res.status(500).send({
                status: "error",
                error: "Failed to update pet",
                pet_id: petId
            });
        }

        logger.info(`Pet updated successfully: ${petId}`);

        res.send({
            status: "success",
            message: "Pet updated successfully",
            petId: petId,
            changes: Object.keys(petUpdateBody),
            previous_values: existingPet,
            updated_at: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`Error updating pet ${req.params.pid}: ${error.message}`, {
            pet_id: req.params.pid,
            updates: req.body,
            stack: error.stack
        });

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format",
                details: "The provided ID is not a valid MongoDB ObjectId"
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).send({
                status: "error",
                error: "Validation error",
                details: error.message
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not update pet"
        });
    }
}

const deletePet = async (req, res) => {
    try {
        const petId = req.params.pid;
        logger.info(`Deleting pet: ${petId}`);

        if (!petId || petId.trim() === '') {
            logger.warn('Attempt to delete pet without ID');
            return res.status(400).send({
                status: "error",
                error: "Pet ID is required",
                format: "DELETE /api/pets/:pid"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(petId)) {
            logger.warn(`Invalid pet ID format for deletion: ${petId}`);
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format",
                received: petId
            });
        }

        const existingPet = await petsService.getBy({ _id: petId });
        if (!existingPet) {
            logger.warn(`Pet not found for deletion: ${petId}`);
            return res.status(404).send({
                status: "error",
                error: "Pet not found",
                pet_id: petId
            });
        }

        logger.debug(`Pet to delete: ${existingPet.name} (${existingPet.specie})`);

        const result = await petsService.delete(petId);

        if (!result) {
            logger.error(`Delete operation returned null for pet: ${petId}`);
            return res.status(500).send({
                status: "error",
                error: "Failed to delete pet",
                pet_id: petId
            });
        }

        logger.info(`Pet deleted successfully: ${petId} - ${existingPet.name}`);

        res.send({
            status: "success",
            message: "Pet deleted successfully",
            petId: petId,
            deletedPet: {
                _id: existingPet._id,
                name: existingPet.name,
                specie: existingPet.specie,
                adopted: existingPet.adopted,
                owner: existingPet.owner
            },
            deleted_at: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`Error deleting pet ${req.params.pid}: ${error.message}`, {
            pet_id: req.params.pid,
            stack: error.stack
        });

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format",
                details: "The provided ID is not a valid MongoDB ObjectId"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not delete pet"
        });
    }
}

const createPetWithImage = async (req, res) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;

        logger.info(`Creating pet with image: ${name} (${specie})`, {
            has_file: !!file,
            file_name: file?.originalname,
            file_size: file?.size
        });

        if (!name || !specie || !birthDate) {
            logger.warn('Attempt to create pet with image but incomplete values', { body: req.body });
            return res.status(400).send({
                status: "error",
                error: "Incomplete values",
                required: ["name", "specie", "birthDate"],
                received: Object.keys(req.body)
            });
        }

        if (!file) {
            logger.warn('Attempt to create pet with image but no file provided');
            return res.status(400).send({
                status: "error",
                error: "Image file is required",
                accepted_formats: "JPG, PNG, GIF, WEBP",
                max_size: "5MB"
            });
        }

        logger.debug(`File uploaded: ${file.filename} (${file.size} bytes)`);

        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `/img/pets/${file.filename}`
        });

        const result = await petsService.create(pet);
        logger.info(`Pet created with image successfully: ${result._id} - ${name}`);
        logger.debug(`Image path: ${pet.image}`);

        res.send({
            status: "success",
            payload: result,
            message: "Pet created with image successfully",
            image_url: pet.image,
            pet_id: result._id
        });

    } catch (error) {
        logger.error(`Error creating pet with image: ${error.message}`, {
            body: req.body,
            file: req.file?.originalname,
            stack: error.stack
        });


        if (req.file) {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, '../public/img/pets', req.file.filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.debug(`Cleaned up file after error: ${filePath}`);
            }
        }

        if (error.name === 'ValidationError') {
            return res.status(400).send({
                status: "error",
                error: "Validation error",
                details: error.message
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not create pet with image"
        });
    }
}

const getPetById = async (req, res) => {
    try {
        const petId = req.params.pid;
        logger.debug(`Fetching pet by ID: ${petId}`);

        if (!petId || petId.trim() === '') {
            logger.warn('Attempt to get pet without ID');
            return res.status(400).send({
                status: "error",
                error: "Pet ID is required",
                format: "GET /api/pets/:pid"
            });
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(petId)) {
            logger.warn(`Invalid pet ID format: ${petId}`);
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format",
                received: petId,
                expected_format: "24-character hexadecimal string"
            });
        }

        const pet = await petsService.getBy({ _id: petId });
        if (!pet) {
            logger.warn(`Pet not found: ${petId}`);
            return res.status(404).send({
                status: "error",
                error: "Pet not found",
                pet_id: petId,
                suggestion: "Check available pets at: GET /api/pets"
            });
        }

        logger.info(`Pet retrieved: ${petId} - ${pet.name}`);

        res.send({
            status: "success",
            payload: pet,
            metadata: {
                retrieved_at: new Date().toISOString(),
                has_image: !!pet.image,
                is_adopted: pet.adopted,
                has_owner: !!pet.owner
            }
        });

    } catch (error) {
        logger.error(`Error getting pet by ID ${req.params.pid}: ${error.message}`, {
            pet_id: req.params.pid,
            stack: error.stack
        });

        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format",
                details: "The provided ID is not a valid MongoDB ObjectId"
            });
        }

        res.status(500).send({
            status: "error",
            error: "Internal server error",
            message: "Could not retrieve pet"
        });
    }
}

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage,
    getPetById
}