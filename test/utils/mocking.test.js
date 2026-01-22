import bcrypt from 'bcrypt';
import { expect } from 'chai';
import Mocking from '../../src/utils/mocking.js';

describe('🔧 TESTS COMPLETOS - UTILS MOCKING', () => {
    describe('generateUsers()', () => {
        it('✅ Debería generar número específico de usuarios', async () => {
            const users = await Mocking.generateUsers(5);

            expect(users).to.be.an('array').with.lengthOf(5);
        });

        it('✅ Debería generar usuarios con estructura correcta', async () => {
            const users = await Mocking.generateUsers(3);

            users.forEach(user => {
                expect(user).to.include.keys([
                    '_id', 'first_name', 'last_name', 'email',
                    'password', 'role', 'pets', 'createdAt', 'updatedAt'
                ]);

                expect(user.first_name).to.be.a('string').that.is.not.empty;
                expect(user.last_name).to.be.a('string').that.is.not.empty;
                expect(user.email).to.be.a('string').that.includes('@');
                expect(user.password).to.be.a('string').that.is.not.empty;
                expect(user.role).to.be.oneOf(['user', 'admin']);
                expect(user.pets).to.be.an('array').that.is.empty;
                expect(user.createdAt).to.be.instanceOf(Date);
                expect(user.updatedAt).to.be.instanceOf(Date);
            });
        });

        it('✅ Todos los usuarios deben tener password "coder123" encriptado', async () => {
            const users = await Mocking.generateUsers(3);
            const testPassword = 'coder123';

            for (const user of users) {
                expect(user.password).to.match(/^\$2[aby]\$\d+\$.+/);

                const isMatch = await bcrypt.compare(testPassword, user.password);
                expect(isMatch).to.be.true;
            }
        });

        it('✅ Debería generar IDs en formato MongoDB ObjectId', async () => {
            const users = await Mocking.generateUsers(2);

            users.forEach(user => {
                expect(user._id).to.match(/^[0-9a-fA-F]{24}$/);
            });
        });

        it('✅ Debería tener distribución aleatoria de roles', async () => {
            const users = await Mocking.generateUsers(100);
            const roles = users.map(user => user.role);
            const userCount = roles.filter(role => role === 'user').length;
            const adminCount = roles.filter(role => role === 'admin').length;

            expect(userCount).to.be.greaterThan(0);
            expect(adminCount).to.be.greaterThan(0);
        });

        it('✅ Los emails deben ser únicos', async () => {
            const users = await Mocking.generateUsers(10);
            const emails = users.map(user => user.email);
            const uniqueEmails = [...new Set(emails)];

            expect(uniqueEmails.length).to.equal(users.length);
        });

        it('✅ Debería manejar caso de 0 usuarios', async () => {
            const users = await Mocking.generateUsers(0);

            expect(users).to.be.an('array').that.is.empty;
        });

        it('❌ Debería lanzar error para número negativo', async () => {
            try {
                await Mocking.generateUsers(-1);
                expect.fail('Debería haber lanzado error para número negativo');
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.include('Error generating users');
            }
        });
    });

    describe('generatePets()', () => {
        it('✅ Debería generar número específico de mascotas', () => {
            const pets = Mocking.generatePets(7);

            expect(pets).to.be.an('array').with.lengthOf(7);
        });

        it('✅ Debería generar mascotas con estructura correcta', () => {
            const pets = Mocking.generatePets(4);
            const validSpecies = ['perro', 'gato', 'conejo', 'hamster', 'pájaro', 'pez', 'tortuga'];

            pets.forEach(pet => {
                expect(pet).to.include.keys([
                    '_id', 'name', 'specie', 'birthDate',
                    'adopted', 'owner', 'image', 'createdAt', 'updatedAt'
                ]);

                expect(pet.name).to.be.a('string').that.is.not.empty;
                expect(pet.specie).to.be.oneOf(validSpecies);
                expect(pet.birthDate).to.be.instanceOf(Date);
                expect(pet.adopted).to.be.false;
                expect(pet.owner).to.be.null;
                expect(pet.image).to.be.a('string').that.includes('http');
                expect(pet.createdAt).to.be.instanceOf(Date);
                expect(pet.updatedAt).to.be.instanceOf(Date);
            });
        });

        it('✅ Debería generar IDs en formato MongoDB ObjectId', () => {
            const pets = Mocking.generatePets(2);

            pets.forEach(pet => {
                expect(pet._id).to.match(/^[0-9a-fA-F]{24}$/);
            });
        });

        it('✅ Debería tener fechas de nacimiento en el pasado', () => {
            const pets = Mocking.generatePets(5);
            const now = new Date();

            pets.forEach(pet => {
                expect(pet.birthDate.getTime()).to.be.lessThan(now.getTime());
            });
        });

        it('✅ Debería tener distribución de especies', () => {
            const pets = Mocking.generatePets(50);
            const species = pets.map(pet => pet.specie);
            const uniqueSpecies = [...new Set(species)];

            expect(uniqueSpecies.length).to.be.greaterThan(1);
        });

        it('✅ Todas las mascotas deben estar no adoptadas por defecto', () => {
            const pets = Mocking.generatePets(10);
            const allNotAdopted = pets.every(pet => pet.adopted === false);

            expect(allNotAdopted).to.be.true;
        });

        it('✅ Todas las mascotas deben no tener dueño por defecto', () => {
            const pets = Mocking.generatePets(10);
            const allNoOwner = pets.every(pet => pet.owner === null);

            expect(allNoOwner).to.be.true;
        });

        it('✅ Debería manejar caso de 0 mascotas', () => {
            const pets = Mocking.generatePets(0);

            expect(pets).to.be.an('array').that.is.empty;
        });

        it('✅ Las imágenes deben ser URLs válidas', () => {
            const pets = Mocking.generatePets(3);

            pets.forEach(pet => {
                expect(pet.image).to.match(/^https?:\/\/.+/);
            });
        });

        it('✅ Debería generar nombres de mascotas realistas', () => {
            const pets = Mocking.generatePets(20);

            pets.forEach(pet => {
                expect(pet.name).to.match(/^[A-Z][a-z]+$/);
            });
        });
    });

    describe('Consistencia entre generateUsers y generatePets', () => {
        it('✅ Los usuarios y mascotas deben tener mismos campos de timestamp', async () => {
            const users = await Mocking.generateUsers(1);
            const pets = Mocking.generatePets(1);

            expect(users[0]).to.have.property('createdAt');
            expect(users[0]).to.have.property('updatedAt');
            expect(pets[0]).to.have.property('createdAt');
            expect(pets[0]).to.have.property('updatedAt');

            const recentTime = Date.now() - 1000;
            expect(users[0].createdAt.getTime()).to.be.greaterThan(recentTime);
            expect(pets[0].createdAt.getTime()).to.be.greaterThan(recentTime);
        });

        it('✅ Ambos deben usar mismo formato de ID', async () => {
            const users = await Mocking.generateUsers(1);
            const pets = Mocking.generatePets(1);

            const userId = users[0]._id;
            const petId = pets[0]._id;

            expect(userId).to.match(/^[0-9a-fA-F]{24}$/);
            expect(petId).to.match(/^[0-9a-fA-F]{24}$/);
        });
    });

    describe('Rendimiento y límites', () => {
        it('✅ Debería generar 100 usuarios rápidamente', async function () {
            this.timeout(5000);

            const startTime = Date.now();
            const users = await Mocking.generateUsers(100);
            const endTime = Date.now();

            expect(users).to.have.lengthOf(100);
            expect(endTime - startTime).to.be.lessThan(2000);
        });

        it('✅ Debería generar 1000 mascotas rápidamente', function () {
            this.timeout(5000);

            const startTime = Date.now();
            const pets = Mocking.generatePets(1000);
            const endTime = Date.now();

            expect(pets).to.have.lengthOf(1000);
            expect(endTime - startTime).to.be.lessThan(2000);
        });

        it('✅ No debería consumir memoria excesiva', async function () {
            this.timeout(10000);

            const initialMemory = process.memoryUsage().heapUsed;
            const users = await Mocking.generateUsers(500);
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024);
        });
    });

    describe('Integración con otros módulos', () => {
        it('✅ Los usuarios generados deben ser compatibles con el modelo User', async () => {
            const users = await Mocking.generateUsers(1);
            const user = users[0];

            expect(user.first_name).to.exist;
            expect(user.last_name).to.exist;
            expect(user.email).to.exist;
            expect(user.password).to.exist;
            expect(user.role).to.exist;
            expect(user.pets).to.exist;
        });

        it('✅ Las mascotas generadas deben ser compatibles con el modelo Pet', () => {
            const pets = Mocking.generatePets(1);
            const pet = pets[0];

            expect(pet).to.have.property('name');
            expect(pet).to.have.property('specie');
            expect(pet).to.have.property('birthDate');
            expect(pet).to.have.property('adopted');
            expect(pet).to.have.property('owner');

            expect(pet.adopted).to.be.a('boolean');
            expect(pet.owner === null || pet.owner === undefined).to.be.true;
        });

        it('✅ Los datos deben poder ser insertados directamente en MongoDB', async () => {
            const users = await Mocking.generateUsers(1);
            const pets = Mocking.generatePets(1);

            const user = users[0];
            const pet = pets[0];

            const userForInsert = { ...user };
            const petForInsert = { ...pet };

            delete userForInsert._id;
            delete userForInsert.createdAt;
            delete userForInsert.updatedAt;

            delete petForInsert._id;
            delete petForInsert.createdAt;
            delete petForInsert.updatedAt;

            expect(userForInsert).to.include.keys(['first_name', 'last_name', 'email', 'password', 'role']);
            expect(petForInsert).to.include.keys(['name', 'specie', 'birthDate', 'adopted', 'owner']);
        });
    });
});