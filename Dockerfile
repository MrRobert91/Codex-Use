FROM node:24-alpine AS build

WORKDIR /app
COPY ["Uso de Codex.html", "./Uso de Codex.html"]
COPY scripts/extract-bundle.js ./scripts/extract-bundle.js
RUN node scripts/extract-bundle.js

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/public /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
