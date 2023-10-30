const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
student_auth_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student_auth'
}, 
admin_id_manual_list: {
    type: String,
}


});



const student_book_storage =  mongoose.model('student_book_storage', newSchema);

module.exports = student_book_storage;

