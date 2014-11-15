## moniteur

Monitor your asset size over time, in your browser,
or using the provided HTTP API.

This is my first Node app, I know it is messy and it lacks tests.

More features to come: [see roadmap](#roadmap).

![ ](https://github.com/kaelig/moniteur/blob/master/docs/screenshot.png)

### Development

```bash
npm install moniteur
```

The node module is still at a very early stage and probably
won't run for now, sorry, but you can still clone the project.

Clone the repository and run these commands:

```bash
npm run dev
```

### Start

`npm start`

`open http://localhost:3000`

### Configuration

For now, only stylesheets are supported.

You can monitor separate local files, single assets or bundles of assets:

```json
{
  "assets": {
    "stylesheets": {
      "Main CSS": "test/fixtures/main.css",
      "Another CSS": "test/fixtures/main2.css",
      "FT desktop CSS bundle": [
        "http://s1.ft-static.com/m/style/90975546/bundles/core.css",
        "http://navigation.webservices.ft.com/v1/navigation/ft/css/style.min.css",
        "http://s1.ft-static.com/m/style/5c37627a/bundles/nonArticle.css"
      ],
      "Guardian's CSS": "http://assets.guim.co.uk/stylesheets/df893cb0c705c642348c474dbbd59f73/global.css"
    }
  }
}
```

## Asset monitor API

#### Add a data point

```bash
moniteur save --config ../test/fixtures/test-config.json
```

#### Read data points

```bash
moniteur read --config ../test/fixtures/test-config.json
```


### HTTP API

#### Read configuration

`/config`

#### JSON data object for HighCharts (providing the asset name's hash)

Since forever:
`/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6`

Between two dates:
`/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475`



## License

ISC

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
