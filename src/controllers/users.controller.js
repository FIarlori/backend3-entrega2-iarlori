import { usersService } from "../services/index.js"

const getAllUsers = async(req,res)=>{
    try {
        const users = await usersService.getAll();
        res.send({status:"success",payload:users})
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).send({status:"error", error:"Internal server error"})
    }
}

const getUser = async(req,res)=> {
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
        if(!user) {
            return res.status(404).send({
                status:"error",
                error:"User not found"
            });
        }
        
        res.send({
            status:"success",
            payload:user
        });
    } catch (error) {
        console.error("Error getting user:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format",
                details: "The provided ID is not a valid MongoDB ObjectId"
            });
        }
        
        res.status(500).send({
            status:"error",
            error:"Internal server error"
        });
    }
}

const updateUser = async(req,res)=>{
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
        if(!user) {
            return res.status(404).send({
                status:"error", 
                error:"User not found"
            });
        }
        
        const result = await usersService.update(userId, updateBody);
        res.send({
            status:"success",
            message:"User updated"
        });
    } catch (error) {
        console.error("Error updating user:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }
        
        res.status(500).send({
            status:"error", 
            error:"Internal server error"
        });
    }
}

const deleteUser = async(req,res) =>{
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
        if(!user) {
            return res.status(404).send({
                status:"error", 
                error:"User not found"
            });
        }
        
        const result = await usersService.delete(userId);
        res.send({
            status:"success",
            message:"User deleted"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "Invalid user ID format"
            });
        }
        
        res.status(500).send({
            status:"error", 
            error:"Internal server error"
        });
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}