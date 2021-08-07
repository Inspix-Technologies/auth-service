FROM node:14

EXPOSE 8000
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
COPY firebase-admin.json ./dist

WORKDIR /app/dist

# CMD node src/server.ts

CMD node server.js