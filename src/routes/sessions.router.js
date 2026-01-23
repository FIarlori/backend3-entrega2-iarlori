import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js'; 

const router = Router();

router.post('/register', sessionsController.register);
router.post('/login', sessionsController.login);
router.post('/unprotectedLogin', sessionsController.unprotectedLogin);
router.get('/unprotectedCurrent', sessionsController.unprotectedCurrent);

router.get('/current', authMiddleware, sessionsController.current);
router.get('/logout', authMiddleware, sessionsController.logout);

export default router;