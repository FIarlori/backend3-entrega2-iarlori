# Backend III - Testing y Escalabilidad

**Proyecto del curso Backend III (CoderHouse)** - Sistema completo de gestión de usuarios, mascotas y adopciones con testing, documentación y containerización Docker.

---

## 📋 Características Principales

- ✅ **API REST completa** con Express.js
- ✅ **Base de datos MongoDB** con Mongoose
- ✅ **Autenticación JWT** con cookies firmadas
- ✅ **Documentación Swagger** completa e interactiva
- ✅ **Testing** con Mocha, Chai y Supertest
- ✅ **Generación de datos mock** con Faker.js
- ✅ **Containerización Docker** con imagen pública
- ✅ **Arquitectura en capas** (Controller, Service, Repository, DAO)

---

## 🐳 Docker Image

La imagen Docker está disponible públicamente en:  
📦 **https://hub.docker.com/r/fi93/backend3-entrega-final**

### Comandos Docker:

```bash
# Descargar y ejecutar la imagen
docker pull fi93/backend3-entrega-final:latest
docker run -p 8080:8080 fi93/backend3-entrega-final

# O ejecutar con variables de entorno
docker run -p 8080:8080 \
  -e MONGO_URL=mongodb://host.docker.internal:27017/backend_coder \
  -e JWT_SECRET=my_secret_jwt \
  fi93/backend3-entrega-final

# Levanta app + MongoDB
docker-compose up

# Con rebuild
docker-compose up --build
```

---

## 🚀 Instalación y ejecución local

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


### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Construir y ejecutar con docker
```bash

# Construir imagen local
npm run docker:build

# Ejecutar contenedor
npm run docker:run

# Usar docker-compose (incluye MongoDB)
npm run docker:compose

```

---

## 📚 Documentación API

La documentación Swagger completa está disponible en:
http://localhost:8080/api-docs

Módulos documentados:
👥 Users - Gestión de usuarios
🐾 Pets - Gestión de mascotas
🏠 Adoptions - Proceso de adopciones
🔐 Sessions - Autenticación y autorización
🧪 Mocking - Generación de datos de prueba

---

## 📁 Estructura del Proyecto

```
backend3-entrega-final/
├── node_modules/
├── src/
│ ├── controllers/
│ │ ├── adoptions.controller.js # Controlador de adopciones
│ │ ├── mocks.controller.js # Controlador de mocking
│ │ ├── pets.controller.js # Controlador de mascotas
│ │ ├── sessions.controller.js # Controlador de sesiones
│ │ └── users.controller.js # Controlador de usuarios
│ ├── dao/
│ │ ├── models/
│ │ │ ├── Adoption.js # Modelo de adopciones
│ │ │ ├── Pet.js # Modelo de mascotas
│ │ │ └── User.js # Modelo de usuarios
│ │ ├── Adoption.js # DAO de adopciones
│ │ ├── Pets.dao.js # DAO de mascotas
│ │ └── Users.dao.js # DAO de usuarios
│ ├── docs/
│ │ ├── postman/
│ │ │ └── postman_collection.json # Colección Postman
│ │ ├── swagger/
│ │ │ ├── adoptions.yaml # Docs Swagger adopciones
│ │ │ ├── mocking.yaml # Docs Swagger mocking
│ │ │ ├── pets.yaml # Docs Swagger mascotas
│ │ │ ├── sessions.yaml # Docs Swagger sesiones
│ │ │ └── users.yaml # Docs Swagger usuarios
│ │ └── swagger.js # Configuración Swagger
│ ├── dto/
│ │ ├── Pet.dto.js # DTO de mascotas
│ │ └── User.dto.js # DTO de usuarios
│ ├── public/
│ │ └── img/
│ │ ├── 1671549990926-coderDog.jpg
│ │ └── 1768850601750-img.png
│ ├── repository/
│ │ ├── AdoptionRepository.js # Repository adopciones
│ │ ├── GenericRepository.js # Repository genérico
│ │ ├── PetRepository.js # Repository mascotas
│ │ └── UserRepository.js # Repository usuarios
│ ├── routes/
│ │ ├── adoption.router.js # Router adopciones
│ │ ├── mocks.router.js # Router mocking
│ │ ├── pets.router.js # Router mascotas
│ │ ├── sessions.router.js # Router sesiones
│ │ └── users.router.js # Router usuarios
│ ├── services/
│ │ └── index.js # Servicios principales
│ ├── utils/
│ │ ├── index.js # Utilidades generales
│ │ ├── mocking.js # Generación de datos mock
│ │ └── uploader.js # Upload de archivos
│ └── app.js # Aplicación principal
├── test/
│ ├── adoptions/
│ │ ├── adoptions.test.js # Tests funcionales adopciones
│ │ └── adoptions-integration.test.js
│ ├── mocks/
│ │ ├── mocking.test.js # Tests mocking
│ │ └── generate-data.test.js
│ ├── pets/
│ │ ├── pets.test.js # Tests mascotas
│ │ └── pets-image.test.js
│ ├── sessions/
│ │ ├── auth.test.js # Tests autenticación
│ │ └── sessions.test.js
│ ├── users/
│ │ └── users.test.js # Tests usuarios
│ ├── utils/
│ │ └── mocking.test.js # Tests utils mocking
│ ├── adoptions-real.test.js # Tests legacy adopciones
│ ├── adoptions-simple.test.js # Tests simples adopciones
│ └── simple.test.js # Tests generales
├── .dockerignore
├── .env
├── .env.sample
├── .gitignore
├── Dockerfile
├── docker-compose.yml
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

## 📊 Endpoints Principales

## 👥 Users (/api/users)
- GET `/` - Listar todos los usuarios
- GET `/:uid` - Obtener usuario por ID
- PUT `/:uid` - Actualizar usuario
- DELETE `/:uid` - Eliminar usuario

## 🐾 Pets (/api/pets)
- GET `/` - Listar todas las mascotas
- POST `/` - Crear nueva mascota
- POST `/withimage` - Crear mascota con imagen
- PUT `/:pid` - Actualizar mascota
- DELETE `/:pid` - Eliminar mascota
- GET `/:pid` - Obtener mascota por ID

## 🏠 Adoptions (/api/adoptions)
- GET `/` - Listar todas las adopciones
- GET `/:aid` - Obtener adopción por ID
- POST `/:uid/:pid` - Crear nueva adopción

## 🔐 Sessions (/api/sessions)
- POST `/register` - Registrar nuevo usuario
- POST `/login` - Iniciar sesión
- GET `/current` - Usuario actual
- GET `/logout` - Cerrar sesión


---

## 📈 Health Check

Endpoint de monitoreo: GET `/health`

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production",
  "database": {
    "status": "connected",
    "name": "backend_coder"
  }
}
```

---

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) almacenados en cookies firmadas:

1. Login: POST `/api/sessions/login` establece cookie coderCookie
2. Acceso protegido: Endpoints requieren cookie válida
3. Logout: GET `/api/sessions/logout` limpia la cookie

Roles:
- user: Acceso básico a recursos
- admin: Acceso completo (si se implementan permisos)

---

## 🚨 Manejo de Errores

- 400: Bad Request - Datos inválidos
- 401: Unauthorized - No autenticado
- 403: Forbidden - Sin permisos
- 404: Not Found - Recurso no existe
- 500: Internal Server Error - Error del servidor

Todos los errores incluyen formato JSON estandarizado.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm run test:simple          # Tests básicos
npm run test:adoptions       # Tests del módulo de adopciones
npm run test:all             # Todos los tests
npm run test:watch           # Modo watch para desarrollo

# Linting
npm run lint

```

Cobertura de tests:

✅ Tests funcionales para módulo de mocking
✅ Tests de adopciones
✅ Tests de integración
✅ Validación de casos de error

---

## Instrucciones para usar la colección:

Flujo recomendado para test de endpoints:
Configurar entorno:

Importar colección

Crear entorno con variables

Setear base_url a http://localhost:8080

Pruebas (Mocking):

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

## 📊 Generación de Datos Mock

El módulo de mocking permite:

### Usuarios Mock

- Password encriptado: coder123
- Roles aleatorios: user o admin
- Pets: Array vacío por defecto
- Formato compatible con MongoDB 
- Campos: `first_name`, `last_name`, `email`, `password`, `role`, `pets`

### Mascotas Mock

- Especies variadas: perro, gato, conejo, etc.
- Datos realistas: nombres, fechas, imágenes
- `adopted: false` por defecto  

### Inserción en DB

```bash
POST /api/mocks/generateData
Body: { "users": 10, "pets": 5 }
```

---

## 🛠️ Tecnologías Utilizadas

Backend: Node.js, Express.js

Base de datos: MongoDB, Mongoose

Autenticación: JWT, bcrypt, cookies firmadas

Documentación: Swagger/OpenAPI 3.0

Testing: Mocha, Chai, Supertest

Mocking: Faker.js

Containerización: Docker, Docker Compose

Desarrollo: ESLint, Nodemon


---

## 📝 Criterios de Entrega Cumplidos

### ✅ Primera Entrega:

- Router mocks.router.js bajo /api/mocks
- Módulo de mocking para usuarios y mascotas
- Endpoints: /mockingusers, /mockingpets, /generateData
- Inserción en DB y verificación

### ✅ Entrega Final:

- Documentación Swagger completa (Users, Pets, Adoptions, Sessions, Mocking)
- Tests funcionales para todos los endpoints de adoption.router.js
- Dockerfile para generar imagen del proyecto
- Imagen subida a DockerHub (https://hub.docker.com/r/fi93/backend3-entrega-final)
- README.md con link a imagen DockerHub

---

## 📄 Autor
**Franco Iarlori**  
Backend III (CoderHouse)
