const Controllers = require("../Controllers/payment.Controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/payment/create-order",  Controllers.createOrder);
    app.post("/api/payment/verify-payment", Controllers.verifyPayment);
};
