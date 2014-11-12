## Asset monitor UI

### Development

`npm install -g nodemon`
`npm run-script dev`

### Start

`npm start`

## Asset monitor API

#### Add a data point

`node lib/index.js --config ../test/fixtures/test-config.json`

#### Read data points:

`node lib/read.js --config ../test/fixtures/test-config.json`

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

#### Time series  readings for a stylesheet (providing the asset name's hash)
<http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/average>

```json
[
    {
        "name": "Size",
        "data": [
            [
                1415640296143,
                58719
            ],
            [
                1415640302227,
                58719
            ],
            [
                1415641721382,
                58719
            ],
            [
                1415722633178,
                58719
            ],
            [
                1415722668469,
                22
            ]
        ]
    },
    {
        "name": "Size (gzipped)",
        "data": [
            [
                1415640296143,
                11693
            ],
            [
                1415640302227,
                11693
            ],
            [
                1415641721382,
                11693
            ],
            [
                1415722633179,
                11693
            ],
            [
                1415722668469,
                42
            ]
        ]
    },
    {
        "name": "Rules",
        "data": [
            [
                1415640296143,
                862
            ],
            [
                1415640302227,
                862
            ],
            [
                1415641721382,
                862
            ],
            [
                1415722633179,
                862
            ],
            [
                1415722668469,
                1
            ]
        ]
    },
    {
        "name": "Selectors",
        "data": [
            [
                1415640296143,
                1076
            ],
            [
                1415640302227,
                1076
            ],
            [
                1415641721382,
                1076
            ],
            [
                1415722633179,
                1076
            ],
            [
                1415722668469,
                1
            ]
        ]
    }
]
```

#### Average readings for a stylesheet (providing the asset name's hash)

<http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/average>

```json
{
    "size": 46979.6,
    "gzippedSize": 9362.8,
    "rules": 689.8,
    "selectors": 861
}
```
#### Average between two dates

<http://localhost:3000/metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475/average>
