import cookieParser from 'cookie-parser';
import express from 'express';

import adoptionsController from '../src/controllers/adoptions.controller.js';
import mockingController from '../src/controllers/mocks.controller.js';
import petsController from '../src/controllers/pets.controller.js';
import sessionsController from '../src/controllers/sessions.controller.js';
import usersController from '../src/controllers/users.controller.js';

export const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser('test-secret'));

    // Sessions
    app.post('/api/sessions/register', sessionsController.register);
    app.post('/api/sessions/login', sessionsController.login);
    app.get('/api/sessions/current', sessionsController.current);
    app.get('/api/sessions/logout', sessionsController.logout);
    app.post('/api/sessions/unprotectedLogin', sessionsController.unprotectedLogin);
    app.get('/api/sessions/unprotectedCurrent', sessionsController.unprotectedCurrent);

    // Users
    app.get('/api/users', usersController.getAllUsers);
    app.get('/api/users/:uid', usersController.getUser);
    app.put('/api/users/:uid', usersController.updateUser);
    app.delete('/api/users/:uid', usersController.deleteUser);

    // Pets
    app.get('/api/pets', petsController.getAllPets);
    app.post('/api/pets', petsController.createPet);
    app.get('/api/pets/:pid', petsController.getPetById);
    app.put('/api/pets/:pid', petsController.updatePet);
    app.delete('/api/pets/:pid', petsController.deletePet);
    app.post('/api/pets/withimage', petsController.createPetWithImage);

    // Adoptions
    app.get('/api/adoptions', adoptionsController.getAllAdoptions);
    app.post('/api/adoptions/:uid/:pid', adoptionsController.createAdoption);
    app.get('/api/adoptions/:aid', adoptionsController.getAdoption);

    // Mocking
    app.get('/api/mocks/mockingusers', mockingController.generateMockUsers);
    app.get('/api/mocks/mockingpets', mockingController.generateMockPets);
    app.post('/api/mocks/generateData', mockingController.generateAndInsertData);

    return app;
};