FROM node:20-alpine as development

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install

COPY . .


COPY prisma ./prisma

RUN npx prisma generate

RUN npm run build


CMD [ "npm","run","start:dev" ]

FROM node:20-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install glob rimraf


RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/main" ]