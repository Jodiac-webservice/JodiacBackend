const mongoose = require('mongoose');
const Product = mongoose.model(
    "product",
    new mongoose.Schema({
        name: {
            type: String,
        },
        description:{
            type: String,
        },
        price:{
            type:Number,
        },
        oldprice:{
            type:Number,
        },
        rating:{
            type: Number,
        },
        reviews: {
            type:Number,
        },
        discount:{
            type:Number,
        },
        images:{
            type:[String],
        },
        category:{
            type:String,
        },
        color:{
            type:[String],
        },
        size:{
            type:[String],
        },
        weight:{
            type:[String],
        }
    },{
        timestamps:true,
    })
);

module.exports = Product