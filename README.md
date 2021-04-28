# ElectroAPI

Preffered URL:

pr-1.electroapi.dev --> pr-1-electroapi.vercel.app
v1.0.0-electroapi.dev --> v1-0-0-electroapi.vercel.app

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

[AUTH](docs/authentication.md)
Users will be able to register new client applications use client id and key. This is so users can develop their own apps

## Configuration

Main config is in a YAML file called `env.yml`. It's automatically loaded from project root but can be loaded from different path (See ENV Variables).
`env.yml` can also be provided with ENV variables (Specify env variable `CONFIG` with the file as a string).

### env.yml

For configuration see: `sample.env.yml`

If you set `jwtPath` to `ENV` the JWT keys will be loaded from env (`PRIVKEY` for the private key and `PUBKEY` for the public one).
If you include `{{BASEURL}}` in any callback URL, it will be replaced with the env variable `VERCEL_URL`

### ENV Variables

- LOG_LEVEL = Log level of the entire application. Defaults to `verbose`
- CONFIG_PATH = The path of your `env.yml`. Defaults to `env.yml`
- CONFIG = The entire config file as a string (Overwrites the file)

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
