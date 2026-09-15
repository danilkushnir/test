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

# UI5 App bauen (UI5-CLI benötigt Node >= 20.11)
WORKDIR /app/app/books
RUN npm install
RUN npm run build

# Zurück zum Hauptordner
WORKDIR /app

# Port für Railway
EXPOSE 8080

# CAP Backend starten (liefert auch statische UI aus)
CMD ["cds", "run", "--port", "8080"]
