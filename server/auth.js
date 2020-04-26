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
        //email: user.email,
        _id: user._id, 
    }, SECRET, {expiresIn: 60*60}); 
}

function sendUnauthorized(req, res){
    console.log(req.user);
    res.status(401).json({message: 'Unauthorized'});
};
    

const validateJwt = expjwt({
    secret: SECRET, 
    fail: sendUnauthorized,
    getToken(req){
        if (req.headers.authorization && req.headers.authorization.split(' ')[0]){
            return req.headers.authorization.split(' ')[1];
        }else if (req.query && req.query.access_token){
            return req.query.access_token;
        }
        return null;
    }
});

// check if user has been auth or not 
function isAuthenticated(){
    console.log('isAuthenticated is called');
    return compose()
        .use(validateJwt)
        .use((req,res,next) => {
            const {_id} = req.user;
            User.findById(_id, '-hashedPassword -salt', function(err, user){
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

