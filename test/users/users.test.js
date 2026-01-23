import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { startTestDB, stopTestDB } from '../setup.js';

describe('👥 TESTS COMPLETOS - MÓDULO USERS', () => {
    let testUserId;
    let testUser2Id;

    before(async () => {
        await startTestDB();

        const user1Res = await request(app)
            .post('/api/sessions/register')
            .send({
                first_name: 'Test',
                last_name: 'User1',
                email: 'test1@test.com',
                password: 'password123'
            });

        testUserId = user1Res.body.payload;

        const user2Res = await request(app)
            .post('/api/sessions/register')
            .send({
                first_name: 'Test',
                last_name: 'User2',
                email: 'test2@test.com',
                password: 'password123'
            });

        testUser2Id = user2Res.body.payload;
    });

    after(async () => {
        await stopTestDB();
    });

    describe('GET /api/users', () => {
        it('✅ Debería retornar lista de usuarios', async () => {
            const res = await request(app).get('/api/users');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload.length).to.be.at.least(2);
        });

        it('✅ Los usuarios deben tener estructura básica', async () => {
            const res = await request(app).get('/api/users');

            const user = res.body.payload[0];
            expect(user).to.include.keys([
                '_id', 'first_name', 'last_name', 'email',
                'role', 'pets'
            ]);
            expect(user.pets).to.be.an('array');
        });
    });

    describe('GET /api/users/:uid', () => {
        it('✅ Debería retornar usuario por ID', async () => {
            const res = await request(app).get(`/api/users/${testUserId}`);

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.property('_id', testUserId);
            expect(res.body.payload).to.have.property('email', 'test1@test.com');
        });

        it('❌ Debería retornar 404 para usuario inexistente', async () => {
            const res = await request(app)
                .get('/api/users/507f1f77bcf86cd799439999');

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'User not found');
        });

        it('❌ Debería retornar 400 para ID inválido', async () => {
            const res = await request(app).get('/api/users/invalid_id');

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
        });

        it('✅ No debería incluir password en la respuesta', async () => {
            const res = await request(app).get(`/api/users/${testUserId}`);

            expect(res.body.payload).to.not.have.property('password');
        });
    });

    describe('PUT /api/users/:uid', () => {
        let userToUpdateId;

        beforeEach(async () => {
            const registerRes = await request(app)
                .post('/api/sessions/register')
                .send({
                    first_name: 'ToUpdate',
                    last_name: 'User',
                    email: `toupdate${Date.now()}@test.com`,
                    password: 'password123'
                });

            expect(registerRes.status).to.equal(200);
            userToUpdateId = registerRes.body.payload;
        });

        it('✅ Debería actualizar usuario', async () => {
            const updates = {
                first_name: 'UpdatedName'
            };

            const res = await request(app)
                .put(`/api/users/${userToUpdateId}`)
                .send(updates);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
        });

        it('❌ Debería retornar 404 para usuario inexistente', async () => {
            const res = await request(app)
                .put('/api/users/507f1f77bcf86cd799439999')
                .send({ first_name: 'Updated' });

            expect(res.status).to.equal(404);
        });
    });

    describe('DELETE /api/users/:uid', () => {
        let userToDeleteId;

        beforeEach(async () => {
            const registerRes = await request(app)
                .post('/api/sessions/register')
                .send({
                    first_name: 'ToDelete',
                    last_name: 'User',
                    email: `todelete${Date.now()}@test.com`,
                    password: 'password123'
                });

            expect(registerRes.status).to.equal(200);
            userToDeleteId = registerRes.body.payload;
        });

        it('✅ Debería eliminar usuario', async () => {
            const res = await request(app)
                .delete(`/api/users/${userToDeleteId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');

            const getRes = await request(app).get(`/api/users/${userToDeleteId}`);
            expect(getRes.status).to.equal(404);
        });

        it('❌ Debería retornar 404 para usuario inexistente', async () => {
            const res = await request(app)
                .delete('/api/users/507f1f77bcf86cd799439999');

            expect(res.status).to.equal(404);
        });
    });
});