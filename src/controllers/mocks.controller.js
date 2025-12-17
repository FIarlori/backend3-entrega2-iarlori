import Mocking from '../utils/mocking.js';
import { usersService, petsService } from '../services/index.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

const mockingController = {
    generateMockPets: async (req, res) => {
        try {
            const count = parseInt(req.query.count) || 100;
            
            if (count > 1000) {
                return res.status(400).send({
                    status: 'error',
                    error: 'Cannot generate more than 1000 pets'
                });
            }
            
            const mockPets = Mocking.generatePets(count);
            res.send({
                status: 'success',
                payload: mockPets,
                count: mockPets.length,
                environment: NODE_ENV
            });
        } catch (error) {
            res.status(500).send({
                status: 'error',
                error: error.message,
                environment: NODE_ENV
            });
        }
    },

    generateMockUsers: async (req, res) => {
        try {
            const count = parseInt(req.query.count) || 50;
            
            if (count > 500) {
                return res.status(400).send({
                    status: 'error',
                    error: 'Cannot generate more than 500 users'
                });
            }
            
            const mockUsers = await Mocking.generateUsers(count);
            res.send({
                status: 'success',
                payload: mockUsers,
                count: mockUsers.length,
                environment: NODE_ENV,
                note: 'All users have encrypted password "coder123"'
            });
        } catch (error) {
            res.status(500).send({
                status: 'error',
                error: error.message,
                environment: NODE_ENV
            });
        }
    },

    generateAndInsertData: async (req, res) => {
        try {
            const { users: usersCount = 0, pets: petsCount = 0 } = req.body;
            
            if (usersCount === 0 && petsCount === 0) {
                return res.status(400).send({
                    status: 'error',
                    error: 'Must specify at least one value (users or pets)',
                    environment: NODE_ENV
                });
            }

            const results = {
                users: { inserted: 0, errors: [] },
                pets: { inserted: 0, errors: [] }
            };

            if (usersCount > 0) {
                if (usersCount > 100) {
                    return res.status(400).send({
                        status: 'error',
                        error: 'Cannot insert more than 100 users at once'
                    });
                }
                
                const mockUsers = await Mocking.generateUsers(usersCount);
                for (const user of mockUsers) {
                    try {
                        const userToInsert = { ...user };
                        delete userToInsert._id;
                        delete userToInsert.createdAt;
                        delete userToInsert.updatedAt;
                        
                        await usersService.create(userToInsert);
                        results.users.inserted++;
                    } catch (error) {
                        results.users.errors.push(error.message);
                    }
                }
            }

            if (petsCount > 0) {
                if (petsCount > 100) {
                    return res.status(400).send({
                        status: 'error',
                        error: 'Cannot insert more than 100 pets at once'
                    });
                }
                
                const mockPets = Mocking.generatePets(petsCount);
                for (const pet of mockPets) {
                    try {
                        const petToInsert = { ...pet };
                        delete petToInsert._id;
                        delete petToInsert.createdAt;
                        delete petToInsert.updatedAt;
                        
                        await petsService.create(petToInsert);
                        results.pets.inserted++;
                    } catch (error) {
                        results.pets.errors.push(error.message);
                    }
                }
            }

            res.send({
                status: 'success',
                message: 'Data generated and inserted successfully',
                environment: NODE_ENV,
                results,
                verify: {
                    users: `GET /api/users`,
                    pets: `GET /api/pets`
                }
            });

        } catch (error) {
            res.status(500).send({
                status: 'error',
                error: error.message,
                environment: NODE_ENV
            });
        }
    }
};

export default mockingController;