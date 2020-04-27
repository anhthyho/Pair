const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
const db = mongoose.createConnection(dbUri, dbOptions);

const User = require('./models/user')(db);

const multer = require('multer'); 


//find is SELECT in sql - query all users
const seed = () => {
    const users = [{
        email: 'alice@example.com',
        displayName: 'Alice',
        password: '123123',
        scores: {},
        ethnicity: 'Irish',
        location: 'San Francisco',
        age: '19',
        desc: 'Hi! My name is Alice and I like pickles',
        PP: 'https://as1.ftcdn.net/jpg/02/25/01/70/500_F_225017067_ixe71tout7ozDfN0Ljj0VZv3fqn2CwJl.jpg'
    }, {
        email: 'bob@example.com',
        displayName: 'Bob',
        password: '321321',
        scores: {},
        ethnicity: 'Caucasian',
        location: 'San Francisco',
        age: '21',
        desc: 'Hi! My name is Bob and I like to build stuff',
        PP: 'https://m.media-amazon.com/images/M/MV5BNjRlYjgwMWMtNDFmMy00OWQ0LWFhMTMtNWE3MTU4ZjQ3MjgyXkEyXkFqcGdeQXVyNzU1NzE3NTg@._V1_CR0,45,480,270_AL_UX477_CR0,0,477,268_AL_.jpg'
    },
    {
        email: 'daniel@example.com',
        displayName: 'Daniel',
        password: '123123',
        scores: {},
        ethnicity: 'Latino',
        location: 'Fremont',
        age: '25',
        desc: 'Hi! My name is Daniel and you should ask me about the time I punched a chicken.',
        PP: 'https://previews.123rf.com/images/dtiberio/dtiberio1802/dtiberio180200725/95195407-latino-boy-student-and-okay-sign.jpg'
    },
    {
        email: 'jennifer@example.com',
        displayName: 'Jennifer',
        password: '123123',
        scores: {},
        ethnicity: 'Asian',
        location: 'San Jose',
        age: '20',
        desc: 'Hi! My name is Jennifer and I study at SJSU',
        PP: 'https://thumbs.dreamstime.com/b/portrait-young-asian-woman-smiling-friendly-looking-camera-living-room-s-face-closeup-concept-lifestyle-winter-autumn-147861813.jpg'
    },];

    User.deleteMany({}).then(() => {
        User.create(users, (err, users_) => {
            console.log(`MONGODB SEED: ${users_.length} Users created.`);

            const [alice, bob, daniel, jennifer] = users_;
            bob.scores = {
                [jennifer._id]: 1,
            };
            jennifer.scores = {
                [daniel._id]: 1,
            };
            alice.scores = {
                [daniel._id]: 1,
            };

            alice.save();
            bob.save();
            jennifer.save();
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

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    session: false
},
    function (email, password, done) {
        User.findOne({ email }, function (err, user) {
            if (err) {
                console.error("Auth Error: " + err);
                return done(err);
            }
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
    if (header) {
        const splitHeader = header.split(' ');
        if (splitHeader.length !== 2 && splitHeader[0] !== 'Bearer') {
            next();
        }
        else {
            jwt.verify(splitHeader[1], SECRET, (err, { email }) => {
                if (err) {
                    next(err);
                }
                else {
                    User.findOne({ email }, (err, user) => {
                        req.user = user;
                        next();
                    });
                }
            });
        }
    } else {
        next();
    }
});
//----------------------IMAGES---------------------

const upload = multer({dest: __dirname + '/uploads/images'});

app.use(express.static('public'));

app.post('/upload', upload.single('photo'), (req, res) => {
    if(req.file) {
        res.json(req.file);
    }
    else throw 'error';
});


// ------------------------AUTH--------------------
app.post('/auth/login',
    passport.authenticate('local', { session: false }),
    (req, res) => {
        const access_token = auth.sign(req.user);
        res.json({ access_token });
    }
);

app.post('/auth/signup', (req, res) => {
    const user = req.body;

    //find a user with given email 
    //if there are none, create 
    //else send an error message
    console.log(user);

    User.find({ email: user.email }).then(users => {
        if (users.length === 0) {
            // create a new user 
            // send an auth token to user 
            User.create(user).then(user_ => {
                const access_token = auth.sign(user_);
                console.log(user.displayName + ': ' + access_token);
                res.json({ access_token });
            });
        } else {
            console.log('email is already in use');
            res.json({
                status: 'Error',
                message: 'Email is already in use',
            });
        }
    })

}
);
const isAuthenticated = auth.isAuthenticated(User);
// --------------------------------------------
// API TIMEEEEEE - basic routes
app.get('/', function (req, res) {
    User.find({}, (err, users) => {
        res.json(users);
    });
});

app.get('/protected', isAuthenticated, function (req, res) {
    res.send('Authenticated!');
});

// api: get, post, put, delete
//makes middleware

app.use('/api', require('./api')(db, isAuthenticated));

// --------------------------------------------

db.on('open', () => {
    seed();
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        'error': {
            message: err.message,
            error: err
        }
    });
    next();
});

//---- socket.io integration

let messages = [];


io.on('connection', (socket) => {
    //console.log('a user connected');
    
    socket.emit('getMsgs', messages);
    socket.on('chatMsg', msg =>{
        messages = [].concat(messages, msg);
        //console.log(sender, text);
        socket.broadcast.emit('newChatMsg', msg); 
    });

  });

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});