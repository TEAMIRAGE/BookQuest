const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
name :{
type:String,
required :true
},
author :{
    type :String, 
    required: true
},
description: {
    type :String
},
genre: {
    type: String
},
readCount :{
    type : Number,
    required: true
},
image_bucket_name: {
    type: String, 
    required: true
}, 

quantity: {
    type: Number, 
    required: true
},
availableCount: {
    type: Number,
    required: true
}

});



const book_details =  mongoose.model('book_details', newSchema);

module.exports = book_details;

