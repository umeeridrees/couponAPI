const express = require('express');
const router = express.Router();
const uuid = require('uuid/v4');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const client = new MongoClient(url);
var db;

client.connect(function (err) {
    if (err == null) {
        console.log("Connected successfully to server");
        db = client.db(dbName);
        create(db, function () {});
    } else {
        console.log(err.message);
    }
});

function create(db, callback) {
    db.createCollection("coupons", {
            "capped": false,
            "size": 100000,
            "max": 5000
        },
        function (err, results) {
            if (err == null) {
                callback();
            } else {
                console.log(err.message);
            }
        }
    );
};

// endpoint to generate coupons
// api/coupons/generate/{number}
router.post('/generate/:number', (req, res, next) => {
    let number = req.params.number;

    //checking for invalid number of coupons
    if (number < 1) {
        res.status(422).json({
            message: "Provide valid number."
        });
    } else if (number > 500) {
        res.status(422).json({
            message: "maximum 500 coupon can be generated."
        });
    } else {
        let listUuid = [];
        while (number > 0) {
            let uid = uuid(1000 + number);
            listUuid.push({
                "uuid": uid,
                "status": 0
            });
            number--;
        }
        console.log(listUuid);
        db = client.db(dbName);

        db.collection('coupons').insertMany(listUuid, function (err, r) {
            if (err != null) {
                console.log(err.message);
            }
        });
        //client.close();
        res.status(201).send(JSON.stringify(listUuid));
    }
});

// endpoint to redeem coupon
// api/coupons/redeem/{code}
router.post('/redeem/:code', (req, res, next) => {
    const code = req.params.code;
    db = client.db(dbName);

    //Checking for invalid code
    if (code.length < 36) {
        res.status(422).json({
            message: "invalid coupon."
        });
    } else {
        db.collection('coupons').findOne({
            uuid: code
        }, function (err, r) {
            if (r != null && err == null) {
                if (r.status == 0) {
                    db.collection('coupons').updateOne({
                            uuid: code
                        }, {
                            $set: {
                                "status": 1
                            }
                        },
                        function (err, r) {
                            if (err == null) {
                                if (r.modifiedCount > 0) {
                                    res.status(200).json({
                                        message: "Redeemed"
                                    });
                                } else {
                                    res.status(500).json({
                                        message: "Error Redeeming"
                                    });
                                }
                            } else {
                                console.log(err);
                            }
                        });
                } else if (r.status == 1) {
                    res.status(422).json({
                        message: "Coupon already used."
                    });
                }
            } else {
                res.status(404).json({
                    message: "Coupon not found..."
                });
            }
        });
    }
});

router.post('/find/:code', (req, res, next) => {
    const code = req.params.code;
    db = client.db(dbName);

    //Checking for invalid code
    if (code.length < 36) {
        res.status(422).json({
            message: "invalid coupon."
        });
    } else {
        db.collection('coupons').findOne({
            uuid: code
        }, function (err, r) {
            console.log(r);
            if (r != null && err == null) {
                res.status(200).json({
                    message: "found!!!"
                });
            } else {
                res.status(404).json({
                    message: "notFound!!!"
                });
                console.log(err.message);
            }
        });
    }
});

module.exports = router;