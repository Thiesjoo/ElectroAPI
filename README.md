# ElectroAPI

## TODO

- Added basic infrastructure to connect account with OAUTH Apps
  - Refresh service
  - Provider response modeling
  -
- Added a basic ingest service to ingest data
- Add a basic API to query the stored data
- Add a basic socket gateway to get live updates
- Add github CI

## Description

ElectroAPI is currently WIP

## Infrastructure

Signup with email and password

Several providers:

- If unauthed: prompt to create new account
- If authed: bind provider to user

Add a route to transfer providers between accounts.

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
