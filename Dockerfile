FROM node:20-alpine AS development

WORKDIR /usr/src/app

ENV NODE_ENV=development
ENV NPM_CONFIG_IGNORE_SCRIPTS=true

# Install build dependencies
RUN apk add --no-cache openssl openssl-dev make gcc g++ python3

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .


RUN npm run build


CMD [ "npm","run","start:dev" ]

FROM node:20-alpine AS production

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