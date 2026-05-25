FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl gnupg ca-certificates \
  && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
    | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor \
  && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends mongodb-org \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm ci --omit=dev

COPY shared ./shared
COPY server ./server

RUN npm run build -w @food-ordering/shared && npm run build -w @food-ordering/server

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

ENV NODE_ENV=production
ENV AUTO_SEED=true
ENV MONGODB_URI=mongodb://127.0.0.1:27017/food-ordering
ENV CLIENT_URL=https://online-food-ordering-system-client.vercel.app

EXPOSE 5000

CMD ["/start.sh"]
