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

WORKDIR /usr/src/app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_IGNORE_SCRIPTS=true

RUN apk add --no-cache openssl openssl-dev make gcc g++ python3 bash

COPY package*.json ./
RUN npm install --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY src/templates ./src/templates

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 80

ENTRYPOINT [ "./entrypoint.sh" ]

CMD [ "node", "dist/main" ]