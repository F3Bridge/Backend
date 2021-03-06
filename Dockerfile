FROM node:16-alpine As development
WORKDIR /usr/src/app
COPY package*.json ./
# Installing all dependencies (including dev-only)
RUN npm install --production=false --legacy-peer-deps
COPY . .
# Building the app
RUN npm run build
# Pruning dev dependencies
RUN npm prune --production

EXPOSE 8080

CMD ["node", "dist/main"]