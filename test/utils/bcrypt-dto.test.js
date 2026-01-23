import bcrypt from 'bcrypt';
import { expect } from 'chai';
import UserDTO from '../../src/dto/User.dto.js';

describe('🔧 TESTS COMPLETOS - BCRYPT Y DTO', () => {
    describe('BCRYPT - Validación de contraseñas', () => {
        it('✅ El servicio debe realizar un hasheo efectivo de la contraseña', async () => {
            const originalPassword = 'coder123';
            const hashedPassword = await bcrypt.hash(originalPassword, 10);

            expect(hashedPassword).to.not.equal(originalPassword);
            expect(hashedPassword).to.match(/^\$2[aby]\$\d+\$.+/);
            expect(hashedPassword.length).to.be.greaterThan(50);
        });

        it('✅ El hasheo realizado debe poder compararse de manera efectiva con la contraseña original', async () => {
            const originalPassword = 'coder123';
            const hashedPassword = await bcrypt.hash(originalPassword, 10);

            const isValid = await bcrypt.compare(originalPassword, hashedPassword);
            expect(isValid).to.be.true;
        });

        it('❌ Si la contraseña hasheada se altera, debe fallar en la comparación', async () => {
            const originalPassword = 'coder123';
            const wrongPassword = 'wrongpassword';
            const hashedPassword = await bcrypt.hash(originalPassword, 10);

            const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
            expect(isValid).to.be.false;

            const alteredHash = hashedPassword.slice(0, -1) + 'X';
            const isValidAltered = await bcrypt.compare(originalPassword, alteredHash);
            expect(isValidAltered).to.be.false;
        });

        it('✅ Debería manejar diferentes costos de hashing', async () => {
            const password = 'testPassword123';

            const hash10 = await bcrypt.hash(password, 10);
            const hash12 = await bcrypt.hash(password, 12);

            expect(hash10).to.not.equal(hash12);

            const isValid10 = await bcrypt.compare(password, hash10);
            const isValid12 = await bcrypt.compare(password, hash12);

            expect(isValid10).to.be.true;
            expect(isValid12).to.be.true;
        });
    });

    describe('USER DTO - Transformación de datos', () => {
        it('✅ El DTO debe unificar el nombre y apellido en una única propiedad', () => {
            const mockUser = {
                first_name: 'Juan',
                last_name: 'Pérez',
                role: 'user',
                email: 'juan@example.com',
                password: 'hashedPassword123',
                pets: ['pet1', 'pet2']
            };

            const userDto = UserDTO.getUserTokenFrom(mockUser);

            expect(userDto).to.have.property('name', 'Juan Pérez');
            expect(userDto).to.have.property('role', 'user');
            expect(userDto).to.have.property('email', 'juan@example.com');

            expect(userDto).to.not.have.property('first_name');
            expect(userDto).to.not.have.property('last_name');
            expect(userDto).to.not.have.property('password');
            expect(userDto).to.not.have.property('pets');
        });

        it('✅ Debe manejar diferentes combinaciones de nombres', () => {
            const testCases = [
                { first_name: 'Ana', last_name: 'García', expected: 'Ana García' },
                { first_name: 'María', last_name: 'De los Santos', expected: 'María De los Santos' },
                { first_name: 'J', last_name: 'Smith', expected: 'J Smith' },
                { first_name: '', last_name: 'Doe', expected: ' Doe' },
                { first_name: 'John', last_name: '', expected: 'John ' }
            ];

            testCases.forEach(testCase => {
                const mockUser = {
                    ...testCase,
                    role: 'user',
                    email: 'test@example.com'
                };

                const userDto = UserDTO.getUserTokenFrom(mockUser);
                expect(userDto.name).to.equal(testCase.expected);
            });
        });

        it('✅ El DTO debe eliminar propiedades innecesarias', () => {
            const mockUser = {
                first_name: 'Carlos',
                last_name: 'López',
                role: 'admin',
                email: 'carlos@example.com',
                password: 'secret123',
                age: 30,
                address: 'Calle 123',
                phone: '1234567890',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const userDto = UserDTO.getUserTokenFrom(mockUser);

            expect(userDto).to.have.keys(['name', 'role', 'email']);

            expect(userDto).to.not.have.property('password');
            expect(userDto).to.not.have.property('first_name');
            expect(userDto).to.not.have.property('last_name');
            expect(userDto).to.not.have.property('age');
            expect(userDto).to.not.have.property('address');
            expect(userDto).to.not.have.property('phone');
            expect(userDto).to.not.have.property('createdAt');
            expect(userDto).to.not.have.property('updatedAt');
        });

        it('✅ Debe mantener todas las propiedades requeridas en el objeto resultante', () => {
            const mockUser = {
                first_name: 'Laura',
                last_name: 'Martínez',
                role: 'user',
                email: 'laura@example.com'
            };

            const userDto = UserDTO.getUserTokenFrom(mockUser);

            expect(userDto).to.be.an('object');
            expect(userDto.name).to.be.a('string');
            expect(userDto.role).to.be.a('string');
            expect(userDto.email).to.be.a('string');

            expect(userDto.name).to.equal('Laura Martínez');
            expect(userDto.role).to.equal('user');
            expect(userDto.email).to.equal('laura@example.com');
        });
    });

    describe('Integración Bcrypt + DTO', () => {
        it('✅ Flujo completo: usuario con contraseña hasheada → DTO limpio', async () => {
            const originalPassword = 'mySecurePassword123';
            const hashedPassword = await bcrypt.hash(originalPassword, 10);

            const mockUser = {
                first_name: 'Test',
                last_name: 'Integration',
                email: 'test@integration.com',
                password: hashedPassword,
                role: 'user',
                _id: '507f1f77bcf86cd799439011',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const userDto = UserDTO.getUserTokenFrom(mockUser);

            expect(userDto).to.have.property('name', 'Test Integration');
            expect(userDto).to.have.property('email', 'test@integration.com');
            expect(userDto).to.have.property('role', 'user');

            expect(userDto).to.not.have.property('password');
            expect(userDto).to.not.have.property('_id');
            expect(userDto).to.not.have.property('createdAt');

            const isPasswordValid = await bcrypt.compare(originalPassword, mockUser.password);
            expect(isPasswordValid).to.be.true;
        });
    });
});