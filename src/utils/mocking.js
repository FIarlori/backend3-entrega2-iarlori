import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

class Mocking {
    static async generateUsers(count = 50) {
        try {
            const users = [];
            const encryptedPassword = await bcrypt.hash('coder123', 10);

            for (let i = 0; i < count; i++) {
                const user = {
                    _id: faker.database.mongodbObjectId(),
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: encryptedPassword,
                    role: Math.random() > 0.5 ? 'user' : 'admin',
                    pets: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                users.push(user);
            }
            
            return users;
        } catch (error) {
            throw new Error('Error generating users: ' + error.message);
        }
    }

    static generatePets(count = 50) {
        const pets = [];
        const species = ['perro', 'gato', 'conejo', 'hamster', 'pájaro', 'pez', 'tortuga'];
        
        for (let i = 0; i < count; i++) {
            const pet = {
                _id: faker.database.mongodbObjectId(),
                name: faker.person.firstName(),
                specie: species[Math.floor(Math.random() * species.length)],
                birthDate: faker.date.past({ years: 10 }),
                adopted: false,
                owner: null,
                image: faker.image.urlLoremFlickr({ category: 'animals' }),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            pets.push(pet);
        }
        
        return pets;
    }
}

export default Mocking;