// Importing packages
const jwt = require('jsonwebtoken');
const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

// Database Directory import/linking
const student_auth = require('../schemas/student_auth.js');
const request_details_student_register = require('../schemas/request_details_student_register.js');

//Setting up env file variables
dotenv.config({path: 'config.env'});
const secretJwtKey = process.env.SECRET_JWT_KEY;
const gcpProId = process.env.GCP_PROID;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const gcpJsonKey = process.env.GCP_JSON_KEY;

// handle errors
const handleErrors = (err) =>{
    console.log(err.message, err.code);
    let errors = {username: '', password: ''};



  //incorrect username
  if(err.message === 'incorrect username'){
    errors.username = 'Username is not registered';
  }

   //incorrect password
  if(err.message === 'incorrect password'){
    errors.password = 'Password is incorrect';
  }

  if(err.message === 'Decision Pending'){
    errors.username = 'Account active request:-Pending!';
  }


   //duplicate error code
   if (err.code === 11000){
    errors.username  = "Username is already registered";
    return errors;
   }


    //validation errors
    if(err.message.includes('userDetails validation failed')){
        Object.values(err.errors).forEach(({properties}) =>{
           errors[properties.path] = properties.message;
        });
    }
    
    return errors;
}

// Tokens
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) =>{
    return jwt.sign({ id } , secretJwtKey, {
        expiresIn: maxAge
    });
}

//Setting up GCP Bucket
const storage = new Storage({
  projectId: gcpProId,
  keyFilename: gcpJsonKey,
});
const bucket = storage.bucket(gcpBucketName);




//// API
// Student Signup
module.exports.student_signup_post = async (req,res)=>{
   

    try{
        
      if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
      }

      if (!req.file) {
        const error = new Error('Please choose files');
        error.httpStatusCode = 400;
        return next(error);
      }



      const gcBucketFileName = Date.now() + '_' + req.file.originalname;
      const gcBucketFile = bucket.file(gcBucketFileName);
      const stream = gcBucketFile.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on('error', (err) => {
    console.error(err);
    res.status(500).send('Error uploading file.');
  });

  stream.on('finish', async () => {

     
    const newUserDetailDataToLoad = new student_auth({
      name : req.body.name,
      roll_no: req.body.rollNo,
      email : req.body.email,
      year: req.body.year,
      branch: req.body.branch,
      username : req.body.username,
      password: req.body.password,
      image_bucket_name : gcBucketFileName,
      
      book_limit_counter: 0,    // Only be able to request books if book_limit_counter < 5
      decision: 0
  });
const newUser = await newUserDetailDataToLoad.save();
const newRequestBookToLoad = new request_details_student_register({
  student_auth_id: newUser._id,
});
const newRequest = await newRequestBookToLoad.save();
 const token = createToken(newUser._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
      res.status(201).json({newUser: newUser._id});
});

    stream.end(req.file.buffer);





    }catch(err){
      const errors =  handleErrors(err);
        res.status(400).json({ errors });
    }
    
}


// Student Login
module.exports.student_login_post = async (req,res)=>{
   const {username, password} = req.body;
   try{

 //initially token delete 
 res.cookie('jwt', '', { maxAge:1 });

  const newUser = await student_auth.login(username, password);   // so .login is basically a function created by me along with schema program, we can directly use this function for comparison
  const token = createToken(newUser._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
   res.status(200).json({ newUser: newUser._id});
  

  }catch (err) {
    console.log("What error is : "+err);
    const errors = handleErrors(err);
   res.status(400).json({ errors });
  }
}

