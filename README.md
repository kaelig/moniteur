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
