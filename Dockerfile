FROM node:18-alpine3.18

WORKDIR /app

# Copiar todo
COPY . .

# Instalar solo dependencias de producción
RUN npm install --only=production

# Crear directorios necesarios
RUN mkdir -p \
    src/logs \
    src/public/img/pets \
    src/public/img/profiles \
    src/public/documents

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080

# Exponer puerto
EXPOSE 8080

# Comando de inicio
CMD ["node", "src/app.js"]