# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Prefijo y URL de la API se fijan al compilar el frontend (ver docker-compose.prod.yml)
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
# El mark oficial para la página de acceso privado (api/lib/site-gate.ts)
COPY --from=build /app/design/ismos/logos ./design/ismos/logos
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/boot.js"]
