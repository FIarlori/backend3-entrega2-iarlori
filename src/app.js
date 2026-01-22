import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';
import { swaggerSpec } from './docs/swagger.js';


const app = express();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/backend_coder';

mongoose.set('strictQuery', false);

console.log(`🌍 Entorno: ${NODE_ENV}`);
console.log(`🔗 MongoDB: ${MONGO_URL}`);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/public', express.static('src/public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Backend III API Documentation"
}));

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log(`✅ MongoDB conectado (${NODE_ENV})`);
    console.log(`📁 Base de datos: ${mongoose.connection.name}`);
})
.catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
});

if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[DEV] ${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}


app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Backend III - Entrega Final 🏆</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    overflow: hidden;
                }
                
                header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px;
                    text-align: center;
                    border-bottom: 5px solid #4c51bf;
                }
                
                h1 {
                    font-size: 2.8rem;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                }
                
                .subtitle {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    margin-bottom: 20px;
                }
                
                .status-badge {
                    display: inline-block;
                    background: #48bb78;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    margin: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                .badge-error {
                    background: #f56565;
                }
                
                .content {
                    padding: 40px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                }
                
                .section {
                    background: #f7fafc;
                    border-radius: 10px;
                    padding: 25px;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                
                h2 {
                    color: #4c51bf;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #c3dafe;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                h2 svg {
                    width: 24px;
                    height: 24px;
                }
                
                ul {
                    list-style: none;
                    margin-left: 0;
                }
                
                li {
                    margin-bottom: 12px;
                    padding-left: 25px;
                    position: relative;
                }
                
                li:before {
                    content: "→";
                    position: absolute;
                    left: 0;
                    color: #4c51bf;
                    font-weight: bold;
                }
                
                a {
                    color: #4c51bf;
                    text-decoration: none;
                    transition: color 0.3s ease;
                    font-weight: 500;
                }
                
                a:hover {
                    color: #2d3748;
                    text-decoration: underline;
                }
                
                .docker-section {
                    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
                    color: white;
                    grid-column: 1 / -1;
                }
                
                .docker-section h2 {
                    color: white;
                    border-bottom-color: rgba(255,255,255,0.3);
                }
                
                .docker-section a {
                    color: #dbeafe;
                }
                
                .docker-section a:hover {
                    color: white;
                }
                
                .docker-section li:before {
                    color: #dbeafe;
                }
                
                .endpoint {
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    border-left: 4px solid #4c51bf;
                }
                
                .method {
                    display: inline-block;
                    background: #4c51bf;
                    color: white;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    margin-right: 10px;
                }
                
                .method.get { background: #48bb78; }
                .method.post { background: #ed8936; }
                .method.put { background: #4299e1; }
                .method.delete { background: #f56565; }
                
                footer {
                    text-align: center;
                    padding: 20px;
                    background: #2d3748;
                    color: white;
                    margin-top: 30px;
                }
                
                @media (max-width: 768px) {
                    h1 {
                        font-size: 2rem;
                    }
                    
                    .content {
                        padding: 20px;
                    }
                    
                    .section {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>🚀 Backend III - Entrega Final</h1>
                    <div class="subtitle">Testing y Escalabilidad - Proyecto Dockerizado</div>
                    <div class="status-badge ${mongoose.connection.readyState === 1 ? '' : 'badge-error'}">
                        MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}
                    </div>
                    <div class="status-badge">
                        Entorno: ${NODE_ENV}
                    </div>
                </header>
                
                <div class="content">
                    <div class="section">
                        <h2>📚 Documentación API</h2>
                        <ul>
                            <li><a href="/api-docs" target="_blank">📖 Swagger UI Documentation</a> - Documentación interactiva completa</li>
                            <li><a href="/api-docs-json" target="_blank">📄 Swagger JSON</a> - Especificación OpenAPI 3.0</li>
                            <li><a href="/health" target="_blank">🩺 Health Check</a> - Estado del sistema</li>
                        </ul>
                    </div>
                    
                    <div class="section">
                        <h2>👥 Módulo Users</h2>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api/users" target="_blank">/api/users</a> - Listar usuarios
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            /api/users/:uid - Obtener usuario por ID
                        </div>
                        <div class="endpoint">
                            <span class="method put">PUT</span> 
                            /api/users/:uid - Actualizar usuario
                        </div>
                        <div class="endpoint">
                            <span class="method delete">DELETE</span> 
                            /api/users/:uid - Eliminar usuario
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🐾 Módulo Pets</h2>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api/pets" target="_blank">/api/pets</a> - Listar mascotas
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span> 
                            /api/pets - Crear mascota
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span> 
                            /api/pets/withimage - Crear mascota con imagen
                        </div>
                        <div class="endpoint">
                            <span class="method put">PUT</span> 
                            /api/pets/:pid - Actualizar mascota
                        </div>
                        <div class="endpoint">
                            <span class="method delete">DELETE</span> 
                            /api/pets/:pid - Eliminar mascota
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🏠 Módulo Adoptions</h2>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api/adoptions" target="_blank">/api/adoptions</a> - Listar adopciones
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            /api/adoptions/:aid - Obtener adopción por ID
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span> 
                            /api/adoptions/:uid/:pid - Crear adopción
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🔐 Módulo Sessions</h2>
                        <div class="endpoint">
                            <span class="method post">POST</span> 
                            /api/sessions/register - Registrar usuario
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span> 
                            /api/sessions/login - Iniciar sesión
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            /api/sessions/current - Usuario actual
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            /api/sessions/logout - Cerrar sesión
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🧪 Módulo Mocking</h2>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api/mocks/mockingpets" target="_blank">/api/mocks/mockingpets</a> - Generar mascotas mock
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api/mocks/mockingusers" target="_blank">/api/mocks/mockingusers</a> - Generar usuarios mock
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span> 
                            /api/mocks/generateData - Insertar datos en DB
                        </div>
                    </div>
                    
                    <div class="section docker-section">
                        <h2>🐳 Docker</h2>
                        <ul>
                            <li><strong>Imagen DockerHub:</strong> 
                                <a href="https://hub.docker.com/r/fi93/backend3-entrega-final" target="_blank">
                                    fi93/backend3-entrega-final
                                </a>
                            </li>
                            <li><strong>Comandos Docker:</strong></li>
                            <li>🔧 Construir: <code>npm run docker:build</code></li>
                            <li>🚀 Ejecutar: <code>npm run docker:run</code></li>
                            <li>📤 Publicar: <code>npm run docker:push</code></li>
                            <li>🐳 Compose: <code>npm run docker:compose</code></li>
                        </ul>
                    </div>
                    
                    <div class="section">
                        <h2>🧪 Testing</h2>
                        <ul>
                            <li><strong>Tests Adoptions:</strong> <code>npm run test:adoptions</code></li>
                            <li><strong>Tests Simples:</strong> <code>npm run test:simple</code></li>
                            <li><strong>Todos los Tests:</strong> <code>npm run test:all</code></li>
                            <li><strong>Watch Mode:</strong> <code>npm run test:watch</code></li>
                            <li><strong>Linting:</strong> <code>npm run lint</code></li>
                        </ul>
                    </div>
                </div>
                
                <footer>
                    <p>Backend III - Testing y Escalabilidad | Entrega Final | Franco Iarlori</p>
                    <p>🚀 Proyecto Dockerizado con Swagger Documentation</p>
                </footer>
            </div>
        </body>
        </html>
    `);
});

app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMessages = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const healthStatus = {
        status: dbStatus === 1 ? 'OK' : 'WARNING',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
        database: {
            status: statusMessages[dbStatus] || 'unknown',
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            readyState: dbStatus
        },
        endpoints: {
            documentation: '/api-docs',
            api: '/api',
            health: '/health'
        }
    };
    
    res.status(dbStatus === 1 ? 200 : 503).json(healthStatus);
});

app.use((err, req, res, next) => {
    console.error(`[${NODE_ENV}] Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    const response = {
        status: 'error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
    };
    
    if (NODE_ENV === 'development') {
        response.error = err.message;
        response.stack = err.stack;
        response.path = req.path;
        response.method = req.method;
    }
    
    let statusCode = 500;
    if (err.name === 'ValidationError') statusCode = 400;
    if (err.name === 'UnauthorizedError') statusCode = 401;
    if (err.name === 'ForbiddenError') statusCode = 403;
    if (err.name === 'NotFoundError') statusCode = 404;
    
    res.status(statusCode).json(response);
});

app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        requestedPath: req.originalUrl,
        availableRoutes: {
            documentation: '/api-docs',
            api: {
                users: '/api/users',
                pets: '/api/pets',
                adoptions: '/api/adoptions',
                sessions: '/api/sessions',
                mocks: '/api/mocks'
            },
            health: '/health'
        }
    });
});

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Entorno: ${NODE_ENV}`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
    console.log(`🐳 Docker Image: fi93/backend3-entrega-final`);
    console.log(`   Tests Adoptions: npm run test:adoptions`);
    console.log(`   Docker Build: npm run docker:build`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

export default app;