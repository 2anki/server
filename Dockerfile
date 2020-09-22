FROM node:12-slim

RUN apt-get update
RUN apt-get install python3 python3-pip git -y
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./src/genanki/requirements.txt .
RUN pip3 install -r ./requirements.txt

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

ENV PORT 8080
EXPOSE 8080

CMD ["/app/node_modules/.bin/imba", "src/server/server.imba"]
