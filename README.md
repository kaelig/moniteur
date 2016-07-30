# moniteur [![Build Status](https://travis-ci.org/kaelig/moniteur.svg)](https://travis-ci.org/kaelig/moniteur) [![NPM version](https://badge.fury.io/js/moniteur.svg)](http://badge.fury.io/js/moniteur)

For people who care about keeping an eye on their CSS and JavaScript file sizes.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**[Demo & Documentation](https://moniteur.herokuapp.com/)**

![ ](https://cdn.rawgit.com/kaelig/moniteur/8cc242f6fefa495a0b8746bca41f5980a76e80c7/docs/screenshot.png)

----

## CLI

Moniteur is also available as a command line interface:

```bash
npm install -g moniteur
```

### Usage:

```bash
Usage: moniteur [options] [command]


Commands:

  record   record a snapshot of all asset metrics
  serve    start the server to show metrics in the browser
  assets   display the list of assets loaded by moniteur
  help     display this helpful message

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

Configuration: edit the `.moniteurrc.yml` file in the current directory.

### Database configuration

For now, two types of storage are supported: Redis and local filesystem.

A Redis URL can be passed through an environment variable,
instead of having it stored in the configuration file:

```
DB__REDIS_URL=redis://rediscloud:XXXX@pub-redis-XXXX.us-east-X-X.X.ec2.garantiadata.com:13714
```

Run your application like this:
```
DB__REDIS_URL=redis://url moniteur [options]
```

Note that `REDIS_URL` and `REDISCLOUD_URL` are also valid environment variables.

### Development

Clone the repository and run:

```bash
npm run dev
```

## Asset monitor API

### Record data

Takes a snapshot of asset metrics and stores them in the `.moniteur/`
directory.

```bash
moniteur record
```


## HTTP API

### View a JSON representation of all loaded assets

`/assets.json`

#### JSON data object for HighCharts (providing the asset name's hash)

Since forever:
`/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6`

Between two dates:
`/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475`


## License

MIT

Acknowledgments: "merci" to https://github.com/t32k/stylestats, which has been
a great source of inspiration.

## Roadmap

- [x] Make moniteur a working node module
- [x] Run as some sort of daemon that monitors asset metrics every X seconds
- [x] Monitor JavaScript files
- [ ] Unit / Integration tests
- [ ] Option to filter graphs by time range (last 7 days, last 30 days, last year)
- [ ] Slack Bot

### Ideas

- [ ] Providing a page's URL, scrape all assets out of it and analyse them
- [ ] Parse all assets in a particular directory
- [ ] Asset size budget limits
- [ ] Email alert when budget is almost reached or exceeded
- [ ] Weekly email recaps
