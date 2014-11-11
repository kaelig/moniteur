Add a data point: `node lib/index.js --config ../test/fixtures/test-config.json`

Read data points: `node lib/read.js --config ../test/fixtures/test-config.json`

Should return an object of average data readings:

```json
{
    "test/fixtures/main.css": {
        "size": 80,
        "gzippedSize": 89,
        "rules": 3,
        "selectors": 3
    },
    "test/fixtures/main2.css": {
        "size": 58719,
        "gzippedSize": 11693,
        "rules": 862,
        "selectors": 1076
    }
}
```

### HTTP API:

`npm start`

#### Average readings for a stylesheet (providing the asset name's hash)

http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6

`{ "size": 58719, "gzippedSize": 11693, "rules": 862, "selectors": 1076 }`

#### Average between two dates

http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475
