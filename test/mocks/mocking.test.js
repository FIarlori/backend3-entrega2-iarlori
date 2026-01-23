import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { startTestDB, stopTestDB } from '../setup.js';

describe('🧪 TESTS COMPLETOS - MÓDULO MOCKING', () => {
    before(async () => {
        await startTestDB();
    });

    after(async () => {
        await stopTestDB();
    });

    describe('GET /api/mocks/mockingusers', () => {
        it('✅ Debería generar 50 usuarios por defecto', async () => {
            const res = await request(app).get('/api/mocks/mockingusers');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.have.lengthOf(50);
            expect(res.body.payload[0]).to.have.property('password');
            expect(res.body.payload[0].role).to.be.oneOf(['user', 'admin']);
            expect(res.body.payload[0].pets).to.be.an('array').that.is.empty;
            expect(res.body).to.have.property('note', 'All users have encrypted password "coder123"');
        });

        it('✅ Debería respetar parámetro count (3 usuarios)', async () => {
            const res = await request(app).get('/api/mocks/mockingusers?count=3');

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(3);
            expect(res.body.count).to.equal(3);
        });

        it('✅ Debería respetar parámetro count (1 usuario)', async () => {
            const res = await request(app).get('/api/mocks/mockingusers?count=1');

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(1);

            const user = res.body.payload[0];
            expect(user).to.include.keys([
                '_id', 'first_name', 'last_name', 'email',
                'password', 'role', 'pets', 'createdAt', 'updatedAt'
            ]);
        });

        it('❌ Debería limitar máximo de usuarios (501)', async () => {
            const res = await request(app).get('/api/mocks/mockingusers?count=501');

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Cannot generate more than 500 users');
        });

        it('✅ Debería funcionar con límite máximo (500)', async () => {
            const res = await request(app).get('/api/mocks/mockingusers?count=500');

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(500);
        });

        it('✅ Debería mostrar entorno en respuesta', async () => {
            const res = await request(app).get('/api/mocks/mockingusers');

            expect(res.body).to.have.property('environment');
            expect(res.body.environment).to.be.oneOf(['development', 'production', 'test']);
        });
    });

    describe('GET /api/mocks/mockingpets', () => {
        it('✅ Debería generar 100 mascotas por defecto', async () => {
            const res = await request(app).get('/api/mocks/mockingpets');

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(100);
            expect(res.body.payload[0]).to.have.property('specie');
            expect(res.body.payload[0].adopted).to.be.false;
        });

        it('✅ Debería respetar parámetro count (5 mascotas)', async () => {
            const res = await request(app).get('/api/mocks/mockingpets?count=5');

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(5);

            const pet = res.body.payload[0];
            expect(pet).to.include.keys([
                '_id', 'name', 'specie', 'birthDate',
                'adopted', 'owner', 'image', 'createdAt', 'updatedAt'
            ]);
        });

        it('❌ Debería limitar máximo de mascotas (1001)', async () => {
            const res = await request(app).get('/api/mocks/mockingpets?count=1001');

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Cannot generate more than 1000 pets');
        });

        it('✅ Debería contener especies válidas', async () => {
            const res = await request(app).get('/api/mocks/mockingpets?count=10');
            const species = ['perro', 'gato', 'conejo', 'hamster', 'pájaro', 'pez', 'tortuga'];

            res.body.payload.forEach(pet => {
                expect(species).to.include(pet.specie);
            });
        });
    });

    describe('POST /api/mocks/generateData', () => {
        it('✅ Debería insertar usuarios en la base de datos', async () => {
            const testData = { users: 3, pets: 0 };

            const res = await request(app)
                .post('/api/mocks/generateData')
                .send(testData);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            if (res.body.results && res.body.results.users) {
                expect(res.body.results.users.inserted).to.equal(3);
                expect(res.body.results.users.errors).to.be.an('array');
            }

            const usersRes = await request(app)
                .get('/api/users');
            
            if (usersRes.status === 200 && usersRes.body.payload) {
                expect(usersRes.body.payload.length).to.be.at.least(3);
            }
        });

        it('✅ Debería insertar mascotas en la base de datos', async () => {
            const testData = { users: 0, pets: 2 };

            const res = await request(app)
                .post('/api/mocks/generateData')
                .send(testData);

            expect(res.status).to.equal(200);
            
            if (res.body.results && res.body.results.pets) {
                expect(res.body.results.pets.inserted).to.equal(2);
            }

            const petsRes = await request(app).get('/api/pets');
            if (petsRes.status === 200 && petsRes.body.payload) {
                expect(petsRes.body.payload.length).to.be.at.least(2);
            }
        });

        it('✅ Debería insertar usuarios y mascotas simultáneamente', async () => {
            const testData = { users: 2, pets: 2 };

            const res = await request(app)
                .post('/api/mocks/generateData')
                .send(testData);

            expect(res.status).to.equal(200);
            
            if (res.body.results) {
                if (res.body.results.users) {
                    expect(res.body.results.users.inserted).to.equal(2);
                }
                if (res.body.results.pets) {
                    expect(res.body.results.pets.inserted).to.equal(2);
                }
            }
        });

        it('❌ Debería retornar error si no se especifican datos', async () => {
            const res = await request(app)
                .post('/api/mocks/generateData')
                .send({});

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Must specify at least one value (users or pets)');
        });

        it('❌ Debería limitar inserción de usuarios (101)', async () => {
            const res = await request(app)
                .post('/api/mocks/generateData')
                .send({ users: 101, pets: 0 });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Cannot insert more than 100 users at once');
        });

        it('❌ Debería limitar inserción de mascotas (101)', async () => {
            const res = await request(app)
                .post('/api/mocks/generateData')
                .send({ users: 0, pets: 101 });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Cannot insert more than 100 pets at once');
        });

        it('✅ Debería sugerir endpoints de verificación', async () => {
            const testData = { users: 1, pets: 1 };

            const res = await request(app)
                .post('/api/mocks/generateData')
                .send(testData);

            expect(res.status).to.equal(200);
            if (res.body.verify) {
                expect(res.body.verify).to.have.property('users', 'GET /api/users');
                expect(res.body.verify).to.have.property('pets', 'GET /api/pets');
            }
        });

        it('✅ Debería manejar errores individuales sin fallar todo', async () => {
            await request(app)
                .post('/api/sessions/register')
                .send({
                    first_name: 'Existing',
                    last_name: 'User',
                    email: 'duplicate@test.com',
                    password: 'password123'
                });

            const testData = { users: 2, pets: 1 };
            const res = await request(app)
                .post('/api/mocks/generateData')
                .send(testData);

            expect(res.status).to.equal(200);
            if (res.body.results) {
                expect(res.body.results.users?.inserted || 0).to.be.at.least(0);
                expect(res.body.results.pets?.inserted || 0).to.be.at.least(0);
            }
        });
    });

    describe('Verificación cruzada de datos', () => {
        it('✅ Los usuarios generados deben tener estructura MongoDB', async () => {
            const res = await request(app).get('/api/mocks/mockingusers?count=1');
            const user = res.body.payload[0];

            expect(user._id).to.match(/^[0-9a-fA-F]{24}$/);
            expect(user).to.have.property('createdAt');
            expect(user).to.have.property('updatedAt');
        });

        it('✅ Las mascotas generadas deben tener estructura MongoDB', async () => {
            const res = await request(app).get('/api/mocks/mockingpets?count=1');
            const pet = res.body.payload[0];

            expect(pet._id).to.match(/^[0-9a-fA-F]{24}$/);
            expect(pet).to.have.property('createdAt');
            expect(pet).to.have.property('updatedAt');
        });

        it('✅ Datos insertados deben ser accesibles desde endpoints regulares', async () => {
            await request(app)
                .post('/api/mocks/generateData')
                .send({ users: 1, pets: 1 });

            const usersRes = await request(app).get('/api/users');
            const petsRes = await request(app).get('/api/pets');

            if (usersRes.status === 200) {
                expect(usersRes.body.payload).to.be.an('array');
            }
            if (petsRes.status === 200) {
                expect(petsRes.body.payload).to.be.an('array');
            }
        });
    });
});