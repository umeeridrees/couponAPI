const express = require('express');
const router = express.Router();

const uuid = require('uuid/v4');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const client = new MongoClient(url);

client.connect(function (err) {
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    create(db, function () {
        //client.close();
    });
});

function create(db, callback) {
    db.createCollection("coupons", {
            "capped": false,
            "size": 100000,
            "max": 5000
        },
        function (err, results) {
            console.log("Collection created.");
            callback();
        }
    );
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
        let listUuid = [];
        while(number){
            let uid = uuid(1000+number);
            listUuid.push(uid);
            number--;
        }
        console.log(listUuid);
        const db = client.db(dbName);
        listUuid.forEach(element => {
            db.collection('coupons').insertOne({
                uuid: element
            }, function (err, r) {
                
            });
        });
        //client.close();
        res.status(200).send(JSON.stringify(listUuid));
    }
});

// endpoint to redeem coupon
// api/coupons/redeem/{code}
router.post('/redeem/:code', (req, res, next) => {
    const code = req.params.code;
    const db = client.db(dbName);

    //Checking for invalid code
    if (code < 1) {
        res.status(200).json({
            message: "invalid coupon."
        });
    } else {
        db.collection('coupons').findOne({
            uuid: code
        }, function (err, r) {
            if(r != null){
                db.collection('coupons').deleteOne({
                    uuid: code
                }, function (err, r) {                    
                    console.log(r.deletedCount);
                    if(r.deletedCount > 0){
                        res.status(200).json({
                            message: "Redeemed"
                        }); 
                    }
                    else{
                        res.status(200).json({
                            message: "Error Redeeming"
                        }); 
                    }
                    console.log(err);
                });
            }
            else{
                res.status(200).json({
                    message: "Coupon not found..."
                });
            }
        });
    }
});

router.post('/find/:code', (req, res, next) => {
    const code = req.params.code;
    const db = client.db(dbName);
    
    //Checking for invalid code
    if (code < 1) {
        res.status(200).json({
            message: "invalid coupon."
        });
    } else {
        db.collection('coupons').findOne({
            uuid: code
        }, function (err, r) {
            console.log(r);
            if(r != null){
                res.status(200).json({
                    message: "found!!!"
                });        
            }else{
                res.status(200).json({
                    message: "notFound!!!"
                });
            }        
        });
    }
});

module.exports = router;