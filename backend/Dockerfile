FROM node:20-alpine

# On ajoute le dépôt "edge/community" pour avoir accès aux compatibilités OpenSSL
# et on force l'installation de libressl ou openssl selon les besoins de Prisma
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    libcrypto1.1 \
    libssl1.1 || \
    (echo "http://dl-cdn.alpinelinux.org/alpine/v3.16/main" >> /etc/apk/repositories && \
     apk add --no-cache libssl1.1)

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copie explicite du dossier prisma avant le reste
COPY prisma ./prisma/
COPY . .

RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]