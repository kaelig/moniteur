Add a data point: `node lib/index.js --config ../test/fixtures/test-config.json`

Read data points: `node lib/read.js --config ../test/fixtures/test-config.json`

Should log objects of average data readings and timeseries of readings:

```json
{
    "test/fixtures/main.css": {
        "size": 80,
        "gzippedSize": 89,
        "rules": 3,
        "selectors": 3
    },
    "test/fixtures/main2.css": {
        "size": 46979.6,
        "gzippedSize": 9362.8,
        "rules": 689.8,
        "selectors": 861
    }
}
{
    "test/fixtures/main.css": [
        {
            "name": "Size",
            "data": [
                [
                    1415640296075,
                    80
                ]
            ]
        },
        {
            "name": "Size (gzipped)",
            "data": [
                [
                    1415640296076,
                    89
                ]
            ]
        },
        {
            "name": "Rules",
            "data": [
                [
                    1415640296076,
                    3
                ]
            ]
        },
        {
            "name": "Selectors",
            "data": [
                [
                    1415640296076,
                    3
                ]
            ]
        }
    ],
    "test/fixtures/main2.css": [
        {
            "name": "Size",
            "data": [
                [
                    1415640296143,
                    58719
                ]
            ]
        },
        {
            "name": "Size (gzipped)",
            "data": [
                [
                    1415640296143,
                    11693
                ]
            ]
        },
        {
            "name": "Rules",
            "data": [
                [
                    1415640296143,
                    862
                ]
            ]
        },
        {
            "name": "Selectors",
            "data": [
                [
                    1415640296143,
                    1076
                ]
            ]
        }
    ]
}
```

### HTTP API:

`npm start`

#### Average readings for a stylesheet (providing the asset name's hash)

http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6

`{ "size": 58719, "gzippedSize": 11693, "rules": 862, "selectors": 1076 }`

#### Average between two dates

http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475
