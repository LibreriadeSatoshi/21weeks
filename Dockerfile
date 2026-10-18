# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# API prefix and URL are set when building the frontend (see docker-compose.prod.yml)
ARG BASE_PATH=/
ARG VITE_API_URL=
ENV BASE_PATH=$BASE_PATH VITE_API_URL=$VITE_API_URL
RUN npm run build \
 && npm prune --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/boot.js"]
