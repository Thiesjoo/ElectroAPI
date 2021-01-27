ARG ALPINE_VERSION=3.12
ARG NODE_VERSION=14.15.4

# Cached dependencies
FROM alpine:${ALPINE_VERSION} AS deps

RUN apk --no-cache add jq openssh openssl

COPY package.json .
COPY package-lock.json .

RUN (jq '{ dependencies, devDependencies, version }') < package.json > deps.json
RUN (jq '.version = "1.0.0"' | jq '.packages."".version = "1.0.0"') < package-lock.json > deps-lock.json

RUN mkdir /keys && \
  ssh-keygen -b 2048 -t rsa -m PEM -f /keys/jwt.key -q -N "" && \
  openssl rsa -in /keys/jwt.key -pubout -outform PEM -out /keys/jwt.key.pub 


# Generic image with all the source code, configs and test files. Also with all packages installed
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS generic

WORKDIR /usr/src

COPY --from=deps deps.json ./package.json
COPY --from=deps deps-lock.json ./package-lock.json

RUN npm ci

COPY tsconfig.json .
COPY tsconfig.build.json .
COPY test/ test/
COPY src/ src/

# Simple image that builds the entire project for production
FROM generic as builder
COPY --from=deps deps.json ./package.json

ENV NODE_ENV production
RUN ./node_modules/.bin/nest build

# Simple image to run all the tests in the application
FROM generic as testing

COPY package.json .
ENV NODE_ENV testing
CMD ["npm", "run", "test"]

# Production image with only the necessary files and directories to run the application.
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as production

WORKDIR /usr/src

RUN chown node:node /usr/src && \
  apk add --no-cache dumb-init

COPY --from=deps --chown=node:node /keys/ keys/
COPY --from=deps --chown=node:node deps.json ./package.json
COPY --from=deps --chown=node:node deps-lock.json ./package-lock.json
COPY --from=builder --chown=node:node /usr/src/dist/ dist/

RUN npm ci --only=production

USER node
CMD ["dumb-init", "node", "dist/main"]