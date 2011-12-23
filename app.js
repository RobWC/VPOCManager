
/**
 * Module dependencies.
 */

var express = require('express');
var email = require('mailer');
var crypto = require('crypto');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  //app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/cuser',function(req, res){
    res.render('cuser', { title: 'VPOC User Registration'});
});

app.post('/cuser',function(req,res){
	var postData = req.body
	//grab data
	//validate that passwords match
	//validate that email is correct and meets rules
	//create user account in Mongo
	//send validation email
	//create user in AD post validation email
	var dateObj = new Date();
	
	var userData = {
			username = postData.username,
			password = postData.password,
			passcon = postData.passcon,
			firstname = postData.firstname,
			lastname = postData.lastname,
			region = postData.region,
			position = postData.position,
			salt = (dateObj.getTime() % 42) * dateObj.getTime(),
			passHash = '',
			passHashType = 'sha1'
	};
	
	if (userData.password == userData.passcon) {
		var shasum = crypto.createHash('sha1');
		shasum.update(userData.password);
		userData.passHash = shasum.digest('hex');
	};
	
	console.log(postData);
});

app.get('/ruser',function(req, res){
    res.render('ruser', { title: 'VPOC Password Recovery'});
});

app.get('/',function(req, res){
    res.render('login', { title: 'VPOC Portal Login'});
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//helper classes here https://github.com/Marak/node_mailer
function Messager(type,mailTo,mailFrom){
	//mail types - recover, registration
	this.type = type;
	this.mailTo = mailTo;
	this.mailFrom = mailFrom;
};

Messager.prototype = {
	constructor: Messager,
	constructMessage: function() {
		//fill in template
	},
	sendMessage: function() {
		//send message
	},
	resetMessage: function() {
		//delete all properties
		this.type = '';
		this.mailTo = '';
		this.mailFrom;		
	},
	previewMessage: function() {}
}