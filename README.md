# moniteur [![Build Status](https://travis-ci.org/kaelig/moniteur.svg)](https://travis-ci.org/kaelig/moniteur)

Monitor your asset size over time, in your browser,
or using the provided HTTP API.

[View a demo](https://moniteur.herokuapp.com/) running every hour on Heroku.

This is my first Node app, I know it is messy and it still lacks tests.

More features to come: [see roadmap](#roadmap).

![ ](https://github.com/kaelig/moniteur/blob/master/docs/screenshot.png)

### Installation

```bash
npm install -g moniteur
```

### Usage:

```bash
Usage: moniteur [options] [command]

Commands:

  record   grab a snapshot of all asset metrics
  serve    see assets sensor graphs in the browser

Options:

  -h, --help           output usage information
  -V, --version        output the version number
  -c, --config [path]  specify a configuration file
```

Create a `moniteur.json` file in the directory where asset sizes
should be stored (typically: the root directory of your project):

```json
{
  "assets": {
    "stylesheets": {
      "My main CSS": "public/stylesheets/main.css",
      "My bundle of CSS files": [
        "core.css",
        "head.css",
        "index.css",
        "global.css"
      ],
      "Remote stylesheet": "http://path/to/styles.css"
    }
  }
}
```

Note: `moniteur` will load `moniteur.json` file in your home directory
or the current directory.


### Database configuration

Moniteur relies on the `NODE_ENV` environment variable to select a database:

```json
{
  "assets": {
    // Stylesheets, scripts…
  },
  "db": {
    "development": {
      "engine": "filesystem",
      "directory": ".moniteur"
    },
    "production": {
      "engine": "redis",
      "url": "redis://localhost:6379"
    }
  }
}
```

For now, two types of storage are supported: Redis and local filesystem.

#### Confidential Redis URL

A confidential Redis URL can be passed through an environment variable,
instead of having it stored in the configuration file:

```
DB_URL=redis://rediscloud:XXXX@pub-redis-XXXX.us-east-X-X.X.ec2.garantiadata.com:13714
```

Run your application like this:
```
DB_URL=redis://url moniteur [options]
```

### Development

Clone the repository and run:

```bash
npm run dev
```

## Asset monitor API

#### Record data

Takes a snapshot of asset metrics and stores them in the `.moniteur/`
directory.

```bash
moniteur record --config ../test/fixtures/test-config.json
```


### HTTP API

#### View current configuration

`/config`

#### JSON data object for HighCharts (providing the asset name's hash)

Since forever:
`/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6`

Between two dates:
`/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475`


## License

MIT

## Roadmap

- [x] Make moniteur a working node module
- [x] Run as some sort of daemon that monitors asset metrics every X seconds
- [ ] `moniteur init`, a moniteur.json configuration file generator, with
  interactive menus
- [ ] Asset size budget limits
- [ ] Monitor JavaScript files
- [ ] Email alert when budget is almost reached or exceeded
- [ ] Weekly email recaps
- [ ] Unit / Integration tests
- [ ] Deployment script
- [ ] Providing a page's URL, scrape all assets out of it
  and analyse them
- [ ] Option to filter graphs by time ranges
  (last 7 days, last 30 days, last year)
- [ ] UA switch to fetch remote assets for mobile/tablet/desktop
