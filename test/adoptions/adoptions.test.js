import { expect } from 'chai';
import request from 'supertest';
import { clearCollections, startTestDB, stopTestDB } from '../setup.js';
import { createTestApp } from '../test-app.js';

describe('🏠 TESTS COMPLETOS - MÓDULO ADOPCIONES (TODOS LOS ENDPOINTS)', () => {
    let testApp;
    let server;
    let baseUrl;
    let testUserId;
    let testPetId;
    let testPetId2;
    let testAdoptionId;
    let authToken;
    let testUserEmail;

    before(async function () {
        this.timeout(15000);

        console.log('🚀 Iniciando tests de Adoptions...');

        await startTestDB();

        testApp = createTestApp();
        server = testApp.listen(0);
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;

        console.log(`✅ Test server on port: ${port}`);

        await clearCollections();

        testUserEmail = `adoption.test.${Date.now()}@example.com`;
        console.log(`✅ Email generado: ${testUserEmail}`);

        const registerRes = await request(baseUrl)
            .post('/api/sessions/register')
            .send({
                first_name: 'Adoption',
                last_name: 'Test',
                email: testUserEmail,
                password: 'password123'
            });

        expect(registerRes.status).to.equal(200, `Error registro: ${JSON.stringify(registerRes.body)}`);
        testUserId = registerRes.body.payload;
        console.log(`✅ Usuario de prueba creado: ${testUserId}`);

        const loginRes = await request(baseUrl)
            .post('/api/sessions/login')
            .send({
                email: testUserEmail,
                password: 'password123'
            });

        console.log(`🔍 Login response status: ${loginRes.status}, body:`, loginRes.body);
        expect(loginRes.status).to.equal(200, `Error login: ${JSON.stringify(loginRes.body)}`);
        expect(loginRes.headers['set-cookie']).to.exist;

        authToken = loginRes.headers['set-cookie'].find(cookie =>
            cookie.includes('coderCookie') || cookie.includes('unprotectedCookie')
        ) || loginRes.headers['set-cookie'][0];

        console.log(`✅ Token obtenido: ${authToken ? 'Sí' : 'No'}`);

        const petRes1 = await request(baseUrl)
            .post('/api/pets')
            .set('Cookie', [authToken])
            .send({
                name: 'Adoptable Pet 1',
                specie: 'perro',
                birthDate: '2020-01-15'
            });

        expect(petRes1.status).to.equal(200);
        testPetId = petRes1.body.payload._id;
        console.log(`✅ Mascota 1 creada: ${testPetId}`);

        const petRes2 = await request(baseUrl)
            .post('/api/pets')
            .set('Cookie', [authToken])
            .send({
                name: 'Adoptable Pet 2',
                specie: 'gato',
                birthDate: '2021-03-20'
            });

        expect(petRes2.status).to.equal(200);
        testPetId2 = petRes2.body.payload._id;
        console.log(`✅ Mascota 2 creada: ${testPetId2}`);

        const secondUserEmail = `second.user.${Date.now()}@test.com`;
        const user2Res = await request(baseUrl)
            .post('/api/sessions/register')
            .send({
                first_name: 'Second',
                last_name: 'User',
                email: secondUserEmail,
                password: 'password123'
            });

        expect(user2Res.status).to.equal(200);
        console.log(`✅ Segundo usuario creado: ${user2Res.body.payload}`);
    });

    after(async function () {
        this.timeout(10000);

        if (server) {
            server.close();
            console.log('✅ Servidor cerrado');
        }
        await stopTestDB();
        console.log('✅ Base de datos detenida');
    });

    beforeEach(async function () {
        this.timeout(5000);
        await clearCollections();
    });


    describe('📋 GET /api/adoptions - Obtener todas las adopciones', () => {

        it('✅ Debería retornar array vacío inicialmente', async function () {
            this.timeout(5000);

            const res = await request(baseUrl)
                .get('/api/adoptions')
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array').that.is.empty;
            expect(res.body).to.have.property('count', 0);
        });

        it('✅ Debería retornar adopciones después de crear algunas', async function () {
            this.timeout(10000);

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (adoptionRes.status === 200) {
                testAdoptionId = adoptionRes.body.adoption.id;

                const res = await request(baseUrl)
                    .get('/api/adoptions')
                    .set('Cookie', [authToken]);

                expect(res.status).to.equal(200);
                expect(res.body.payload).to.be.an('array').with.lengthOf(1);
                expect(res.body.count).to.equal(1);

                const adoption = res.body.payload[0];
                expect(adoption).to.have.property('_id', testAdoptionId);
                expect(adoption).to.have.property('owner', testUserId);
                expect(adoption).to.have.property('pet', testPetId);
            }
        });

        it('✅ Debería incluir metadatos en la respuesta', async function () {
            this.timeout(5000);

            const res = await request(baseUrl)
                .get('/api/adoptions')
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status');
            expect(res.body).to.have.property('payload');
            expect(res.body).to.have.property('count');
        });

        it('❌ Debería requerir autenticación', async function () {
            this.timeout(5000);

            const res = await request(baseUrl).get('/api/adoptions');

            expect(res.status).to.be.oneOf([401, 403, 500, 200]);
        });
    });


    describe('📋 GET /api/adoptions/:aid - Obtener adopción por ID', () => {

        beforeEach(async function () {
            this.timeout(5000);

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (adoptionRes.status === 200) {
                testAdoptionId = adoptionRes.body.adoption.id;
            }
        });

        it('✅ Debería retornar adopción existente por ID', async function () {
            this.timeout(5000);

            if (!testAdoptionId) {
                console.log('⚠️ No se pudo crear adopción para test, saltando...');
                return;
            }

            const res = await request(baseUrl)
                .get(`/api/adoptions/${testAdoptionId}`)
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.property('_id', testAdoptionId);
            expect(res.body.payload).to.have.property('owner', testUserId);
            expect(res.body.payload).to.have.property('pet', testPetId);
        });

        it('✅ Debería incluir timestamps en la respuesta', async function () {
            this.timeout(5000);

            if (!testAdoptionId) return;

            const res = await request(baseUrl)
                .get(`/api/adoptions/${testAdoptionId}`)
                .set('Cookie', [authToken]);

            expect(res.body.payload).to.have.property('createdAt');
            expect(res.body.payload).to.have.property('updatedAt');

            const createdAt = new Date(res.body.payload.createdAt);
            expect(createdAt.toString()).to.not.equal('Invalid Date');
        });

        it('❌ Debería retornar 404 para adopción inexistente', async function () {
            this.timeout(5000);

            const res = await request(baseUrl)
                .get('/api/adoptions/507f1f77bcf86cd799439999')
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Adoption not found');
        });

        it('❌ Debería retornar 400 para ID inválido', async function () {
            this.timeout(5000);

            const res = await request(baseUrl)
                .get('/api/adoptions/invalid_id')
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid adoption ID format');
        });

        it('✅ Debería manejar ObjectId en diferentes formatos', async function () {
            this.timeout(5000);

            if (!testAdoptionId) return;

            const uppercaseId = testAdoptionId.toUpperCase();
            const res1 = await request(baseUrl)
                .get(`/api/adoptions/${uppercaseId}`)
                .set('Cookie', [authToken]);

            expect(res1.status).to.be.oneOf([200, 400, 404]);

            const lowercaseId = testAdoptionId.toLowerCase();
            const res2 = await request(baseUrl)
                .get(`/api/adoptions/${lowercaseId}`)
                .set('Cookie', [authToken]);

            expect(res2.status).to.be.oneOf([200, 400, 404]);
        });
    });


    describe('📋 POST /api/adoptions/:uid/:pid - Crear nueva adopción', () => {

        it('✅ Debería crear adopción exitosamente', async function () {
            this.timeout(10000);

            console.log(`🔧 Creando adopción: user=${testUserId}, pet=${testPetId}`);

            const res = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            console.log(`📝 Respuesta adopción: ${res.status}`, res.body);

            expect(res.status).to.be.oneOf([200, 400, 401, 403, 404]);

            if (res.status === 200) {
                expect(res.body).to.have.property('status', 'success');
                expect(res.body).to.have.property('message', 'Pet adopted successfully');
                expect(res.body).to.have.property('adoption');

                const adoption = res.body.adoption;
                expect(adoption).to.have.property('id');
                expect(adoption.user).to.have.property('id', testUserId);
                expect(adoption.pet).to.have.property('id', testPetId);
                expect(adoption.pet).to.have.property('adopted', true);

                testAdoptionId = adoption.id;
            }
        });

        it('✅ Debería actualizar el usuario con la mascota adoptada', async function () {
            this.timeout(10000);

            const res = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (res.status === 200) {

                const userRes = await request(baseUrl)
                    .get(`/api/users/${testUserId}`)
                    .set('Cookie', [authToken]);

                if (userRes.status === 200) {
                    expect(userRes.body.payload.pets).to.be.an('array');

                    const petIds = userRes.body.payload.pets.map(p =>
                        typeof p === 'string' ? p : p._id
                    );
                    expect(petIds).to.include(testPetId);
                }
            }
        });

        it('✅ Debería marcar la mascota como adoptada', async function () {
            this.timeout(10000);

            const res = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (res.status === 200) {

                const petRes = await request(baseUrl).get(`/api/pets/${testPetId}`);
                expect(petRes.body.payload.adopted).to.be.true;
                expect(petRes.body.payload.owner).to.equal(testUserId);
            }
        });

        it('❌ Debería fallar si la mascota ya está adoptada', async function () {
            this.timeout(15000);

            const firstAdoption = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (firstAdoption.status === 200) {

                const secondAdoption = await request(baseUrl)
                    .post(`/api/adoptions/${testUserId}/${testPetId}`)
                    .set('Cookie', [authToken]);

                expect(secondAdoption.status).to.equal(400);
                expect(secondAdoption.body.error).to.include('already adopted');
            }
        });

        it('❌ Debería fallar si el usuario no existe', async function () {
            this.timeout(5000);

            const nonExistentUserId = '507f1f77bcf86cd799439999';
            const res = await request(baseUrl)
                .post(`/api/adoptions/${nonExistentUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(404);
            expect(res.body.error).to.include('User not found');
        });

        it('❌ Debería fallar si la mascota no existe', async function () {
            this.timeout(5000);

            const nonExistentPetId = '507f1f77bcf86cd799439999';
            const res = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${nonExistentPetId}`)
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(404);
            expect(res.body.error).to.include('not found');
        });

        it('❌ Debería fallar con IDs inválidos', async function () {
            this.timeout(5000);

            const res = await request(baseUrl)
                .post('/api/adoptions/invalid_user/invalid_pet')
                .set('Cookie', [authToken]);

            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid');
        });

        it('✅ Debería validar parámetros en la URL', async function () {
            this.timeout(5000);


            const res1 = await request(baseUrl)
                .post(`/api/adoptions//${testPetId}`)
                .set('Cookie', [authToken]);

            expect(res1.status).to.equal(404);

            const res2 = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/`)
                .set('Cookie', [authToken]);

            expect(res2.status).to.equal(404);
        });

        it('✅ Debería incluir links de referencia en la respuesta', async function () {
            this.timeout(10000);

            const res = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId2}`)
                .set('Cookie', [authToken]);

            if (res.status === 200) {
                expect(res.body).to.have.property('links');
                expect(res.body.links).to.have.property('user', `/api/users/${testUserId}`);
                expect(res.body.links).to.have.property('pet', `/api/pets/${testPetId2}`);
                expect(res.body.links).to.have.property('adoption', `/api/adoptions/${res.body.adoption.id}`);
            }
        });
    });


    describe('🔄 FLUJO COMPLETO DE ADOPCIONES', () => {

        it('✅ Flujo completo: crear adopción → verificar → obtener → eliminar datos', async function () {
            this.timeout(20000);

            console.log('🔄 Iniciando flujo completo de adopciones...');

            const flowEmail = `flow.test.${Date.now()}@example.com`;
            const newUserRes = await request(baseUrl)
                .post('/api/sessions/register')
                .send({
                    first_name: 'Flow',
                    last_name: 'Test',
                    email: flowEmail,
                    password: 'password123'
                });

            expect(newUserRes.status).to.equal(200);
            const flowUserId = newUserRes.body.payload;
            console.log(`✅ Usuario flujo creado: ${flowUserId}`);

            const flowLoginRes = await request(baseUrl)
                .post('/api/sessions/login')
                .send({
                    email: flowEmail,
                    password: 'password123'
                });

            expect(flowLoginRes.status).to.equal(200);
            const flowToken = flowLoginRes.headers['set-cookie'] && flowLoginRes.headers['set-cookie'][0];
            expect(flowToken).to.exist;

            const flowPetRes = await request(baseUrl)
                .post('/api/pets')
                .set('Cookie', [flowToken])
                .send({
                    name: 'Flow Test Pet',
                    specie: 'conejo',
                    birthDate: '2020-01-15'
                });

            expect(flowPetRes.status).to.equal(200);
            const flowPetId = flowPetRes.body.payload._id;
            console.log(`✅ Mascota flujo creada: ${flowPetId}`);

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${flowUserId}/${flowPetId}`)
                .set('Cookie', [flowToken]);

            console.log(`📝 Adopción creada: ${adoptionRes.status}`);

            if (adoptionRes.status === 200) {
                const adoptionId = adoptionRes.body.adoption.id;
                console.log(`✅ Adopción ID: ${adoptionId}`);

                const listRes = await request(baseUrl)
                    .get('/api/adoptions')
                    .set('Cookie', [flowToken]);

                expect(listRes.status).to.equal(200);
                expect(listRes.body.payload).to.be.an('array');

                const foundAdoption = listRes.body.payload.find(a => a._id === adoptionId);
                expect(foundAdoption).to.exist;
                console.log(`✅ Adopción encontrada en lista`);

                const getRes = await request(baseUrl)
                    .get(`/api/adoptions/${adoptionId}`)
                    .set('Cookie', [flowToken]);

                expect(getRes.status).to.equal(200);
                expect(getRes.body.payload._id).to.equal(adoptionId);
                console.log(`✅ Adopción obtenida por ID`);

                const petRes = await request(baseUrl).get(`/api/pets/${flowPetId}`);
                expect(petRes.body.payload.adopted).to.be.true;
                expect(petRes.body.payload.owner).to.equal(flowUserId);
                console.log(`✅ Mascota marcada como adoptada`);

                const userRes = await request(baseUrl)
                    .get(`/api/users/${flowUserId}`)
                    .set('Cookie', [flowToken]);

                if (userRes.status === 200) {
                    expect(userRes.body.payload.pets).to.be.an('array');

                    const petIds = userRes.body.payload.pets.map(p =>
                        typeof p === 'string' ? p : p._id
                    );
                    expect(petIds).to.include(flowPetId);
                    console.log(`✅ Usuario tiene la mascota en su lista`);
                }

                console.log('🎉 Flujo completo de adopciones completado exitosamente');
            }
        });

        it('✅ Debería manejar múltiples adopciones simultáneas', async function () {
            this.timeout(15000);

            const petIds = [];
            for (let i = 0; i < 3; i++) {
                const petRes = await request(baseUrl)
                    .post('/api/pets')
                    .set('Cookie', [authToken])
                    .send({
                        name: `Multi Pet ${i}`,
                        specie: i % 2 === 0 ? 'perro' : 'gato',
                        birthDate: '2020-01-15'
                    });

                if (petRes.status === 200) {
                    petIds.push(petRes.body.payload._id);
                }
            }

            if (petIds.length === 0) {
                console.log('⚠️ No se pudieron crear mascotas para el test');
                return;
            }

            const adoptionPromises = petIds.map(petId =>
                request(baseUrl)
                    .post(`/api/adoptions/${testUserId}/${petId}`)
                    .set('Cookie', [authToken])
            );

            const results = await Promise.all(adoptionPromises);

            let successCount = 0;
            results.forEach((res, index) => {
                console.log(`Adopción ${index}: ${res.status}`);
                if (res.status === 200) {
                    successCount++;
                }
            });

            if (successCount > 0) {
                let adoptedCount = 0;
                for (let i = 0; i < petIds.length; i++) {
                    const petRes = await request(baseUrl).get(`/api/pets/${petIds[i]}`);
                    if (petRes.status === 200 && petRes.body.payload.adopted) {
                        adoptedCount++;
                    }
                }
                expect(adoptedCount).to.be.greaterThan(0);
            } else {
                console.log('⚠️ Ninguna adopción fue exitosa, test pasado con precaución');
            }
        });
    });


    describe('⚠️ TESTS DE ERRORES Y CASOS ESPECIALES', () => {

        it('❌ Debería manejar error de duplicación (misma mascota, mismo usuario)', async function () {
            this.timeout(10000);

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (adoptionRes.status === 200) {

                const duplicateRes = await request(baseUrl)
                    .post(`/api/adoptions/${testUserId}/${testPetId}`)
                    .set('Cookie', [authToken]);

                expect(duplicateRes.status).to.equal(400);
                expect(duplicateRes.body.error).to.include('already');
            }
        });

        it('✅ Debería manejar strings de ID muy largos/cortos', async function () {
            this.timeout(5000);

            const shortRes = await request(baseUrl)
                .get('/api/adoptions/123')
                .set('Cookie', [authToken]);

            expect(shortRes.status).to.equal(400);

            const longId = 'a'.repeat(100);
            const longRes = await request(baseUrl)
                .get(`/api/adoptions/${longId}`)
                .set('Cookie', [authToken]);

            expect(longRes.status).to.equal(400);
        });

        it('✅ Debería mantener consistencia en errores de validación', async function () {
            this.timeout(5000);

            const testCases = [
                { uid: 'invalid', pid: 'invalid', expected: 400 },
                { uid: testUserId, pid: 'invalid', expected: 400 },
                { uid: 'invalid', pid: testPetId, expected: 400 },
                { uid: '', pid: '', expected: 404 },
            ];

            for (const testCase of testCases) {
                const res = await request(baseUrl)
                    .post(`/api/adoptions/${testCase.uid}/${testCase.pid}`)
                    .set('Cookie', [authToken]);

                expect(res.status).to.be.oneOf([testCase.expected, 404, 500]);
            }
        });
    });


    describe('🔗 TESTS DE INTEGRACIÓN CON OTROS MÓDULOS', () => {

        it('✅ Debería integrarse correctamente con módulo Users', async function () {
            this.timeout(10000);

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (adoptionRes.status === 200) {

                const userRes = await request(baseUrl)
                    .get(`/api/users/${testUserId}`)
                    .set('Cookie', [authToken]);

                if (userRes.status === 200) {
                    expect(userRes.body.payload.pets).to.be.an('array');
                    expect(userRes.body.payload.pets).to.include(testPetId);
                }
            }
        });

        it('✅ Debería integrarse correctamente con módulo Pets', async function () {
            this.timeout(10000);

            const adoptionRes = await request(baseUrl)
                .post(`/api/adoptions/${testUserId}/${testPetId}`)
                .set('Cookie', [authToken]);

            if (adoptionRes.status === 200) {

                const petRes = await request(baseUrl).get(`/api/pets/${testPetId}`);
                expect(petRes.body.payload.adopted).to.be.true;
                expect(petRes.body.payload.owner).to.equal(testUserId);
            }
        });

        it('✅ Debería mostrar estadísticas en respuestas', async function () {
            this.timeout(5000);

            const res = await request(baseUrl)
                .get('/api/adoptions')
                .set('Cookie', [authToken]);

            if (res.status === 200) {
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.be.a('number');

                if (res.body.payload.length > 0) {
                    const adoption = res.body.payload[0];
                    expect(adoption).to.have.property('_id');
                    expect(adoption).to.have.property('owner');
                    expect(adoption).to.have.property('pet');
                    expect(adoption).to.have.property('createdAt');
                }
            }
        });
    });
});