const express = require('express');
const app = express();

const mongoose = require('mongoose');

const dbUri = 'mongodb://localhost/pair';
const dbOptions = {
    promiseLibrary: require('bluebird')
};
const db=mongoose.createConnection(dbUri, dbOptions);

const User = require('./models/user')(db);
// --------------------------------------------
//initialize web tokens 
const jwt = require('jsonwebtoken');
const expjwt = require('express-jwt');
const SECRET = 'pairs-dating-secret';
const compose = require('composable-middleware');


function sign(user){
    return jwt.sign({
        email: user.email,
        id: user._id, 
    }, SECRET, {expiresIn: 60*60}); 
}

const sendUnauthorized = (req, res) => {
    res.status(401).json({message: 'Unauthorized'});
}; 

const validateJwt = expjwt({
    secret: SECRET, 
    fail: sendUnauthorized
});

// check if user has been auth or not 
function isAuthenticated(){
    return compose()
        .use(function(req,res,next){
            validateJwt(req, res, next);
        })
        .use(function(req,res,next){
            const {email} = req.user;
            User.findOne({email}, '-hashedPassword -salt', function(err, user){
                if (err) return next(err);
                if (!user) return sendUnauthorized(req, res);
                req.user = user; 
                console.log('Successfully authenticated user by token: ', user.email )
                next(); 
            })
        })

};

module.exports={
    sign, sendUnauthorized, isAuthenticated
};

