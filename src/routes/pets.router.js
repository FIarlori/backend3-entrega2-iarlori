import { Router } from 'express';
import petsController from '../controllers/pets.controller.js';
import uploader from '../utils/uploader.js';
import authMiddleware from '../middlewares/auth.middleware.js'; 

const router = Router();

router.get('/', petsController.getAllPets);
router.get('/:pid', petsController.getPetById);

router.post('/', authMiddleware, petsController.createPet);
router.post('/withimage', authMiddleware, uploader.single('image'), petsController.createPetWithImage);
router.put('/:pid', authMiddleware, petsController.updatePet);
router.delete('/:pid', authMiddleware, petsController.deletePet);

export default router;