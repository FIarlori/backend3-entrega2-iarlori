import { Router } from 'express';
import mockingController from '../controllers/mocks.controller.js';

const router = Router();

router.get('/mockingpets', mockingController.generateMockPets);
router.get('/mockingusers', mockingController.generateMockUsers);
router.post('/generateData', mockingController.generateAndInsertData);

export default router;