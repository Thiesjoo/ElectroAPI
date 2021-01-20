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

Main config is in a file called `env.yml` and additional configuration is in the env variables.
LOG_LEVEL and version (npm_package_version) are in env and for the rest: see this sample

```yaml
mongodb:
  host: db
  port: 27017 (optional)

providers:
  discord:
    clientID: '<discord client id>'
    clientSecret: '<discord client secret>'
    callbackURL: 'http://localhost:3000/auth/discord/callback'
app:
  port: 3000
  jwtPath: '/home/vscode/.app/'
  logLevel: 'verbose'
```

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
