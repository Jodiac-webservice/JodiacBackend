const controller = require("../Controllers/Orders.Controllers");
const { authJwt } = require("../Middlewares/index");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/Orders/createOrders",
        [authJwt.verifyToken],
        controller.createOrder
    );

    // Endpoint to get a list of all orders for the authenticated user
    app.get(
        "/api/orders",
        [authJwt.verifyToken],
        controller.getAllOrders
    );

    // Endpoint to get the status of a specific order
    app.get(
        "/api/Orders/status/:orderId",
        [authJwt.verifyToken],
        controller.getOrderStatus
    );
};