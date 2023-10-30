const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
student_auth_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student_auth'
}, 
book_request_status: {
    type: String,
},
message_count: {
    type: Number,
}

});



const student_notifications =  mongoose.model('student_notifications', newSchema);

module.exports = student_notifications;

