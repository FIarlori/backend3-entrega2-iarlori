import { expect } from 'chai';
import cookieParser from 'cookie-parser';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import adoptionsController from '../../src/controllers/adoptions.controller.js';
import petsController from '../../src/controllers/pets.controller.js';
import sessionsController from '../../src/controllers/sessions.controller.js';
import usersController from '../../src/controllers/users.controller.js';

const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser('test-secret'));

    app.post('/api/sessions/register', sessionsController.register);
    app.post('/api/sessions/login', sessionsController.login);
    app.get('/api/sessions/current', sessionsController.current);

    app.get('/api/users', usersController.getAllUsers);
    app.get('/api/users/:uid', usersController.getUser);

    app.get('/api/pets', petsController.getAllPets);
    app.post('/api/pets', petsController.createPet);
    app.get('/api/pets/:pid', petsController.getPetById);
    app.put('/api/pets/:pid', petsController.updatePet);
    app.delete('/api/pets/:pid', petsController.deletePet);
    app.post('/api/pets/withimage', petsController.createPetWithImage);

    app.get('/api/adoptions', adoptionsController.getAllAdoptions);
    app.post('/api/adoptions/:uid/:pid', adoptionsController.createAdoption);

    return app;
};

describe('🐾 TESTS COMPLETOS - MÓDULO PETS', () => {
    let mongoServer;
    let testApp;
    let server;
    let baseUrl;
    let token;
    let testUserId;
    let testPetId;
    let testPetId2;

    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ MongoDB en memoria conectado');

        testApp = createTestApp();
        server = testApp.listen(0);
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;

        console.log(`✅ Servidor de test en puerto: ${port}`);

        const registerRes = await request(baseUrl)
            .post('/api/sessions/register')
            .send({
                first_name: 'Pet',
                last_name: 'Tester',
                email: 'pet.tester@example.com',
                password: 'password123'
            });

        expect(registerRes.status).to.equal(200);
        expect(registerRes.body).to.have.property('status', 'success');
        testUserId = registerRes.body.payload;
        console.log(`✅ Usuario creado: ${testUserId}`);


        const loginRes = await request(baseUrl)
            .post('/api/sessions/login')
            .send({
                email: 'pet.tester@example.com',
                password: 'password123'
            });

        expect(loginRes.status).to.equal(200);
        expect(loginRes.body).to.have.property('status', 'success');
        expect(loginRes.headers['set-cookie']).to.exist;

        token = loginRes.headers['set-cookie'][0];
        console.log(`✅ Token obtenido`);


        await mongoose.connection.collection('pets').deleteMany({});
    });

    after(async () => {
        if (server) {
            server.close();
            console.log('✅ Servidor cerrado');
        }

        await mongoose.disconnect();
        console.log('✅ MongoDB desconectado');

        if (mongoServer) {
            await mongoServer.stop();
            console.log('✅ MongoDB en memoria detenido');
        }
    });

    beforeEach(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.collection('pets').deleteMany({});
        }
    });

    describe('GET /api/pets', () => {
        it('✅ Debería retornar lista de mascotas (inicialmente vacía)', async () => {
            const res = await request(baseUrl).get('/api/pets');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array');
        });
    });

    describe('POST /api/pets', () => {
        it('✅ Debería crear nueva mascota exitosamente', async () => {
            const newPet = {
                name: 'Max',
                specie: 'perro',
                birthDate: '2020-01-15'
            };

            const res = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send(newPet);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.have.property('name', 'Max');
            expect(res.body.payload).to.have.property('specie', 'perro');
            expect(res.body.payload).to.have.property('adopted', false);
            expect(res.body).to.have.property('message', 'Pet created successfully');

            testPetId = res.body.payload._id;
            console.log(`✅ Mascota 1 creada: ${testPetId}`);
        });

        it('❌ Debería retornar error por datos incompletos (sin nombre)', async () => {
            const res = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    specie: 'perro',
                    birthDate: '2020-01-15'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Incomplete values');
        });

        it('❌ Debería retornar error por datos incompletos (sin especie)', async () => {
            const res = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Max',
                    birthDate: '2020-01-15'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Incomplete values');
        });

        it('❌ Debería retornar error por datos incompletos (sin fecha)', async () => {
            const res = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Max',
                    specie: 'perro'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Incomplete values');
        });

        it('✅ Debería crear segunda mascota para tests', async () => {
            const newPet = {
                name: 'Luna',
                specie: 'gato',
                birthDate: '2021-03-20'
            };

            const res = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send(newPet);

            expect(res.status).to.equal(200);
            testPetId2 = res.body.payload._id;
            console.log(`✅ Mascota 2 creada: ${testPetId2}`);
        });
    });

    describe('GET /api/pets/:pid', () => {
        it('✅ Debería retornar mascota por ID', async () => {
            const petRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Test Pet for ID',
                    specie: 'perro',
                    birthDate: '2020-01-15'
                });

            const createdPetId = petRes.body.payload._id;
            console.log(`✅ Mascota creada para test ID: ${createdPetId}`);

            const res = await request(baseUrl).get(`/api/pets/${createdPetId}`);

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.property('_id', createdPetId);
        });

        it('❌ Debería retornar 404 para mascota inexistente', async () => {
            const res = await request(baseUrl).get('/api/pets/507f1f77bcf86cd799439999');

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Pet not found');
        });

        it('❌ Debería retornar 400 para ID inválido', async () => {
            const res = await request(baseUrl).get('/api/pets/invalid_id');

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid pet ID format');
        });

        it('✅ No debería requerir autenticación para GET', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Test Public Access',
                    specie: 'perro',
                    birthDate: '2020-01-15'
                });

            const publicPetId = createRes.body.payload._id;
            console.log(`✅ Mascota para test público: ${publicPetId}`);

            const res = await request(baseUrl).get(`/api/pets/${publicPetId}`);
            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.property('_id', publicPetId);
        });
    });

    describe('PUT /api/pets/:pid', () => {
        it('✅ Debería actualizar mascota existente', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Para Actualizar',
                    specie: 'conejo',
                    birthDate: '2020-01-15'
                });

            const petToUpdateId = createRes.body.payload._id;

            const updates = {
                name: 'Nombre Actualizado',
                specie: 'hamster'
            };

            const res = await request(baseUrl)
                .put(`/api/pets/${petToUpdateId}`)
                .set('Cookie', [token])
                .send(updates);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Pet updated successfully');
            expect(res.body).to.have.property('petId', petToUpdateId);

            const getRes = await request(baseUrl).get(`/api/pets/${petToUpdateId}`);
            expect(getRes.body.payload.name).to.equal('Nombre Actualizado');
            expect(getRes.body.payload.specie).to.equal('hamster');
        });

        it('✅ Debería marcar mascota como adoptada', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Para Adoptar',
                    specie: 'pájaro',
                    birthDate: '2021-03-20'
                });

            const petToAdoptId = createRes.body.payload._id;

            const updates = {
                adopted: true
            };

            const res = await request(baseUrl)
                .put(`/api/pets/${petToAdoptId}`)
                .set('Cookie', [token])
                .send(updates);

            expect(res.status).to.equal(200);

            const getRes = await request(baseUrl).get(`/api/pets/${petToAdoptId}`);
            expect(getRes.body.payload.adopted).to.be.true;
        });

        it('❌ Debería retornar 404 para mascota inexistente', async () => {
            const res = await request(baseUrl)
                .put('/api/pets/507f1f77bcf86cd799439999')
                .set('Cookie', [token])
                .send({ name: 'Updated' });

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Pet not found');
        });

        it('❌ Debería retornar 400 para ID inválido', async () => {
            const res = await request(baseUrl)
                .put('/api/pets/invalid_id')
                .set('Cookie', [token])
                .send({ name: 'Updated' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid pet ID format');
        });
    });

    describe('DELETE /api/pets/:pid', () => {
        it('✅ Debería eliminar mascota existente', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Para Eliminar',
                    specie: 'tortuga',
                    birthDate: '2019-05-10'
                });

            const petToDeleteId = createRes.body.payload._id;
            console.log(`✅ Mascota para eliminar creada: ${petToDeleteId}`);

            const res = await request(baseUrl)
                .delete(`/api/pets/${petToDeleteId}`)
                .set('Cookie', [token]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Pet deleted successfully');
            expect(res.body).to.have.property('petId', petToDeleteId);
            expect(res.body).to.have.property('deletedPet');

            const getRes = await request(baseUrl).get(`/api/pets/${petToDeleteId}`);
            expect(getRes.status).to.equal(404);
        });

        it('❌ Debería retornar 404 para mascota inexistente', async () => {
            const res = await request(baseUrl)
                .delete('/api/pets/507f1f77bcf86cd799439999')
                .set('Cookie', [token]);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Pet not found');
        });

        it('❌ Debería retornar 400 para ID inválido', async () => {
            const res = await request(baseUrl)
                .delete('/api/pets/invalid_id')
                .set('Cookie', [token]);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid pet ID format');
        });

        it('✅ Debería retornar mascota eliminada en respuesta', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Otra Para Eliminar',
                    specie: 'pez',
                    birthDate: '2020-08-15'
                });

            const anotherPetId = createRes.body.payload._id;

            const deleteRes = await request(baseUrl)
                .delete(`/api/pets/${anotherPetId}`)
                .set('Cookie', [token]);

            expect(deleteRes.status).to.equal(200);
            expect(deleteRes.body).to.have.property('deletedPet');
            expect(deleteRes.body.deletedPet).to.have.property('_id', anotherPetId);
            expect(deleteRes.body.deletedPet).to.have.property('name', 'Otra Para Eliminar');
        });
    });

    describe('POST /api/pets/withimage', () => {
        it('✅ Debería manejar endpoint de imagen (simulación)', async () => {
            const res = await request(baseUrl)
                .post('/api/pets/withimage')
                .set('Cookie', [token])
                .field('name', 'Pet con Imagen')
                .field('specie', 'perro')
                .field('birthDate', '2020-01-15');

            expect(res.status).to.not.equal(404);

            if (res.status === 400) {
                expect(res.body).to.have.property('error');
            }
        });
    });

    describe('Validación de datos', () => {
        it('✅ Las mascotas deben tener formato correcto', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Pet Validación',
                    specie: 'gato',
                    birthDate: '2021-03-20'
                });

            const petId = createRes.body.payload._id;
            const res = await request(baseUrl).get(`/api/pets/${petId}`);
            const pet = res.body.payload;

            expect(pet).to.have.property('_id');
            expect(pet).to.have.property('name');
            expect(pet).to.have.property('specie');
            expect(pet).to.have.property('birthDate');
            expect(pet).to.have.property('adopted');
            expect(pet.adopted).to.be.a('boolean');

            if (pet.image !== undefined) {
                expect(pet.image).to.be.a('string');
            }

            if (pet.owner !== undefined) {
                expect(pet.owner).to.satisfy((owner) => {
                    return owner === null || typeof owner === 'string';
                });
            }
        });

        it('✅ Las fechas deben estar en formato correcto', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Test Date Format',
                    specie: 'gato',
                    birthDate: '2021-03-20'
                });

            const datePetId = createRes.body.payload._id;

            const res = await request(baseUrl).get(`/api/pets/${datePetId}`);
            const pet = res.body.payload;

            expect(pet.birthDate).to.exist;
            const birthDate = new Date(pet.birthDate);
            expect(birthDate.toString()).to.not.equal('Invalid Date');
            expect(birthDate.getFullYear()).to.equal(2021);
        });
    });

    describe('Flujo completo CRUD', () => {
        it('✅ Debería permitir flujo completo: crear → leer → actualizar → eliminar', async () => {
            const createRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Flujo Test',
                    specie: 'tortuga',
                    birthDate: '2019-07-15'
                });

            expect(createRes.status).to.equal(200);
            const petId = createRes.body.payload._id;

            const readRes = await request(baseUrl).get(`/api/pets/${petId}`);
            expect(readRes.status).to.equal(200);
            expect(readRes.body.payload.name).to.equal('Flujo Test');

            const updateRes = await request(baseUrl)
                .put(`/api/pets/${petId}`)
                .set('Cookie', [token])
                .send({ name: 'Flujo Test Actualizado' });

            expect(updateRes.status).to.equal(200);

            const verifyRes = await request(baseUrl).get(`/api/pets/${petId}`);
            expect(verifyRes.body.payload.name).to.equal('Flujo Test Actualizado');

            const deleteRes = await request(baseUrl)
                .delete(`/api/pets/${petId}`)
                .set('Cookie', [token]);

            expect(deleteRes.status).to.equal(200);

            const finalRes = await request(baseUrl).get(`/api/pets/${petId}`);
            expect(finalRes.status).to.equal(404);
        });
    });

    describe('Relación con adopciones', () => {
        it('✅ Debería actualizarse cuando se adopta una mascota', async () => {
            const petRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [token])
                .send({
                    name: 'Para Adopción',
                    specie: 'perro',
                    birthDate: '2020-01-15'
                });

            const petId = petRes.body.payload._id;

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${petId}`)
                .set('Cookie', [token]);

            expect(adoptionRes.status).to.equal(200);

            const getRes = await request(baseUrl).get(`/api/pets/${petId}`);
            expect(getRes.body.payload.adopted).to.be.true;
            expect(getRes.body.payload.owner).to.equal(testUserId);
        });
    });
});