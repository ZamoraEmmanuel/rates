# _Challenge_
## Rates Backend
_Small app that allows a user to see a table of rates and create new ones by
obtaining FX rates from an API. The creation allow the addition of a fee over
the obtained FX rate_

## Features

- To create rates by obtaining FX rates from a given provider.
- To add a mark-up fee over the obtained FX rate
- To retrieve a list of these rates detailing:
  - Pair
  - Original rate
  - Fee %
  - Fee amount
  - Rate with mark-up fee applied

## Tech

- [Node.js](https://nodejs.org)
- [Hapi.js](https://hapi.dev)
- [MongoDB](https://www.mongodb.com)


# REST API

The REST API to the rates server is described below.

## Get list of Things

### Request

`GET /pair`

### Response
```json
{
    "pairs": [
        {
            "base": "EUR",
            "quote": "ARS",
            "rate": 113.5204,
            "feePercentage": 4,
            "feeAmount": 4.5408159999999995,
            "finalRate": 118.061216
        }
    ]
}
```
## Create

### Request

`POST /pair`

### Response
```json
{
    "_id": "60f317fce2f01d59e82e7b18",
    "base": "EUR",
    "quote": "BRL",
    "fee": 4,
    "__v": 0
}
```