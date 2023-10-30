const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
    name :{
        type: String, 
        required : [true, "Please enter a name"]
    },
    roll_no:{
        type :String,
        required: true
    },

    email :{
        type : String, 
        required : [true, "Please enter a email"], 
         
        lowercase : true,
        validate: [isEmail, "Please enter a valid email"]
    },
    year: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required :true
    },
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String, 
        required: [true, 'Please enter a password'],
        minlength: [5, 'Minimum password length is 5 character']
    },
    image_bucket_name: {
        type: String, 
        required: true
    }, 
    
    book_limit_counter:{    // max 5 books at time in collections
        type: Number,
        required: true
    },
    decision: {
        type: Number,
        required: true,
        enum: [0,1]
    }


});

// Mongoose Hooks
newSchema.post('save', function (doc, next){
    console.log('new admin was created & saved', doc);
    next();
});

newSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
})

newSchema.statics.login = async function(username, password){

    const user = await this.findOne({username});
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
    if (auth) {
        const decision = user.decision;
        if(decision === 1){
        return user;
        }
        throw Error("Decision Pending")
    }
    throw Error("incorrect password"); 
    }
    throw Error('incorrect username');
}

const student_auth =  mongoose.model('student_auth', newSchema);

module.exports = student_auth;

