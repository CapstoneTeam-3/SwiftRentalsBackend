FROM node:18.7.0

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3001

CMD node index.js