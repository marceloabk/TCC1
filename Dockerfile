FROM node:latest

WORKDIR usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

