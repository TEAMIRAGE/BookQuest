const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
 admin_id_manual: {
    type: String,
    unique: true
 },
 book_details_id :{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'book_details'
 },
 status:{
    type: Number,
    required :true,
    enum: [0, 1]
 }

});



const all_books =  mongoose.model('all_books', newSchema);

module.exports = all_books;

