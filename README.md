# Backend III - Entrega 1: Testing y Escalabilidad

Primera entrega del curso **Backend III (CoderHouse)**.  
Implementación de un sistema de **mocking** para generar datos de prueba, incluyendo usuarios y mascotas, con inserción automática en MongoDB.

---

## 📋 Objetivos de la Entrega

- Crear un router específico para endpoints de mocking  
- Desarrollar un módulo de generación de datos fake  
- Implementar endpoints para generar e insertar datos mock  
- Verificar la correcta inserción mediante servicios existentes  

---

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <repo-url>
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno  
Usar como referencia **.env.sample**.

### 4. Ejecutar la aplicación
```bash
npm run dev
```

---

## 📁 Estructura del Proyecto

```
backend3-entrega1-iarlori/
├── docs/
│   └── postman/
│       └── postman_collection.json
├── src/
│   ├── controllers/
│   │   ├── adoptions.controller.js
│   │   ├── mocks.controller.js
│   │   ├── pets.controller.js
│   │   ├── sessions.controller.js
│   │   └── users.controller.js
│   ├── dao/
│   │   ├── models/
│   │   │   ├── Adoption.js
│   │   │   ├── Pet.js
│   │   │   └── User.js
│   │   ├── Adoption.js
│   │   ├── Pets.dao.js
│   │   └── Users.dao.js
│   ├── dto/
│   │   ├── Pet.dto.js
│   │   └── User.dto.js
│   ├── public/
│   │   └── img/
│   │       └── 1671549990926-coderDog.jpg
│   ├── repository/
│   │   ├── AdoptionRepository.js
│   │   ├── GenericRepository.js
│   │   ├── PetRepository.js
│   │   └── UserRepository.js
│   ├── routes/
│   │   ├── adoption.router.js
│   │   ├── mocks.router.js
│   │   ├── pets.router.js
│   │   ├── sessions.router.js
│   │   └── users.router.js
│   ├── services/
│   │   └── index.js
│   ├── utils/
│   │   ├── index.js
│   │   ├── mocking.js
│   │   └── uploader.js
│   └── app.js
├── test/
│   └── simple.test.js
├── .env
├── .env.sample
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔧 Configuración de Variables de Entorno

```
PORT=8080
NODE_ENV=development
MONGO_URL=my_mongo_URL
JWT_SECRET=my_secret_jwt
COOKIE_SECRET=my_secret_cookie
JWT_EXPIRES_IN=1h
```

---

## 📚 Endpoints Principales

### 🎯 Endpoints de Mocking

| Método | Endpoint                            | Descripción                         |
|--------|--------------------------------------|-------------------------------------|
| GET    | `/api/mocks/mockingusers`            | Genera 50 usuarios mock             |
| GET    | `/api/mocks/mockingusers?count=N`    | Genera N usuarios mock              |
| GET    | `/api/mocks/mockingpets`             | Genera 100 mascotas mock            |
| GET    | `/api/mocks/mockingpets?count=N`     | Genera N mascotas mock              |
| POST   | `/api/mocks/generateData`            | Inserta datos mock en MongoDB       |

### Ejemplo de Body para generateData
```json
{
  "users": 5,
  "pets": 3
}
```

---

## 👥 Endpoints de Usuarios

- GET `/api/users`
- GET `/api/users/:uid`
- PUT `/api/users/:uid`
- DELETE `/api/users/:uid`

---

## 🐾 Endpoints de Mascotas

- GET `/api/pets`
- POST `/api/pets`
- PUT `/api/pets/:pid`
- DELETE `/api/pets/:pid`

---

## 🔐 Endpoints de Autenticación

- POST `/api/sessions/register`
- POST `/api/sessions/login`
- GET `/api/sessions/current`
- GET `/api/sessions/logout`

---

## 🧪 Testing

```bash
npm test
npm run test:watch
```


## Instrucciones para usar la colección:

Flujo recomendado para test de endpoints:
Configurar entorno:

Importar colección

Crear entorno con variables

Setear base_url a http://localhost:8080

Pruebas de Entrega 1 (Mocking):

GET Mocking Users - Verificar 50 usuarios

GET Mocking Pets - Verificar 100 mascotas

POST Generate & Insert Data - Insertar datos reales

Obtener IDs para pruebas:

GET All Users - Copiar un _id → Pegar en variable user_id

GET All Pets - Copiar un _id → Pegar en variable pet_id

Probar endpoints con IDs:

GET User by ID (usar variable user_id)

GET Adoption by ID (si existe)

POST Create Adoption (usar user_id y pet_id)

Autenticación:

POST Register - Crear usuario

POST Login - Iniciar sesión

GET Current - Ver usuario actual

GET Logout - Cerrar sesión

---

## 📊 Características de los Datos Mock

### Usuarios Generados
- Contraseña por defecto: **coder123** (encriptada con bcrypt)  
- Role aleatorio: **user** o **admin**  
- Campos: `first_name`, `last_name`, `email`, `password`, `role`, `pets`

### Mascotas Generadas
- Especies: perro, gato, conejo, hamster, pájaro, pez, tortuga  
- `adopted: false` por defecto  
- Imagen generada con Faker.js  

---

## 🛠️ Tecnologías Utilizadas

Node.js • Express.js • MongoDB • Mongoose • JWT • Bcrypt • Faker.js • Mocha • Chai • Supertest  

---

## 📄 Autor
**Franco Iarlori**  
Entrega 1 - Backend III (CoderHouse)
