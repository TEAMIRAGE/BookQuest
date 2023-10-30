const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
student_auth_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student_auth'
}, 

});



const request_details_student_register =  mongoose.model('request_details_student_register', newSchema);

module.exports = request_details_student_register;

