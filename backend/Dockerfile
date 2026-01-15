FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Génération du client Prisma avant le démarrage
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]