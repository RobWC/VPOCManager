
/**
 * Module dependencies.
 */

var express = require('express');
var email = require('mailer');
var crypto = require('crypto');
var mongodb = require('mongodb');


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
	//grab user date from the post
	console.log(postData.username);
	var user = new User(postData.username,postData.email,postData.password,postData.passcon,postData.firstname,postData.lastname,postData.region,postData.position);
	
	var options = {
		response: res
	}	
	
	options.callback = function(result,response) {
		if (result) {
			console.log('success');
		} else {
			console.log('crap');
		};
		var passResult = user.hashPassword();
		console.log(result);
		console.log(user);
		if (passResult) {
				var options = {
					response: response	
				}
				var message = user.saveUser(options);
		} else {
			console.log('unable to save');
		};
	};
	
	
	user.validateEmail(options);
	
});

app.get('/ruser',function(req, res){
    res.render('ruser', { title: 'VPOC Password Recovery'});
});

app.get('/',function(req, res){
    res.render('login', { title: 'VPOC Portal Login'});
});


app.listen(3000);
var dbConn = new mongodb.Db('vpoc', new mongodb.Server('127.0.0.1',27017, {}), {native_parser: false});
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

function User(username,emailAddress,password,passcon,firstname,lastname,region,position) {
	this.username = username;
	this.emailAddress = emailAddress;
	this.password = password;
	this.passcon = passcon;
	this.firstname = firstname;
	this.lastname = lastname;
	this.region = region;
	this.position = position;
	this.salt = ((new Date().getTime() % 42) * new Date().getTime() * 414243).toString(16); 
	this.passHash = '';
	this.passHashType = 'sha1';
};

User.prototype = {
	constructor: User,
	validateEmail: function(options) {
		//check that the email domain is acceptable
		//connect to mongodb
		//grab all vpoc.accepteddomains with the domainType email
		//loop until a match is made
		//if match return true
		//if no match return false
			var emailDomain = this.emailAddress.split('@',2)[1];
			console.log(emailDomain);
		if (!!emailDomain) {
			dbConn.open(function(err,db) {
				if (err) {
					console.log('error' + err);
				};
				db.collection('accepteddomains', function(err,collection) {
					collection.findOne({domainType: 'email',domainName: emailDomain},function(err,doc) {
						console.log(doc);
						console.log(doc.domainName + ' ' + emailDomain);
						if (emailDomain == doc.domainName) {
							options.callback(true,options.response);
						} else { 
							options.callback(false,options.response);
						};
					});
				});
			});
		} else {
			console.log('Email Domain not found');
			return false;
		};
	},
	saveUser: function(options) {
		var self = this;
		console.log();
		dbConn.open(function(err,db) {
			db.collection('users', function(err,collection){
				collection.insert(self.toObject(),{safe: true}, function(err,records){
					if (err){
						console.log(err);
						if (err.code == 11000) {
							var errMessage = new ErrorMessage('Username or Email ' + err.key + ' already in use',11000,'error');
							errMessage.sendMessage(options.response);						
						};
					} else {
						if(!!records) {
							console.log('recordID ' + records[0]._id);
						} else {
							//some error occured
						};
					};					
				});
			});
		});
	},
	hashPassword: function(options) {
		if (this.password == this.passcon) {
			var shasum = crypto.createHash('sha1');
			shasum.update(this.salt + this.password);
			this.passHash = shasum.digest('hex');
			return true;
		} else {
			return false;
		};
	},
	toObject: function() {
		var doc = {
			username: this.username,
			emailAddress: this.emailAddress,
			password: this.password,
			passcon: this.passcon,
			firstname: this.firstname,
			lastname: this.lastname,
			region: this.region,
			position: this.position,
			salt: this.salt,
			passHash: this.passHash,
			passHashType: this.passHashType
		};
		return doc;
	}
};

function ErrorMessage (message,code,messageType){
	this.message = message;
	this.code = code;
	this.messageType = messageType;
};

ErrorMessage.prototype = {
	constructor: ErrorMessage,
	sendMessage: function(response){
		var self = this;		
		response.send(JSON.stringify(self.toObject()))
	},
	toObject: function() {
		var doc = {
			message: this.message,
			code: this.code,
			messageType: this.messageType 		
		};
		return doc;
	}	
}











