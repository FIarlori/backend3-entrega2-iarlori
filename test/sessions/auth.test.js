import { expect } from 'chai';
import cookieParser from 'cookie-parser';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import sessionsController from '../../src/controllers/sessions.controller.js';

const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser('test-secret'));

    app.post('/api/sessions/register', sessionsController.register);
    app.post('/api/sessions/login', sessionsController.login);
    app.get('/api/sessions/current', sessionsController.current);
    app.get('/api/sessions/logout', sessionsController.logout);
    app.post('/api/sessions/unprotectedLogin', sessionsController.unprotectedLogin);
    app.get('/api/sessions/unprotectedCurrent', sessionsController.unprotectedCurrent);

    return app;
};

describe('🔐 TESTS COMPLETOS - AUTENTICACIÓN Y SESIONES', () => {
    let mongoServer;
    let testApp;
    let server;
    let baseUrl;

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

        await mongoose.connection.collection('users').deleteMany({});
    });

    after(async () => {
        if (server) server.close();
        await mongoose.disconnect();
        if (mongoServer) await mongoServer.stop();
    });

    beforeEach(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.collection('users').deleteMany({});
        }
    });

    describe('POST /api/sessions/register', () => {
        it('✅ Debería registrar nuevo usuario exitosamente', async () => {
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const res = await request(baseUrl)
                .post('/api/sessions/register')
                .send(userData);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
        });

        it('❌ Debería retornar error por email duplicado', async () => {
            const userData = {
                first_name: 'First',
                last_name: 'User',
                email: 'duplicate@example.com',
                password: 'password123'
            };

            const firstRes = await request(baseUrl)
                .post('/api/sessions/register')
                .send(userData);

            expect(firstRes.status).to.equal(200);

            const secondRes = await request(baseUrl)
                .post('/api/sessions/register')
                .send(userData);

            expect(secondRes.status).to.be.oneOf([400, 500]);
            expect(secondRes.body).to.have.property('status', 'error');
        });
    });

    describe('POST /api/sessions/login', () => {
        beforeEach(async () => {
            const userData = {
                first_name: 'Login',
                last_name: 'Test',
                email: 'login.test@example.com',
                password: 'testpassword123'
            };

            await request(baseUrl)
                .post('/api/sessions/register')
                .send(userData);
        });

        it('✅ Debería iniciar sesión exitosamente', async () => {
            const credentials = {
                email: 'login.test@example.com',
                password: 'testpassword123'
            };

            const res = await request(baseUrl)
                .post('/api/sessions/login')
                .send(credentials);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Logged in successfully');

            expect(res.headers['set-cookie']).to.exist;
            const cookies = res.headers['set-cookie'];
            expect(cookies.some(cookie => cookie.includes('coderCookie'))).to.be.true;
        });
    });

    describe('GET /api/sessions/current', () => {
        let testToken;

        beforeEach(async () => {
            await request(baseUrl)
                .post('/api/sessions/register')
                .send({
                    first_name: 'Current',
                    last_name: 'User',
                    email: 'current.user@example.com',
                    password: 'password123'
                });

            const loginRes = await request(baseUrl)
                .post('/api/sessions/login')
                .send({
                    email: 'current.user@example.com',
                    password: 'password123'
                });

            expect(loginRes.status).to.equal(200);
            testToken = loginRes.headers['set-cookie']
                .find(cookie => cookie.includes('coderCookie'));
        });

        it('✅ Debería retornar usuario actual autenticado', async () => {
            const res = await request(baseUrl)
                .get('/api/sessions/current')
                .set('Cookie', [testToken]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.have.property('name');
            expect(res.body.payload).to.have.property('email');
        });

        it('❌ Debería retornar error sin cookie de autenticación', async () => {
            const res = await request(baseUrl).get('/api/sessions/current');

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('status', 'error');
        });
    });

    describe('GET /api/sessions/logout', () => {
        let testToken;

        beforeEach(async () => {
            await request(baseUrl)
                .post('/api/sessions/register')
                .send({
                    first_name: 'Logout',
                    last_name: 'Test',
                    email: 'logout.test@example.com',
                    password: 'password123'
                });

            const loginRes = await request(baseUrl)
                .post('/api/sessions/login')
                .send({
                    email: 'logout.test@example.com',
                    password: 'password123'
                });

            expect(loginRes.status).to.equal(200);
            testToken = loginRes.headers['set-cookie']
                .find(cookie => cookie.includes('coderCookie'));
        });

        it('✅ Debería cerrar sesión exitosamente', async () => {
            const res = await request(baseUrl)
                .get('/api/sessions/logout')
                .set('Cookie', [testToken]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Logged out successfully');
        });
    });

    describe('Flujo completo de autenticación', () => {
        it('✅ Debería permitir flujo completo: registro → login → current → logout', async () => {
            const registerRes = await request(baseUrl)
                .post('/api/sessions/register')
                .send({
                    first_name: 'Full',
                    last_name: 'Flow',
                    email: 'full.flow@example.com',
                    password: 'password123'
                });

            expect(registerRes.status).to.equal(200);

            const loginRes = await request(baseUrl)
                .post('/api/sessions/login')
                .send({
                    email: 'full.flow@example.com',
                    password: 'password123'
                });

            expect(loginRes.status).to.equal(200);
            const token = loginRes.headers['set-cookie']
                .find(cookie => cookie.includes('coderCookie'));

            const currentRes = await request(baseUrl)
                .get('/api/sessions/current')
                .set('Cookie', [token]);

            expect(currentRes.status).to.equal(200);

            const logoutRes = await request(baseUrl)
                .get('/api/sessions/logout')
                .set('Cookie', [token]);

            expect(logoutRes.status).to.equal(200);
        });
    });
});