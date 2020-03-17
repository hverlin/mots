FROM node:10

EXPOSE 2121
EXPOSE 1337

ADD . .

RUN npm install

CMD npm start