const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(require('cors')());
const compose = require('composable-middleware');
// ------------------------------------------
const mongoose = require('mongoose');

const dbUri = 'mongodb://localhost/pair';
const dbOptions = {
    promiseLibrary: require('bluebird')
};
const db=mongoose.createConnection(dbUri, dbOptions);

const User = require('./models/user')(db);


//find is SELECT in sql - query all users
const seed = () => {
    User.find({}).remove().then(() => {
        const users = [{
            email: 'alice@example.com',
            displayName: 'Alice',
            password: '123123',
        }, {
            email: 'bob@example.com',
            displayName: 'Bob',
            password: '321321',
        }];
        User.create(users, (err, users_)=>{
            console.log(`MONGODB SEED: ${users_.length} Users created.`); 
        })
    })
};

// --------------------------------------------
//initialize web tokens 
const jwt = require('jsonwebtoken');
const expjwt = require('express-jwt');
const SECRET = 'pairs-dating-secret';
const auth = require('./auth.js');


// --------------------------------------------
// configure passport local to allow auth users 

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err,user);
    });
});

passport.use(new LocalStrategy({
    usernameField: 'email', 
    session: false
}, 
function(email, password, done) {
    User.findOne({email }, function (err, user) {
      if (err) { 
        console.error("Auth Error: " + err);  
        return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


//middleware collects requests and sends data forward for next request/request handler
app.use((req, res, next) => {
    const header = req.headers.authorization;
    
    // Authorization: Bearer [token]
    if (header){
        const splitHeader = header.split(' ');
        if (splitHeader.length !== 2 && splitHeader[0]!=='Bearer'){
            next();
        }
        else {
            jwt.verify(splitHeader[1], SECRET, (err, {email})=>{
                if (err){
                    next(err);
                }
                else {
                    User.findOne({email}, (err, user)=>{
                        req.user = user; 
                        next(); 
                    }); 
                }
            });
        }
    }else {
        next(); 
    }
});
// ------------------------AUTH--------------------
app.post('/auth/login', 
    passport.authenticate('local', {session: false}), 
    (req, res) => {
        const access_token = auth.sign(req.user);
        res.json({access_token});
    }
);
  
app.post('/auth/signup', 
    passport.authenticate('local', {session: false}), 
    (req, res) => {
        const access_token = auth.sign(req.user);
        res.json({access_token});
    }
);
const isAuthenticated = auth.isAuthenticated(User);
// --------------------------------------------
// API TIMEEEEEE - basic routes
app.get('/', function(req,res){
    User.find({}, (err, users) => {
         res.json(users);
    });
 });
 
 app.get('/protected', isAuthenticated, function(req,res){
     res.send('Authenticated!');
  });

// api: get, post, put, delete
//makes middleware

app.use('/api', require('./api')(isAuthenticated));

// --------------------------------------------

db.on('open', ()=>{
    seed(); 
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        'error': {
            message: err.message,
            error:err
        }
    });
    next(); 
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});