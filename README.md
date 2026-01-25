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

## 🐳 Docker

La imagen Docker está disponible públicamente en:  

📦 **https://hub.docker.com/r/fi93/backend3-entrega-final**


Antes de ejecutar los comandos, iniciar Docker Desktop

Dos formas de ejecutar con Docker:

Opción A: Usar la imagen pre-construida de Docker Hub


```bash
# Descargar la imagen
docker pull fi93/backend3-entrega-final:latest

# Ejecutar la aplicación
docker run -p 8080:8080 \
  --env-file .env.docker \
  fi93/backend3-entrega-final:latest
```

Opción B: Usar docker-compose local

```bash
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

### 5. Comandos Docker disponibles

```bash

# Construir y ejecutar con docker-compose (Aplicación + MongoDB)
npm run docker:compose

# Construir imagen local
npm run docker:build

# Ejecutar solo la aplicación (necesita MongoDB externo)
npm run docker:run

# Parar contenedores
npm run docker:down

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
│   ├── controllers/
│   │   ├── adoptions.controller.js      # Controlador de adopciones
│   │   ├── mocks.controller.js          # Controlador de mocking
│   │   ├── pets.controller.js           # Controlador de mascotas
│   │   ├── sessions.controller.js       # Controlador de sesiones
│   │   └── users.controller.js          # Controlador de usuarios
│   │
│   ├── dao/
│   │   ├── models/
│   │   │   ├── Adoption.js              # Modelo de adopciones
│   │   │   ├── Pet.js                   # Modelo de mascotas
│   │   │   └── User.js                  # Modelo de usuarios
│   │   ├── Adoption.dao.js              # DAO de adopciones
│   │   ├── Pets.dao.js                  # DAO de mascotas
│   │   └── Users.dao.js                 # DAO de usuarios
│   │
│   ├── docs/
│   │   ├── postman/
│   │   │   └── postman_collection.json  # Colección Postman
│   │   ├── swagger/
│   │   │   ├── adoptions.yaml           # Docs Swagger adopciones
│   │   │   ├── mocking.yaml             # Docs Swagger mocking
│   │   │   ├── pets.yaml                # Docs Swagger mascotas
│   │   │   ├── sessions.yaml            # Docs Swagger sesiones
│   │   │   └── users.yaml               # Docs Swagger usuarios
│   │   └── swagger.js                   # Configuración Swagger
│   │
│   ├── dto/
│   │   ├── Adoption.dto.js              # DTO de adopciones
│   │   ├── Pet.dto.js                   # DTO de mascotas
│   │   └── User.dto.js                  # DTO de usuarios
│   │
│   ├── logs/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js           # Middleware de autenticación
│   │   └── logger.middleware.js         # Middleware de logging
│   │
│   ├── public/
│   │   ├── documents/                   # Documentos públicos
│   │   ├── img/
│   │   │   ├── pets/                    # Imágenes de mascotas
│   │   │   ├── profiles/                # Imágenes de perfiles
│   │   │   └── 1671549990926-coderDog.jpg
│   │   └── temp/                        # Archivos temporales
│   │
│   ├── repository/
│   │   ├── AdoptionRepository.js        # Repository adopciones
│   │   ├── GenericRepository.js         # Repository genérico
│   │   ├── PetRepository.js             # Repository mascotas
│   │   └── UserRepository.js            # Repository usuarios
│   │
│   ├── routes/
│   │   ├── adoption.router.js           # Router adopciones
│   │   ├── mocks.router.js              # Router mocking
│   │   ├── pets.router.js               # Router mascotas
│   │   ├── sessions.router.js           # Router sesiones
│   │   └── users.router.js              # Router usuarios
│   │
│   ├── services/
│   │   └── index.js                     # Servicios principales
│   │
│   ├── utils/
│   │   ├── index.js                     # Utilidades generales
│   │   ├── logger.js                    # Configuración de logger
│   │   ├── mocking.js                   # Generación de datos mock
│   │   └── uploader.js                  # Upload de archivos
│   │
│   └── app.js                           # Aplicación principal
│
├── test/
│   ├── adoptions/
│   │   └── adoptions.test.js            # Tests adopciones
│   ├── mocks/
│   │   └── mocking.test.js              # Tests mocking
│   ├── pets/
│   │   └── pets.test.js                 # Tests mascotas
│   ├── sessions/
│   │   └── auth.test.js                 # Tests autenticación
│   ├── users/
│   │   └── users.test.js                # Tests usuarios
│   ├── utils/
│   │   ├── bcrypt-dto.test.js           # Tests bcrypt / DTO
│   │   └── mocking.test.js              # Tests utils mocking
│   ├── setup.js                         # Setup de testing
│   └── test-app.js                      # App de testing
│
├── .dockerignore
├── .env
├── .env.docker
├── .env.sample
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md

```

---

## 🔧 Configuración de Variables de Entorno

- .env.sample

```
PORT=8080
NODE_ENV=development
MONGO_URL=my_mongo_URL
JWT_SECRET=my_secret_jwt
COOKIE_SECRET=my_secret_cookie
JWT_EXPIRES_IN=1h

```

- Para desarrollo local usar ".env":

- Con Docker usar ".env.docker":

---

## 📚 Endpoints del sistema

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

## 📊 ENDPOINTS COMPLETOS DEL SISTEMA

### 🔐 SESSIONS (`/api/sessions`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | ❌ No |
| POST | `/login` | Iniciar sesión (cookie firmada) | ❌ No |
| GET | `/current` | Usuario actual autenticado | ✅ Sí |
| GET | `/logout` | Cerrar sesión | ✅ Sí |
| POST | `/unprotectedLogin` | Login sin protección (testing) | ❌ No |
| GET | `/unprotectedCurrent` | Usuario sin protección (testing) | ❌ No |

### 👥 USERS (`/api/users`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todos los usuarios | ❌ No |
| GET | `/:uid` | Obtener usuario por ID | ❌ No |
| PUT | `/:uid` | Actualizar usuario | ❌ No |
| DELETE | `/:uid` | Eliminar usuario | ❌ No |
| POST | `/:uid/documents` | Subir documentos de usuario | ✅ Sí |

### 🐾 PETS (`/api/pets`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todas las mascotas | ❌ No |
| POST | `/` | Crear nueva mascota | ✅ Sí |
| GET | `/:pid` | Obtener mascota por ID | ❌ No |
| PUT | `/:pid` | Actualizar mascota | ✅ Sí |
| DELETE | `/:pid` | Eliminar mascota | ✅ Sí |
| POST | `/withimage` | Crear mascota con imagen | ✅ Sí |

### 🏠 ADOPTIONS (`/api/adoptions`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todas las adopciones | ✅ Sí |
| GET | `/:aid` | Obtener adopción por ID | ✅ Sí |
| POST | `/:uid/:pid` | Crear nueva adopción | ✅ Sí |

### 🧪 MOCKING (`/api/mocks`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/mockingusers` | Generar usuarios mock | ❌ No |
| GET | `/mockingpets` | Generar mascotas mock | ❌ No |
| POST | `/generateData` | Insertar datos mock en DB | ❌ No |

### 📊 SYSTEM (`/`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Página principal con información | ❌ No |
| GET | `/api-docs` | Documentación Swagger UI | ❌ No |
| GET | `/health` | Health check del sistema | ❌ No |
| GET | `/api-docs-json` | Especificación OpenAPI JSON | ❌ No |


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
npm run test:adoptions       # Tests del módulo de adopciones
npm run test:all             # Todos los tests



```

Cobertura de tests:

✅ Tests funcionales para módulo de mocking
✅ Tests de adopciones
✅ Tests de integración
✅ Validación de casos de error

---

## Instrucciones para usar la colección:


📱 POSTMAN COLLECTION - Instrucciones de Uso con Autenticación
Configuración Inicial:
Importar colección: src/docs/postman/postman_collection.json

Crear entorno con variables:

base_url: http://localhost:8080

auth_token: (se autocompletará después del login)

user_id: (ID de usuario para pruebas)

pet_id: (ID de mascota para pruebas)

Flujo Recomendado para Testing:
FASE 1: Endpoints SIN Autenticación (No Auth)
Estos endpoints NO requieren cookie de autenticación:

# 1. Generar datos mock (opcional para pruebas)
GET {{base_url}}/api/mocks/mockingusers?count=5
GET {{base_url}}/api/mocks/mockingpets?count=3
POST {{base_url}}/api/mocks/generateData
Body: { "users": 2, "pets": 2 }

# 2. Probar endpoints públicos
GET {{base_url}}/api/users                # Listar usuarios
GET {{base_url}}/api/pets                 # Listar mascotas
GET {{base_url}}/api-docs                 # Documentación Swagger
GET {{base_url}}/health                   # Health check

# 3. Registrar usuario (prepara para autenticación)
POST {{base_url}}/api/sessions/register
Body: {
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com",
  "password": "password123"
}
# ⚡ GUARDAR el `_id` del usuario en variable `user_id`

FASE 2: Autenticación - Obtener Token

# 4. Iniciar sesión (obtiene cookie)
POST {{base_url}}/api/sessions/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
# ✅ La respuesta establece automáticamente la cookie `coderCookie`
# ⚡ Postman maneja las cookies automáticamente para siguientes requests

FASE 3: Endpoints CON Autenticación (Requiere Auth)

# 5. Usuario autenticado
GET {{base_url}}/api/sessions/current     # Usuario actual
GET {{base_url}}/api/sessions/logout      # Cerrar sesión

# 6. Crear mascota (requiere auth)
POST {{base_url}}/api/pets
Body: {
  "name": "Mascota Test",
  "specie": "perro",
  "birthDate": "2020-01-15"
}
# ⚡ GUARDAR el `_id` de la mascota en variable `pet_id`

# 7. Operaciones con mascotas (requieren auth)
PUT {{base_url}}/api/pets/{{pet_id}}
DELETE {{base_url}}/api/pets/{{pet_id}}

# 8. Crear adopción (requiere auth)
POST {{base_url}}/api/adoptions/{{user_id}}/{{pet_id}}

# 9. Ver adopciones (requiere auth)
GET {{base_url}}/api/adoptions
GET {{base_url}}/api/adoptions/{{adoption_id}}

# 10. Subir documentos de usuario (requiere auth)
POST {{base_url}}/api/users/{{user_id}}/documents
Form-data: documents[] = (seleccionar archivo)

FASE 4: Testing sin Cookies Firmadas (Endpoints de Testing)

# Para desarrollo/testing (no usar en producción)
POST {{base_url}}/api/sessions/unprotectedLogin
GET {{base_url}}/api/sessions/unprotectedCurrent

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
