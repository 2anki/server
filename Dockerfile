FROM node:12-slim

COPY . /app
WORKDIR /app

RUN apt-get update || : && apt-get install python3 -y

RUN npm install

RUN npm run build

ENV PORT 8080
EXPOSE 8080

CMD ["/app/node_modules/.bin/imba", "src/server/server.imba"]