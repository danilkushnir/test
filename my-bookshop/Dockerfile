FROM node:20

# Arbeitsverzeichnis
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# CAP CLI installieren
RUN npm install -g @sap/cds-dk

# Projekt-Abhängigkeiten installieren
RUN npm install

# Restliches Projekt kopieren
COPY . .

# CAP Backend bauen
RUN cds build
RUN cds deploy --to sqlite

# UI5 App bauen
WORKDIR /app/app/books
RUN npm install
RUN npm run build

# UI Build in CAP einbinden
WORKDIR /app
RUN mkdir -p app/books/dist
RUN cp -r app/books/build/* app/books/dist/

# Port für Railway
EXPOSE 8080

# CAP Backend starten (liefert auch statische UI aus)
CMD ["cds", "run", "--port", "8080"]
