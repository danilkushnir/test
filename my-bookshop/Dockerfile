FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/app/books
RUN npm install

EXPOSE 8080

CMD ["npm", "start"]

