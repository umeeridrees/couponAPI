let uList = [];
    setTimeout(function(){
        for (let i = 0; i < count; i++) {
            let uid = uuid(1000 + count);
            uList.push({
                "uuid": uid,
                "status": 0
            });
        }
    }, 0);

    db.collection('coupons').insertMany(uList, function (err, r) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, "Coupons generated successfully");

        }
    });



    //          inside batch function


    //          in main

    for (let i = 1; i <= numberToBeGenerated / 1000; i++) {
        tasks.push(generateOneBatch(1000, function (err, result) {
            if (!err) {
                if(flag){
                    message = "result";
                }
            } else {
                message = "error";
                flag = false;
            }
        }));
        numberToBeGenerated -= 1000;
    }
    if (numberToBeGenerated > 0) {
        tasks.push(generateOneBatch(numberToBeGenerated, function (err, result) {
            if (!err) {
                if(flag){
                    message = result;
                }
            } else {
                flag = false;
                if(!flag){
                    message = "error";
                }
            }
        }));
        numberToBeGenerated -= numberToBeGenerated;
    }