//Package Imports
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const method_Override = require('method-override');
const cookieParser = require('cookie-parser');

//Directory Linking/import
const connectDB = require('./server/DBconnection/connection.js');
const router = require('./server/mainRoutes/router.js');
const { checkUser } = require('./server/authentication/authMiddleware.js');

//Setting up packages
const app = express();
app.use(method_Override('_method'));
app.use(morgan('tiny'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

//Setting up env variables
dotenv.config({path: 'config.env'});
const ip = process.env.IP;
const port = process.env.PORT;


//Setting up views
app.set("view engine", "ejs");

//Setting up path for resources
app.use('/css',express.static(path.resolve(__dirname, 'resources/css')));
app.use('/javascript',express.static(path.resolve(__dirname, 'resources/javascript')));
app.use('/images',express.static(path.resolve(__dirname, 'resources/images')));

//Database Connection
connectDB();

//Token Check on all routes
app.get('*', checkUser);

//Connecting Routes
app.use('/', router);

//Token Check on all routes
app.get('*', checkUser);

//Running app...
app.listen(port, ()=>{
    console.log(`Server is running on port ${ip}${port}`);
});


