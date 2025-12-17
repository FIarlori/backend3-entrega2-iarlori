import { adoptionsService, petsService, usersService } from "../services/index.js"

const getAllAdoptions = async(req,res)=>{
    try {
        const result = await adoptionsService.getAll();
        res.send({status:"success",payload:result})
    } catch (error) {
        console.error("Error getting all adoptions:", error);
        res.status(500).send({status:"error",error:"Internal server error"})
    }
}

const getAdoption = async(req,res)=>{
    try {
        const adoptionId = req.params.aid;
        
        if (!adoptionId || adoptionId.trim() === '') {
            return res.status(400).send({
                status: "error", 
                error: "Adoption ID is required"
            });
        }
        
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(adoptionId)) {
            return res.status(400).send({
                status: "error", 
                error: "Invalid adoption ID format"
            });
        }
        
        const adoption = await adoptionsService.getBy({_id:adoptionId});
        if(!adoption) {
            return res.status(404).send({
                status:"error",
                error:"Adoption not found"
            });
        }
        
        res.send({status:"success",payload:adoption});
    } catch (error) {
        console.error("Error getting adoption:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid adoption ID format"
            });
        }
        
        res.status(500).send({
            status:"error",
            error:"Internal server error"
        });
    }
}

const createAdoption = async(req,res)=>{
    try {
        const {uid,pid} = req.params;
        
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        
        if (!uid || !objectIdRegex.test(uid)) {
            return res.status(400).send({
                status: "error", 
                error: "Invalid user ID format"
            });
        }
        
        if (!pid || !objectIdRegex.test(pid)) {
            return res.status(400).send({
                status: "error", 
                error: "Invalid pet ID format"
            });
        }
        
        const user = await usersService.getUserById(uid);
        if(!user) {
            return res.status(404).send({
                status:"error", 
                error:"user Not found"
            });
        }
        
        const pet = await petsService.getBy({_id:pid});
        if(!pet) {
            return res.status(404).send({
                status:"error",
                error:"Pet not found"
            });
        }
        
        if(pet.adopted) {
            return res.status(400).send({
                status:"error",
                error:"Pet is already adopted"
            });
        }
        
        user.pets.push(pet._id);
        await usersService.update(user._id,{pets:user.pets})
        await petsService.update(pet._id,{adopted:true,owner:user._id})
        await adoptionsService.create({owner:user._id,pet:pet._id})
        
        res.send({status:"success",message:"Pet adopted"});
    } catch (error) {
        console.error("Error creating adoption:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid ID format"
            });
        }
        
        res.status(500).send({
            status:"error",
            error:"Internal server error"
        });
    }
}

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption
}