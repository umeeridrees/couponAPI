const express = require('express');
const router = express.Router();

// endpoint to generate coupons
// api/coupons/generate/{number}
router.post('/generate/:number', (req, res, next) => {
    const number = req.params.number;

    //checking for invalid number of coupons
    if(number < 1){
        res.status(200).json({
            message: "Provide valid number."
        });
    } else if(number >500){
        res.status(200).json({
            message: "maximum 500 coupon can be generated."
        });
    } else {
        res.status(200).json({
            message: "generating coupons..."
        });
    }
});

// endpoint to redeem coupon
// api/coupons/redeem/{code}
router.post('/redeem/:code', (req, res, next) => {
    const code = req.params.code;
    
    //Checking for invalid code
    if(code < 1){
        res.status(200).json({
            message: "invalid coupon."
        });
    } else{
        res.status(200).json({
            message: "Redeeming your coupon..."
        });
    }
});

module.exports = router;