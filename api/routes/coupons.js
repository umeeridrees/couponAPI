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

// endpoint to redeem coupon
// api/coupons/redeem/{code}
router.post('/redeem/:code', (req, res, next) => {
    const code = req.params.code;

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

// endpoint to generate coupons
// api/coupons/generate/{number}
router.post('/generate/:number', (req, res, next) => {
    let numberToBeGenerated = req.params.number;
    //checking for invalid number of coupons
    if (!Number.isInteger(numberToBeGenerated) && numberToBeGenerated < 1) {
        res.status(422).json({
            message: "Provide valid number."
        });
    } else {
        console.log("\n\n" + numberToBeGenerated + ' coupons request recieved.');

        let tasks = [];

        for (let i = 0; i < numberToBeGenerated; i++) {
            tasks.push(generateOneBatch);
        }
        console.log(tasks.length + " functions on stack.");
        num = tasks.length;
        executeSeries(tasks, function () {
            res.status(201).json({
                message: "All done."
            });
        })
    }
});

function executeSeries(tasks, callback) {
    execute(tasks.shift(), tasks.length, callback);

    function execute(task, num, callback) {
        if (task) {
            setTimeout(function () {
                executeSingle(task, num, function () {
                    return execute(tasks.shift(), --num, callback);
                });
            }, 0);
        } else {
            callback();
            console.log("Done");
        }
    }
}

function executeSingle(task, num, callback) {
    task(num);
    callback();
}

function generateOneBatch(i) {
    console.log(i);
}







module.exports = router;