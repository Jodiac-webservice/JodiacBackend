const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true,
    },
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                require: true,
            },
            quantity:{
                type:Number,
                default:1,
            },
            color:{
                type:String,
            },
            size:{
                type:String,
            },
            Weight:{
                type:String,
            }
        },
    ],
},{timestamps: true,
})

const Cart = mongoose.model('Cart',CartSchema);
module.exports = Cart