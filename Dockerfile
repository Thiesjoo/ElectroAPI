ARG ALPINE_VERSION=3.12
ARG NODE_VERSION=14.15.4

##########################
# Cache-preserving image #
##########################

FROM alpine:${ALPINE_VERSION} AS deps

RUN apk --no-cache add jq

# prevent cache invalidation from changes in fields other than dependencies

COPY package.json .
COPY package-lock.json .

# override the current package version (arbitrarily set to 1.0.0) so it doesn't invalidate the build cache later

RUN (jq '{ dependencies, devDependencies }') < package.json > deps.json
RUN (jq '.version = "1.0.0"' | jq '.packages."".version = "1.0.0"') < package-lock.json > deps-lock.json

#################
# Builder image #
#################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder

WORKDIR /usr/src

COPY --from=deps deps.json ./package.json
COPY --from=deps deps-lock.json ./package-lock.json

RUN npm ci

COPY tsconfig.json .
COPY tsconfig.build.json .
COPY src/ src/
COPY test/ test/

COPY package.json .

ENV NODE_ENV production

RUN npm run build

#################
# Testing image #
#################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as testing

WORKDIR /usr/src

COPY --from=deps deps.json ./package.json
COPY --from=deps deps-lock.json ./package-lock.json

RUN npm ci

COPY package.json .

COPY tsconfig.json .
COPY tsconfig.build.json .
COPY test/ test/
COPY src/ src/

ENV NODE_ENV testing

CMD ["npm", "run", "test"]


# ####################
# # Production image #
# ####################

# FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as production

# WORKDIR /usr/src

# RUN chown node:node /usr/src && \
#     apk add --no-cache dumb-init

# COPY --chown=node:node .env.example .

# COPY --from=builder --chown=node:node /usr/src/dist/ dist/
# COPY --from=builder --chown=node:node /usr/src/package.json .

# ENV LOG_LEVEL warn
# ENV NODE_ENV production

# USER node

# CMD ["dumb-init", "node", "dist/server"]