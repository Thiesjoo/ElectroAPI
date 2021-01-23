# ElectroAPI

## TODO

- Added basic infrastructure to connect account with OAUTH Apps

## Description

ElectroAPI is currently WIP

## Infrastructure

Signup with email and password

Several providers:

- If unauthed: prompt to create new account
- If authed: bind provider to user

Add a route to transfer providers between accounts.

## Configuration

Main config is in a YAML file called `.env.yml` and additional configuration is in the env variables.

### ENV

- LOG_LEVEL = Log level of the entire application
- CONFIG_PATH - The path of your `.env.yml`
- npm_package_version = Automatically set by NPM. Used to detect version of application

## Installation

```bash
$ npm install

# To inspect the documention of the entire app
$ npm run gendocs
# And browse to http://localhost:8080
```

## Running the app

```bash
# development
$ npm run start

# production mode
$ npm run start:prod
```

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
