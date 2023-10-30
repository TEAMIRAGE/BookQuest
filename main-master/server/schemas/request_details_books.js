const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
student_auth_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student_auth'
}, 
book_details_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'book_details'
}

});



const request_details_books =  mongoose.model('request_details_books', newSchema);

module.exports = request_details_books;

