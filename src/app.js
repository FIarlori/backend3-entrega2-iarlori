import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import logger from './utils/logger.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerSpec } from './docs/swagger.js';
import adoptionsRouter from './routes/adoption.router.js';
import mocksRouter from './routes/mocks.router.js';
import petsRouter from './routes/pets.router.js';
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/backend_coder';

mongoose.set('strictQuery', false);

logger.info(`🌍 Iniciando aplicación en entorno: ${NODE_ENV}`);
logger.info(`🔗 MongoDB: ${MONGO_URL}`);
logger.info(`🚀 Puerto: ${PORT}`);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(loggerMiddleware);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/documents', express.static(path.join(__dirname, 'public/documents')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Backend III API Documentation",
  swaggerOptions: {
    persistAuthorization: true, 
    authAction: {
      cookieAuth: {
        name: "cookieAuth",
        schema: {
          type: "apiKey",
          in: "cookie",
          name: "coderCookie"
        },
        value: "Pega aquí el valor de la cookie después de hacer login"
      }
    }
  }
}));

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        logger.info(`✅ MongoDB conectado (${NODE_ENV})`);
        logger.info(`📁 Base de datos: ${mongoose.connection.name}`);
    })
    .catch((error) => {
        logger.error(`❌ Error conectando a MongoDB: ${error.message}`);
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
                    max-width: 1400px;
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
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 25px;
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
                    margin-bottom: 10px;
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
                    padding: 12px 15px;
                    margin-bottom: 8px;
                    border-left: 4px solid #4c51bf;
                    font-size: 0.9rem;
                }
                
                .method {
                    display: inline-block;
                    background: #4c51bf;
                    color: white;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    margin-right: 10px;
                    min-width: 50px;
                    text-align: center;
                }
                
                .method.get { background: #48bb78; }
                .method.post { background: #ed8936; }
                .method.put { background: #4299e1; }
                .method.delete { background: #f56565; }
                .method.auth { background: #805ad5; }
                .method.noauth { background: #718096; }
                
                .auth-badge {
                    display: inline-block;
                    background: #805ad5;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    margin-left: 10px;
                    vertical-align: middle;
                }
                
                .noauth-badge {
                    display: inline-block;
                    background: #718096;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    margin-left: 10px;
                    vertical-align: middle;
                }
                
                .description {
                    display: block;
                    color: #718096;
                    font-size: 0.85rem;
                    margin-top: 5px;
                    margin-left: 60px;
                }
                
                .endpoint-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 5px;
                }
                
                .endpoint-method {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                footer {
                    text-align: center;
                    padding: 25px;
                    background: #2d3748;
                    color: white;
                    margin-top: 30px;
                }
                
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                
                .stat {
                    background: rgba(255,255,255,0.1);
                    padding: 10px 20px;
                    border-radius: 10px;
                    min-width: 120px;
                }
                
                .stat-number {
                    font-size: 1.8rem;
                    font-weight: bold;
                    display: block;
                }
                
                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                @media (max-width: 768px) {
                    h1 {
                        font-size: 2rem;
                    }
                    
                    .content {
                        padding: 20px;
                        grid-template-columns: 1fr;
                    }
                    
                    .section {
                        padding: 20px;
                    }
                    
                    .endpoint {
                        padding: 10px;
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
                        <h2>📚 Documentación & Sistema</h2>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api-docs" target="_blank">/api-docs</a>
                            <span class="description">Swagger UI Documentation - Documentación interactiva completa</span>
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/api-docs-json" target="_blank">/api-docs-json</a>
                            <span class="description">Especificación OpenAPI 3.0 en formato JSON</span>
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/health" target="_blank">/health</a>
                            <span class="description">Health Check - Estado del sistema y base de datos</span>
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span> 
                            <a href="/public" target="_blank">/public</a>
                            <span class="description">Archivos estáticos (imágenes, documentos)</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>👥 Módulo Users (5 endpoints)</h2>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    <a href="/api/users" target="_blank">/api/users</a>
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Listar todos los usuarios registrados</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    /api/users/:uid
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Obtener usuario específico por ID</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method put">PUT</span>
                                    /api/users/:uid
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Actualizar información de usuario</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method delete">DELETE</span>
                                    /api/users/:uid
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Eliminar usuario del sistema</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/users/:uid/documents
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Subir documentos del usuario (máx 10 archivos)</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🐾 Módulo Pets (6 endpoints)</h2>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    <a href="/api/pets" target="_blank">/api/pets</a>
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Listar todas las mascotas registradas</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/pets
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Crear nueva mascota</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    /api/pets/:pid
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Obtener mascota por ID</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method put">PUT</span>
                                    /api/pets/:pid
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Actualizar información de mascota</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method delete">DELETE</span>
                                    /api/pets/:pid
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Eliminar mascota del sistema</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/pets/withimage
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Crear mascota con imagen (multipart/form-data)</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🏠 Módulo Adoptions (3 endpoints)</h2>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    <a href="/api/adoptions" target="_blank">/api/adoptions</a>
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Listar todas las adopciones</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    /api/adoptions/:aid
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Obtener adopción específica por ID</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/adoptions/:uid/:pid
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Crear nueva adopción (usuario adopta mascota)</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🔐 Módulo Sessions (6 endpoints)</h2>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/sessions/register
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Registrar nuevo usuario en el sistema</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/sessions/login
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Iniciar sesión (cookie JWT firmada)</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    /api/sessions/current
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Obtener información del usuario actual</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    /api/sessions/logout
                                </div>
                                <span class="auth-badge">Auth</span>
                            </div>
                            <span class="description">Cerrar sesión (limpia cookie)</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/sessions/unprotectedLogin
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Login sin protección (para testing)</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    /api/sessions/unprotectedCurrent
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Usuario actual sin protección (para testing)</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🧪 Módulo Mocking (3 endpoints)</h2>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    <a href="/api/mocks/mockingusers" target="_blank">/api/mocks/mockingusers</a>
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Generar usuarios mock (por defecto 50)</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method get">GET</span>
                                    <a href="/api/mocks/mockingpets" target="_blank">/api/mocks/mockingpets</a>
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Generar mascotas mock (por defecto 100)</span>
                        </div>
                        <div class="endpoint">
                            <div class="endpoint-header">
                                <div class="endpoint-method">
                                    <span class="method post">POST</span>
                                    /api/mocks/generateData
                                </div>
                                <span class="noauth-badge">No Auth</span>
                            </div>
                            <span class="description">Generar e insertar datos mock en MongoDB</span>
                        </div>
                    </div>
                    
                    <div class="section docker-section">
                        <h2>🐳 Docker & Deployment</h2>
                        <ul>
                            <li><strong>📦 Imagen DockerHub:</strong> 
                                <a href="https://hub.docker.com/r/fi93/backend3-entrega-final" target="_blank">
                                    fi93/backend3-entrega-final
                                </a>
                            </li>
                            <li><strong>🚀 Comandos Docker:</strong></li>
                            <li>🔧 Construir imagen: <code>npm run docker:build</code></li>
                            <li>▶️ Ejecutar contenedor: <code>npm run docker:run</code></li>
                            <li>📤 Publicar a DockerHub: <code>npm run docker:push</code></li>
                            <li>🐳 Compose completo: <code>npm run docker:compose</code></li>
                            <li>🔨 Compose con rebuild: <code>npm run docker:compose:build</code></li>
                            <li>🧹 Limpiar contenedores: <code>npm run docker:compose:clean</code></li>
                        </ul>
                    </div>
                    
                    <div class="section">
                        <h2>🧪 Testing & Quality</h2>
                        <ul>
                            <li><strong>📊 Tests por módulo:</strong></li>
                            <li>🏠 Adoptions: <code>npm run test:adoptions</code></li>
                            <li>🐾 Pets: <code>npm run test:pets</code></li>
                            <li>🔐 Sessions: <code>npm run test:sessions</code></li>
                            <li>👥 Users: <code>npm run test:users</code></li>
                            <li>🧪 Mocking: <code>npm run test:mocks</code></li>
                            <li>🔧 Utils: <code>npm run test:utils</code></li>
                            <li>🔑 Bcrypt/DTO: <code>npm run test:bcrypt-dto</code></li>
                            <li>✅ Todos los tests: <code>npm run test:all</code></li>
                            <li>📈 Ver logs: <code>npm run logs</code></li>
                        </ul>
                    </div>
                </div>
                
                <footer>
                    <p>Backend III - Testing y Escalabilidad | Entrega Final | Franco Iarlori</p>
                    <p>🚀 Proyecto Dockerizado con Swagger Documentation y Testing Completo</p>
                    
                    <div class="stats">
                    </div>
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
        },
        modules: {
            users: '/api/users',
            pets: '/api/pets',
            adoptions: '/api/adoptions',
            sessions: '/api/sessions',
            mocking: '/api/mocks'
        },
        stats: {
            total_endpoints: 22,
            endpoints_by_module: {
                users: 5,
                pets: 6,
                adoptions: 3,
                sessions: 6,
                mocking: 3
            }
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
            documentation: {
                swagger_ui: '/api-docs',
                swagger_json: '/api-docs-json',
                health: '/health'
            },
            api_modules: {
                users: {
                    getAll: 'GET /api/users (No Auth)',
                    getById: 'GET /api/users/:uid (No Auth)',
                    update: 'PUT /api/users/:uid (No Auth)',
                    delete: 'DELETE /api/users/:uid (No Auth)',
                    uploadDocuments: 'POST /api/users/:uid/documents (Auth Required)'
                },
                pets: {
                    getAll: 'GET /api/pets (No Auth)',
                    create: 'POST /api/pets (Auth Required)',
                    getById: 'GET /api/pets/:pid (No Auth)',
                    update: 'PUT /api/pets/:pid (Auth Required)',
                    delete: 'DELETE /api/pets/:pid (Auth Required)',
                    createWithImage: 'POST /api/pets/withimage (Auth Required)'
                },
                adoptions: {
                    getAll: 'GET /api/adoptions (Auth Required)',
                    getById: 'GET /api/adoptions/:aid (Auth Required)',
                    create: 'POST /api/adoptions/:uid/:pid (Auth Required)'
                },
                sessions: {
                    register: 'POST /api/sessions/register (No Auth)',
                    login: 'POST /api/sessions/login (No Auth)',
                    current: 'GET /api/sessions/current (Auth Required)',
                    logout: 'GET /api/sessions/logout (Auth Required)',
                    unprotectedLogin: 'POST /api/sessions/unprotectedLogin (No Auth)',
                    unprotectedCurrent: 'GET /api/sessions/unprotectedCurrent (No Auth)'
                },
                mocking: {
                    mockUsers: 'GET /api/mocks/mockingusers (No Auth)',
                    mockPets: 'GET /api/mocks/mockingpets (No Auth)',
                    generateData: 'POST /api/mocks/generateData (No Auth)'
                }
            }
        },
        total_endpoints: 22,
        auth_endpoints: 10,
        no_auth_endpoints: 12,
        quick_links: {
            home: '/',
            documentation: '/api-docs',
            health_check: '/health'
        }
    });
});

const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   🚀 Backend III - Entrega Final                                     ║
║   📁 Entorno: ${NODE_ENV}${NODE_ENV === 'development' ? '        ' : '         '}                          ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║   📊 ENDPOINTS DISPONIBLES:                                         ║
║                                                                       ║
║   🔐 Sessions (6):                                                   ║
║     POST /api/sessions/register     POST /api/sessions/login         ║
║     GET  /api/sessions/current      GET  /api/sessions/logout        ║
║     POST /api/sessions/unprotectedLogin                              ║
║     GET  /api/sessions/unprotectedCurrent                            ║
║                                                                       ║
║   👥 Users (5):                                                      ║
║     GET  /api/users                GET  /api/users/:uid              ║
║     PUT  /api/users/:uid           DELETE /api/users/:uid            ║
║     POST /api/users/:uid/documents                                    ║
║                                                                       ║
║   🐾 Pets (6):                                                       ║
║     GET  /api/pets                 POST /api/pets                    ║
║     GET  /api/pets/:pid            PUT  /api/pets/:pid               ║
║     DELETE /api/pets/:pid          POST /api/pets/withimage          ║
║                                                                       ║
║   🏠 Adoptions (3):                                                  ║
║     GET  /api/adoptions            GET  /api/adoptions/:aid          ║
║     POST /api/adoptions/:uid/:pid                                     ║
║                                                                       ║
║   🧪 Mocking (3):                                                    ║
║     GET  /api/mocks/mockingusers   GET  /api/mocks/mockingpets       ║
║     POST /api/mocks/generateData                                      ║
║                                                                       ║
║   📚 System (4):                                                     ║
║     GET  /                         GET  /api-docs                    ║
║     GET  /api-docs-json            GET  /health                      ║
║                                                                       ║
║   📋 Total: 22 endpoints                                            ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║   🌐 Servidor ejecutándose en: http://localhost:${PORT}               ║
║   📖 Swagger Documentation: http://localhost:${PORT}/api-docs         ║
║   🩺 Health Check: http://localhost:${PORT}/health                   ║
║   🐳 Docker Image: fi93/backend3-entrega-final                       ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
    `);
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