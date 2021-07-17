const Hapi = require("@hapi/hapi");
const fetch = require("node-fetch");
const Joi = require("joi");
const Mongoose = require("mongoose");

const fixer_url = "http://data.fixer.io/api/latest?access_key=824e753b9d8f1bf170e5adf80e7788e9";

const server = new Hapi.server({"host":"localhost", "port":5000 });

Mongoose.connect("mongodb://localhost:27017/rates", { useNewUrlParser: true, useUnifiedTopology: true });

const PairModel = Mongoose.model("pair", {
    base: String,
    quote: String,
    fee: Number
});

/* 
    POST /pair

    Create new pair

    Payload: { 
        base: String Required,
        quote: String Required,
        fee: Number Required
    }

    Validations: 
    - base and quote currency exists on fixer fxrates response
    - pair doesn't exists on mongodb

*/
server.route({
    method: "POST",
    path: "/pair",
    options: {
        validate: {
            payload: Joi.object({
                base: Joi.string().required(),
                quote: Joi.string().required(),
                fee: Joi.number().required()
            })
        }
    },
    handler: async (request, h) => {
        let errors = [];
        let payload = { base: request.payload.base.toUpperCase(),
                        quote: request.payload.quote.toUpperCase(),
                        fee: request.payload.fee }
        let rates = await fetch(fixer_url)
                    .then(response => response.json())
                    .then(data => data.rates)
                    .catch(err => console.log(err));
        if (!rates[payload.base.toUpperCase()]){
            console.log("inexistent BASE currency");
            errors.push({field: "base", msg: "inexistent BASE currency: "+payload.base});
        }
        if (!rates[payload.quote.toUpperCase()]){
            console.log("inexistent QUOTE currency");
            errors.push({field: "quote", msg: "inexistent QUOTE currency: "+payload.quote});
        }
        if (errors.length > 0){
            return h.response({errors: errors}).code(400);
        }
        let storedPair = await PairModel.findOne({base: payload.base, quote: payload.quote});
        if (storedPair){
            console.log(storedPair);
            errors.push({field: "pair", msg: "Existent pair: "+payload.base+payload.quote});
        }
        if (errors.length > 0){
            return h.response({errors: errors}).code(400);
        }
        try {
            let pair = new PairModel(payload);
            let result = await pair.save();
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
})

/* 
    GET /pair

    return all pairs on db

    Response: { 
        base: String,
        quote: String,
        rate: Number,
        feePercentage: Number,
        feeAmount: Number,
        finalRate: Number
    }

*/
server.route({
    method: "GET",
    path: "/pair",
    handler: async (request, h) => {
        let rates = await fetch(fixer_url)
                    .then(response => response.json())
                    .then(data => data.rates)
                    .catch(err => console.log(err));
        try {
            let response = await PairModel.find().then( pairs => {
                return pairs.map(pair => {
                    let pairRate = rates[pair.quote] / rates[pair.base];
                    let fee = pairRate * pair.fee / 100;
                    return {
                        'base': pair.base, 
                        'quote': pair.quote, 
                        'rate': pairRate,
                        'feePercentage': pair.fee,
                        'feeAmount': fee,
                        'finalRate' : pairRate + fee
                    }
                })
            });
            return h.response({pairs: response});
        } catch(error) {
            return h.response(error).code(500);
        }
    }
})

server.start();