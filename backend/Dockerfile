FROM node:20-alpine

# Installation des dépendances système nécessaires pour Prisma sur Alpine
# openssl1.1-compat est crucial ici
RUN apk add --no-cache openssl openssl1.1-compat libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On force Prisma à générer le moteur pour 'linux-musl' (spécifique à Alpine)
# et on s'assure que le client est généré dans le bon environnement
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]