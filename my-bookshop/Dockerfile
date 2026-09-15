FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g @sap/cds-dk
RUN npm install
RUN npm install -g concurrently

COPY . .

RUN cds deploy --to sqlite

EXPOSE 4004
EXPOSE 8080

CMD ["concurrently", "\"cds watch\"", "\"npm --prefix app/books start\""]
