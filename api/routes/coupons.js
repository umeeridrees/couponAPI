const express = require('express');
const router = express.Router();

const uuid = require('uuid/v4');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const client = new MongoClient(url);

client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    createCapped(db, function () {
        client.close();
    });
});

function createCapped(db, callback) {
    db.createCollection("myCollection", {
            "capped": true,
            "size": 100000,
            "max": 5000
        },
        function (err, results) {
            console.log("Collection created.");
            callback();
        }
    );

    db.collection('myCollections').insertOne({
        a: 1
    }, function (err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
    });
};



// endpoint to generate coupons
// api/coupons/generate/{number}
router.post('/generate/:number', (req, res, next) => {
    let number = req.params.number;

    //checking for invalid number of coupons
    if (number < 1) {
        res.status(200).json({
            message: "Provide valid number."
        });
    } else if (number > 500) {
        res.status(200).json({
            message: "maximum 500 coupon can be generated."
        });
    } else {
        let list = [];
        while(number){
            let uid = uuid(1000+number);
            list.push(uid);
            number--;
        }
        res.status(200).send(JSON.stringify(list));
    }
});

// endpoint to redeem coupon
// api/coupons/redeem/{code}
router.post('/redeem/:code', (req, res, next) => {
    const code = req.params.code;

    //Checking for invalid code
    if (code < 1) {
        res.status(200).json({
            message: "invalid coupon."
        });
    } else {
        res.status(200).json({
            message: "Redeeming your coupon..."
        });
    }
});

module.exports = router;