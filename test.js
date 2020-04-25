var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

//var connection = mysql.createConnection({
//	host     : '34.82.117.115',
//	user     : 'root',
//	password : '',
//	database : 'nodelogin'
//});

var connection = mysql.createConnection ({
	socketPath : '/cloudsql/pair-269600:us-west1:pair-db',
	user     : 'root',
	password : '',
	database : 'nodelogin'
	//host: '34.82.117.115',
	//port: 3306
});

var sequelize = new Sequelize('nodelogin', 'root', '', {
    dialect: 'mysql'
});

const User = sequelize.define('User',{
    email: {
        type: Sequelize.STRING
    },
    displayName: {
        type: Sequelize.STRING
    },
    hashedPassword: {
        type: Sequelize.STRING
    }, 
    salt: {
        type: Sequelize.STRING
    }
});



//config.socketPath = '/cloudsql/pair-269600:us-west1:pair-db';
//let connection = mysql.createConnection(config);

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/signup', function(request, response) {
	response.sendFile(path.join(__dirname + '/signup.html'));
});

app.post('/createaccount', function(request,response){

}); 

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			//console.log(results);
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome to Pair, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

//app.listen(3000);