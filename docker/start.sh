#!/bin/bash
set -e

mkdir -p /data/db
mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /var/log/mongod.log

export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/food-ordering}"
export AUTO_SEED="${AUTO_SEED:-true}"
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-5000}"

cd /app
npm run start -w @food-ordering/server
