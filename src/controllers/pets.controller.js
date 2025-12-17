import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";

const getAllPets = async(req,res)=>{
    try {
        const pets = await petsService.getAll();
        res.send({status:"success",payload:pets})
    } catch (error) {
        console.error("Error getting all pets:", error);
        res.status(500).send({status:"error",error:"Internal server error"})
    }
}

const createPet = async(req,res)=> {
    try {
        const {name,specie,birthDate} = req.body;
        if(!name||!specie||!birthDate) {
            return res.status(400).send({
                status:"error",
                error:"Incomplete values"
            });
        }
        
        const pet = PetDTO.getPetInputFrom({name,specie,birthDate});
        const result = await petsService.create(pet);
        res.send({
            status:"success",
            payload:result,
            message: "Pet created successfully"
        })
    } catch (error) {
        console.error("Error creating pet:", error);
        res.status(500).send({
            status:"error",
            error:"Internal server error"
        });
    }
}

const updatePet = async(req,res) =>{
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        
        if (!petId || petId.trim() === '') {
            return res.status(400).send({
                status: "error", 
                error: "Pet ID is required"
            });
        }
        
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(petId)) {
            return res.status(400).send({
                status: "error", 
                error: "Invalid pet ID format"
            });
        }
        
        const existingPet = await petsService.getBy({_id: petId});
        if (!existingPet) {
            return res.status(404).send({
                status: "error",
                error: "Pet not found"
            });
        }
        
        const result = await petsService.update(petId, petUpdateBody);
        
        if (!result) {
            return res.status(500).send({
                status: "error",
                error: "Failed to update pet"
            });
        }
        
        res.send({
            status: "success",
            message: "Pet updated successfully",
            petId: petId
        });
    } catch (error) {
        console.error("Error updating pet:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format"
            });
        }
        
        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const deletePet = async(req,res)=> {
    try {
        const petId = req.params.pid;
        
        if (!petId || petId.trim() === '') {
            return res.status(400).send({
                status: "error", 
                error: "Pet ID is required"
            });
        }
        
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(petId)) {
            return res.status(400).send({
                status: "error", 
                error: "Invalid pet ID format"
            });
        }
        
        const existingPet = await petsService.getBy({_id: petId});
        if (!existingPet) {
            return res.status(404).send({
                status: "error",
                error: "Pet not found"
            });
        }
        
        const result = await petsService.delete(petId);
        
        if (!result) {
            return res.status(500).send({
                status: "error",
                error: "Failed to delete pet"
            });
        }
        
        res.send({
            status: "success",
            message: "Pet deleted successfully",
            petId: petId,
            deletedPet: existingPet
        });
    } catch (error) {
        console.error("Error deleting pet:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format"
            });
        }
        
        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const createPetWithImage = async(req,res) =>{
    try {
        const file = req.file;
        const {name,specie,birthDate} = req.body;
        
        if(!name||!specie||!birthDate) {
            return res.status(400).send({
                status:"error",
                error:"Incomplete values"
            });
        }
        
        if (!file) {
            return res.status(400).send({
                status: "error",
                error: "Image file is required"
            });
        }
        
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image:`${__dirname}/../public/img/${file.filename}`
        });
        
        const result = await petsService.create(pet);
        res.send({
            status: "success",
            payload: result,
            message: "Pet created with image successfully"
        });
    } catch (error) {
        console.error("Error creating pet with image:", error);
        res.status(500).send({
            status: "error",
            error: "Internal server error"
        });
    }
}

const getPetById = async(req,res) =>{
    try {
        const petId = req.params.pid;
        
        if (!petId || petId.trim() === '') {
            return res.status(400).send({
                status: "error", 
                error: "Pet ID is required"
            });
        }
        
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(petId)) {
            return res.status(400).send({
                status: "error", 
                error: "Invalid pet ID format"
            });
        }
        
        const pet = await petsService.getBy({_id: petId});
        if(!pet) {
            return res.status(404).send({
                status:"error",
                error:"Pet not found"
            });
        }
        
        res.send({
            status:"success",
            payload: pet
        });
    } catch (error) {
        console.error("Error getting pet by ID:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid pet ID format"
            });
        }
        
        res.status(500).send({
            status:"error",
            error:"Internal server error"
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