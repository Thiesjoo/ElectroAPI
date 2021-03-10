# ElectroAPI

## Description

ElectroAPI MVP:
- Socket service to ingest events
  - Events: Small bits of information
    - Discord message
    - Realtime data update (Site uptime, PC uptime, CPU Usage, RAM Usage, bot status)
    - Twitch (Chat pings, user goes live)
  - Must be extendable. MVP Has clients for all of the above, but must be easy to generate new points
- Api to query these by:
  - Date
  - Name (Of service)
  - Message

## Infrastructure

[AUTH](docs/auth.md)
Users will be able to register new client applications use client id and key. This is so users can develop their own apps

## Configuration

Main config is in a YAML file called `env.yml` and additional configuration is in the env variables.

### ENV

- LOG_LEVEL = Log level of the entire application. Defaults to `verbose`
- CONFIG_PATH - The path of your `env.yml`. Defaults to `env.yml`

## Installation

```bash
# For local development
$ npm install

# To inspect the documention of the entire app
$ npm run gendocs
# And browse to http://localhost:8080
```

## Running the app

```bash
# development
$ npm run start
```

To create a production docker image run `npm run docker:start:prod`.
This will create, tag and run an optimzed docker version

To make it easier to configure you can also use [docker-compose](https://docs.docker.com/compose/) to auto start the application. Just run `docker-compose up --build` to get a complete production image running, which auto builds from current directory. (And hosts a simple mongodb database)

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

ElectroAPI is [MIT licensed](LICENSE).
