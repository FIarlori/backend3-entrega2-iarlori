import { petsService, usersService } from '../services/index.js';
import logger from '../utils/logger.js';
import Mocking from '../utils/mocking.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

const mockingController = {
    generateMockPets: async (req, res) => {
        try {
            const count = parseInt(req.query.count) || 100;
            logger.info(`Generating ${count} mock pets`);

            if (count > 1000) {
                logger.warn(`Attempt to generate ${count} pets exceeds limit of 1000`);
                return res.status(400).send({
                    status: 'error',
                    error: 'Cannot generate more than 1000 pets',
                    max_allowed: 1000,
                    requested: count
                });
            }

            const mockPets = Mocking.generatePets(count);
            logger.debug(`Generated ${mockPets.length} mock pets successfully`);

            res.send({
                status: 'success',
                payload: mockPets,
                count: mockPets.length,
                environment: NODE_ENV,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            logger.error(`Error generating mock pets: ${error.message}`, {
                count: req.query.count,
                stack: error.stack,
                environment: NODE_ENV
            });

            res.status(500).send({
                status: 'error',
                error: error.message,
                environment: NODE_ENV,
                timestamp: new Date().toISOString()
            });
        }
    },

    generateMockUsers: async (req, res) => {
        try {
            const count = parseInt(req.query.count) || 50;
            logger.info(`Generating ${count} mock users`);

            if (count > 500) {
                logger.warn(`Attempt to generate ${count} users exceeds limit of 500`);
                return res.status(400).send({
                    status: 'error',
                    error: 'Cannot generate more than 500 users',
                    max_allowed: 500,
                    requested: count
                });
            }

            const mockUsers = await Mocking.generateUsers(count);
            logger.debug(`Generated ${mockUsers.length} mock users successfully`);

            const roleStats = mockUsers.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {});
            logger.debug(`User role distribution: ${JSON.stringify(roleStats)}`);

            res.send({
                status: 'success',
                payload: mockUsers,
                count: mockUsers.length,
                environment: NODE_ENV,
                note: 'All users have encrypted password "coder123"',
                role_distribution: roleStats,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            logger.error(`Error generating mock users: ${error.message}`, {
                count: req.query.count,
                stack: error.stack,
                environment: NODE_ENV
            });

            res.status(500).send({
                status: 'error',
                error: error.message,
                environment: NODE_ENV,
                timestamp: new Date().toISOString()
            });
        }
    },

    generateAndInsertData: async (req, res) => {
        try {
            const { users: usersCount = 0, pets: petsCount = 0 } = req.body;

            logger.info(`Generating and inserting data: users=${usersCount}, pets=${petsCount}`);

            if (usersCount === 0 && petsCount === 0) {
                logger.warn('Attempt to generate data without specifying users or pets');
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

            let mockUsers = [];
            let mockPets = [];

            if (usersCount > 0) {
                if (usersCount > 100) {
                    return res.status(400).send({
                        status: 'error',
                        error: 'Cannot insert more than 100 users at once'
                    });
                }

                mockUsers = await Mocking.generateUsers(usersCount);
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

                mockPets = Mocking.generatePets(petsCount);
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

            const response = {
                status: 'success',
                message: 'Data generated and inserted successfully',
                environment: NODE_ENV,
                results,
                verify: {
                    users: `GET /api/users`,
                    pets: `GET /api/pets`
                }
            };

            if (mockPets.length > 0) {
                if (!response.statistics) response.statistics = {};
                response.statistics.species_distribution = mockPets.reduce((acc, pet) => {
                    acc[pet.specie] = (acc[pet.specie] || 0) + 1;
                    return acc;
                }, {});
            }

            if (mockUsers.length > 0) {
                if (!response.statistics) response.statistics = {};
                response.statistics.role_distribution = mockUsers.reduce((acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                }, {});
            }

            res.send(response);

        } catch (error) {
            logger.error(`Error in generateAndInsertData: ${error.message}`);
            res.status(500).send({
                status: 'error',
                error: error.message,
                environment: NODE_ENV
            });
        }
    }
};

export default mockingController;