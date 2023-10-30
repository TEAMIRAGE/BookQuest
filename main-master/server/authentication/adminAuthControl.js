// Importing packages
const jwt = require('jsonwebtoken');
const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

// Database Directory import/linking
const admin_auth = require('../schemas/admin_auth.js');

//Setting up env file variables
dotenv.config({path: 'config.env'});
const secretJwtKey = process.env.SECRET_JWT_KEY;
const gcpProId = process.env.GCP_PROID;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const gcpJsonKey = process.env.GCP_JSON_KEY;


// handle errors function
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
// Admin Signup
module.exports.admin_signup_post = async (req,res)=>{
   

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

     
    const newUserDetailDataToLoad = new admin_auth({
      name : req.body.name,
      email : req.body.email,
      username : req.body.username,
      password: req.body.password,
      image_bucket_name : gcBucketFileName,
      
  });
const newUser = await newUserDetailDataToLoad.save();
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


// Admin Login
module.exports.admin_login_post =  async (req,res)=>{
   const {username , password} = req.body;
   try{
 
    //initially token delete 
    res.cookie('jwt', '', { maxAge:1 });
    

  const newUser = await admin_auth.login(username, password);   // so .login is basically a function created by me along with schema program, we can directly use this function for comparison
  const token = createToken(newUser._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
   res.status(200).json({ newUser: newUser._id});
  
}catch (err) {
    console.log("What error is : "+err);
    const errors = handleErrors(err);
   res.status(400).json({ errors });
  }
}

