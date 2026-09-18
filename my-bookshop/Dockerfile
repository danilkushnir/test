FROM node:20

# Chromium Dependencies installieren
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrender1 \
    libdrm2 \
    libxcb1 \
    libxinerama1 \
    libxcursor1 \
    libxi6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install -g @sap/cds-dk
RUN npm install

COPY . .



# RUN node runAll.js
RUN node srv/test_1.js
RUN cds build
RUN cds deploy --to sqlite

WORKDIR /app/app/books
RUN npm install
RUN npm run build

WORKDIR /app

EXPOSE 8080

CMD ["cds", "run", "--port", "8080"]
