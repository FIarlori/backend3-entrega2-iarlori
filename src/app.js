import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';

const app = express();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/backend_coder';

mongoose.set('strictQuery', false);

console.log(`🌍 Entorno: ${NODE_ENV}`);
console.log(`🔗 MongoDB: ${MONGO_URL}`);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log(`✅ MongoDB conectado (${NODE_ENV})`);
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
        <h1>Backend III - Entrega 1</h1>
        <p><strong>Entorno:</strong> ${NODE_ENV}</p>
        <p><strong>Base de datos:</strong> ${mongoose.connection.name}</p>
        
        <h2>📌 Endpoints de Mocking (Entrega 1):</h2>
        <ul>
            <li><a href="/api/mocks/mockingpets">GET /api/mocks/mockingpets</a> - Generar mascotas mock</li>
            <li><a href="/api/mocks/mockingusers">GET /api/mocks/mockingusers</a> - Generar 50 usuarios mock</li>
            <li>POST /api/mocks/generateData - Insertar datos en DB</li>
        </ul>
        
        <h2>🔧 Endpoints Existentes:</h2>
        <ul>
            <li><a href="/api/users">GET /api/users</a> - Listar usuarios</li>
            <li><a href="/api/pets">GET /api/pets</a> - Listar mascotas</li>
        </ul>
        
        <h2>📊 Estado:</h2>
        <p>MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}</p>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use((err, req, res, next) => {
    console.error(`[${NODE_ENV}] Error:`, err.message);
    
    const response = {
        status: 'error',
        message: 'Something went wrong'
    };
    
    if (NODE_ENV === 'development') {
        response.error = err.message;
        response.stack = err.stack;
    }
    
    res.status(500).json(response);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Entorno: ${NODE_ENV}`);
});