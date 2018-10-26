const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

//import created routes
const couponRoutes = require('./api/routes/coupons')

//for logging
app.use(morgan('dev'));

//for parsing url body
app.use(bodyParser.urlencoded({ extended: false }));

//for parsing body
app.use(bodyParser.json());

//for cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
                "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, PATCH")
        return res.status(200).json({});
    }
    next();
});

//url starting with /coupons is routed to couponRoutes
app.use('/coupons', couponRoutes);

//if no route found from previous
app.use((req, res, next) => {
    const error = new Error('Not Found.');
    error.status = 404;
    next(error);
});

//some other error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports = app;