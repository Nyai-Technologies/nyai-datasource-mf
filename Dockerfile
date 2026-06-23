FROM node:22-slim

ENV TZ=Asia/Kolkata

RUN groupadd -r appuser && useradd -r -g appuser -s /bin/bash appuser && \
    mkdir /APP && chown -R appuser:appuser /APP

WORKDIR /APP

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN chown -R appuser:appuser /APP

USER appuser

EXPOSE 5001

ENTRYPOINT ["node", "server.mjs", "preview", "--port", "5001", "--host", "0.0.0.0"]
