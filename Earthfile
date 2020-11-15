FROM node:12-slim
WORKDIR /app

n2a:
    RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y locales
    RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
        dpkg-reconfigure --frontend=noninteractive locales && \
        update-locale LANG=en_US.UTF-8

    ENV LANG en_US.UTF-8
    RUN apt-get update || : && apt-get install python3 python3-pip -y && rm -rf /var/lib/apt/lists/*

    COPY ./src/genanki/requirements.txt /tmp/requirements.txt
    RUN pip3 install -r /tmp/requirements.txt
    SAVE IMAGE alemayhu/n2a

deps:
    FROM +n2a
    COPY package.json ./
    RUN npm install
    SAVE ARTIFACT package-lock.json AS LOCAL ./package-lock.json
    SAVE ARTIFACT package.json AS LOCAL ./package.json

build:
    FROM +deps
    COPY . .
    RUN npm run build
    SAVE ARTIFACT . /dist

docker:
    FROM +build
    EXPOSE 8080
    ENV PORT 8080
    ENTRYPOINT ["./node_modules/.bin/imba", "src/server/server.imba"]
    SAVE IMAGE alemayhu/notion2anki