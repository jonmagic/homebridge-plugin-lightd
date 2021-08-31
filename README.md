# homebridge-plugin-lightd

A homebridge plugin I wrote to use my [lightd daemon](https://github.com/jonmagic/lightd) as a homebridge accessory.

The accessories config for homebridge looks like this:

```json
"accessories": [
    {
        "accessory": "LightdDimmer",
        "name": "Pergola Dimmer",
        "url": "http://lightd.local:8081",
        "device": "pergola"
    }
]
```
