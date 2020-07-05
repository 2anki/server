FROM node:12-slim

COPY . /app
WORKDIR /app

RUN npm install

RUN npm run build

ENV PORT 8080
EXPOSE 8080

CMD ["/app/node_modules/.bin/imba", "src/server/upload.imba"]