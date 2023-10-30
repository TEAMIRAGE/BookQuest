const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
student_auth_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student_auth'
}, 
admin_id_manual :{  //ref: 'all_books'
    type :String, 

},
book_details_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'book_details'
}

});



const logs_book_issue =  mongoose.model('logs_book_issue', newSchema);

module.exports = logs_book_issue;

