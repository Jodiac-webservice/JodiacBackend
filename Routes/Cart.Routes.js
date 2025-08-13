const controller = require("../Controllers/cart.controller");
const {authJwt} = require("../Middlewares/index");

module.exports = function(app){
    app.use(function(req,res,next){
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });
    app.post("/api/Cart/addcart",[authJwt.verifyToken],controller.AddToCart);
    app.get('/api/cart',[authJwt.verifyToken],controller.getCart);
    app.delete('/api/Cart/remove',[authJwt.verifyToken],controller.RemoveFromCart)
}