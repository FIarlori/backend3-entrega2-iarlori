import swaggerJSDoc from 'swagger-jsdoc';
import __dirname from '../utils/index.js';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend III API Documentation',
            version: '1.0.0',
            description: 'API para gestión de usuarios, mascotas y adopciones - Entrega Final',
            contact: {
                name: 'Franco Iarlori',
            }
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor de desarrollo'
            }
        ],
        tags: [
            {
                name: 'Users',
                description: 'Operaciones relacionadas con usuarios'
            },
            {
                name: 'Pets',
                description: 'Operaciones relacionadas con mascotas'
            },
            {
                name: 'Adoptions',
                description: 'Operaciones relacionadas con adopciones'
            },
            {
                name: 'Sessions',
                description: 'Operaciones de autenticación'
            },
            {
                name: 'Mocking',
                description: 'Generación de datos de prueba'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        first_name: {
                            type: 'string',
                            description: 'Nombre del usuario'
                        },
                        last_name: {
                            type: 'string',
                            description: 'Apellido del usuario'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario'
                        },
                        password: {
                            type: 'string',
                            description: 'Contraseña del usuario'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            default: 'user',
                            description: 'Rol del usuario'
                        },
                        pets: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'IDs de mascotas del usuario'
                        }
                    },
                    required: ['first_name', 'last_name', 'email', 'password']
                },
                Pet: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Nombre de la mascota'
                        },
                        specie: {
                            type: 'string',
                            description: 'Especie de la mascota'
                        },
                        birthDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Fecha de nacimiento'
                        },
                        adopted: {
                            type: 'boolean',
                            description: 'Si está adoptada o no'
                        },
                        image: {
                            type: 'string',
                            description: 'URL de la imagen'
                        }
                    },
                    required: ['name', 'specie', 'birthDate']
                },
                Adoption: {
                    type: 'object',
                    properties: {
                        owner: {
                            type: 'string',
                            description: 'ID del dueño'
                        },
                        pet: {
                            type: 'string',
                            description: 'ID de la mascota'
                        }
                    }
                },
                UserToken: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Juan Pérez'
                        },
                        role: {
                            type: 'string',
                            example: 'user'
                        },
                        email: {
                            type: 'string',
                            example: 'juan@example.com'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'juan@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'password123'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        error: {
                            type: 'string',
                            example: 'Mensaje de error'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        message: {
                            type: 'string',
                            example: 'Operación exitosa'
                        }
                    }
                }
            },
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'coderCookie',
                    description: 'Autenticación basada en cookies JWT firmadas'
                }
            }
        },
        security: [
            {
                cookieAuth: []
            }
        ]
    },
    apis: [`${__dirname}/../docs/swagger/*.yaml`]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);