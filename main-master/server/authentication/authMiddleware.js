// Importing packages
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv');
const { Storage } = require('@google-cloud/storage');

// Database Directory import/linking
const student_auth = require('../schemas/student_auth.js');
const admin_auth = require('../schemas/admin_auth.js');
const student_notifications = require('../schemas/student_notifications.js');

//Setting up env file variables
dotenv.config({path: 'config.env'});
const secretJwtKey = process.env.SECRET_JWT_KEY;
const gcpProId = process.env.GCP_PROID;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const gcpJsonKey = process.env.GCP_JSON_KEY;


//Setting up GCP Bucket
const storage = new Storage({
  projectId: gcpProId,
  keyFilename: gcpJsonKey,
});
const bucket = storage.bucket(gcpBucketName);



// Require Auth for Student
const requireStudentAuth = (req, res, next) => {
try{
  const token = req.cookies.jwt;

  // Check if the token exists and is verified
  if (token) {
    jwt.verify(token, secretJwtKey, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login-options');
      } else {
        console.log('Student Token Value: ' + decodedToken);
        const user = await student_auth.findById(decodedToken.id);
        if (user) {
         
          const studentNotification = await student_notifications.find({student_auth_id:user._id});
           
           console.log("NOTIFICATION COUNT: ",studentNotification.length);
          const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
          };
          const [signedUrl] = await bucket.file(user.image_bucket_name).getSignedUrl(options);
          user.profileUrl = signedUrl;
          user.messageCount = studentNotification.length;


          res.locals.user = user;
          next();
        } else {
          res.redirect('/login-options');
        }
      }
    });
  } else {
    res.redirect('/login-options');
  }
} catch (err) {
  res.status(500).send({message: err.message || "Error Occured while retrieving Information"});
}
};


//Require Auth for Admin
const requireAdminAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // Check if the token exists and is verified
  if (token) {
    jwt.verify(token, secretJwtKey, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login-options');
      } else {
        console.log('Admin Token Value: ' + decodedToken);
        const admin = await admin_auth.findById(decodedToken.id);
        if (admin) {
      
          const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
          };
          const [signedUrl] = await bucket.file(admin.image_bucket_name).getSignedUrl(options);
          admin.profileUrl = signedUrl;


          res.locals.admin = admin;
          next();
        } else {
          res.redirect('/login-options');
        }
      }
    });
  } else {
    res.redirect('/login-options');
  }
};


// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log('Token value is: ' + token);
  if (token) {
    jwt.verify(token, secretJwtKey, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        res.locals.admin = null;
        next();
      } else {
        console.log('Decoded Token values: ' + decodedToken);
        const user = await student_auth.findById(decodedToken.id);
        if (user) {
          const studentNotification = await student_notifications.find({student_auth_id:user._id});
           if(studentNotification.length > 0){
           
           user.messageCount = studentNotification[0].message_count;
           }
          const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
          };
          const [signedUrl] = await bucket.file(user.image_bucket_name).getSignedUrl(options);
          user.profileUrl = signedUrl;
          
          
          res.locals.user = user;
          res.locals.admin = null;
        } else {
          const admin = await admin_auth.findById(decodedToken.id);
          if (admin) {
   
            const options = {
              version: 'v4',
              action: 'read',
              expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
            };
            const [signedUrl] = await bucket.file(admin.image_bucket_name).getSignedUrl(options);
            admin.profileUrl = signedUrl;
  

            res.locals.admin = admin;
            res.locals.user = null;
          }
        }
        next();
      }
    });
  } else {
    res.locals.user = null;
    res.locals.admin = null;
    next();
  }
};

module.exports = { requireStudentAuth, requireAdminAuth, checkUser };
