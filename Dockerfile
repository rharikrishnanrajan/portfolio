# Stage 1: Build Flutter Web
FROM subosito/flutter-node:3.16.0 as build-flutter
WORKDIR /app
COPY . .
RUN flutter pub get
RUN flutter build web

# Stage 2: Build Node.js Backend
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY ./backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY ./backend ./backend

# Copy Flutter web build from Stage 1
COPY --from=build-flutter /app/build/web ./build/web

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "index.js"]
