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

  record   undefined
  serve    undefined

Options:

  -h, --help           output usage information
  -V, --version        output the version number
  -c, --config [path]  specify a configuration file
  -e, --engine [type]  Specify database engine [filesystem, redis]
```

Create a `.moniteur.json` file where you'd like to monitor asset sizes:
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

Note: `moniteur` will load `.moniteur.json` file in your home directory
or the current directory.


### Development

The node module is still at a very early stage and probably
won't run for now, sorry, but you can still clone the project.

Clone the repository and run:

```bash
npm run dev
```

### Start

`npm start`

`open http://localhost:3000`

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

- Make moniteur a working node module
- Run as some sort of daemon that monitors asset metrics every X seconds
- Asset size budget limits
- Monitor JavaScript files
- Email alert when budget is almost reached or exceeded
- Weekly email recaps
- Tests!
- Deployment script
- (maybe?) providing a page's URL, scrape all assets out of it
  and analyse them
- Option to filter graphs by time ranges
  (last 7 days, last 30 days, last year)
- UA switch for remote assets
