
/**
 * Module dependencies.
 */

var express = require('express');
var email = require('mailer');
//  , routes = require('./routes')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.logger());
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