/**
 * Module dependencies.
 */
var express = require('express');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var mongodb = require('mongodb');
var RedisStore = require('connect-redis')(express);

//setup mail settings
//FIX AUTH METHOD!
nodemailer.SMTP = {
  host: 'localhost',
  port: 2525,
  use_authentication: true,
  ssl: false,
  user: 'mailer',
  pass: 'bigcrapper',
  debug: true
};

//port to listen on
var port = 3000;

var app = module.exports = express.createServer();

// General Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "coffee is the new black",
    store: new RedisStore
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

//configure for dev
app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

//configure for production
app.configure('production', function() {
  app.use(express.errorHandler());
});

/*

 Handle HTTP GET requests

*/
//handle GET for /cuser page
app.get('/cuser', function(req, res) {
  res.render('cuser', {
    title: 'VPOC User Registration'
  });
});

//handle GET for /ruser page
app.get('/ruser', function(req, res) {
  res.render('ruser', {
    title: 'VPOC Password Recovery'
  });
});

//handle GET for /
app.get('/', function(req, res) {
  res.render('login', {
    title: 'VPOC Portal Login'
  });
});

app.get('/validate/:emailCode', function(req, res, next) {
  console.log(req.params.emailCode);
  //security check email code
  dbConn.open(function(err, db) {
    db.collection('users', function(err, collection) {
      collection.find({
        emailVerificationCode: req.params.emailCode,
        accountStatus: 'activate'
      }).toArray(function(err, results) {
        if (err) {
          console.log(err);
        } else {
          if (results.length == 1) {
            var userDocument = results[0];
            console.log(userDocument);
            //update document
            collection.update({
              _id: userDocument._id
            }, {
              $set: {
                accountStatus: "active"
              }
            }, function(err, count) {
              if (err) {
                //handle error
                console.log(err);
              } else {
                console.log(count);
                //return success message
                var retMessage = new ResponseMessage('User successfully activated', 200, 'success');
                res.render('validate', {
                  title: ' Validation',
                  resultMessage: retMessage.toObject().message
                });
              };
            });
          } else if (results.length > 1) {
            //weird two matching email codes, this should never happen
            console.log('Validation code collision');
          } else {
            //no results found throw an error
            var retMessage = new ResponseMessage('Invalid activation attempt', 200, 'success');
            res.render('validate', {
              title: ' Validation',
              resultMessage: retMessage.toObject().message
            });
          };
        }
      });
    });
  });
/*
        collection.insert(self.toObject(), { safe: true }, function (err, records) {
          if (err) {
            console.log(err);
            if (err.code == 11000) {
              var errMessage = new ResponseMessage('Username or Email ' + err.key + ' already in use', 11000, 'error');
              errMessage.sendMessage(options.response);
            };
          } else {
            if ( !! records) {
              console.log('recordID ' + records[0]._id);
            } else {
              //some error occured
            };
          };
        });
      });*/
  //grab the email code
  //search the db for the code
  //if matched then activate account and give a positive back
  //if not matched then return error not found
});

/*

 Handle HTTP POST requests

*/
//handle user creation post
app.post('/ruser', function(req, res) {
  var postData = req.body;
  var emailAddress = postData.email;

  var options = {
    response: res,
    callback: function(self, res) {
      console.log('user load test ' + self.username);
      var options = {
        response: res,
        callback: function(result, response) {
          if (result == true) {
            var message = new ResponseMessage('Recovery message sent', 200, 'success');
            message.sendMessage(response);
          } else if (result == false) {
            var message = new ResponseMessage('Recovery message failed to send', 500, 'fail');
            message.sendMessage(response);
          };
        }
      };
      var newMail = new Messager('recovery', self.emailAddress, self.firstname, self.emailVerificationCode);
      newMail.constructMessage();
      newMail.sendMessage();
      console.log(newMail);
    }
  };
  var user = new User('', emailAddress, '', '', '', '', '', '', '', '');
  user.refreshUser('email', options);
  //pull user data from mongodb based on email address
  //set user state to pending-activation
  //send recovery email
});

app.post('/cuser', function(req, res) {
  var postData = req.body;
  //grab data
  //validate that passwords match
  //validate that email is correct and meets rules
  //create user account in Mongo
  //send validation email
  //create user in AD post validation email
  //grab user date from the post
  var user = new User(postData.username, postData.email, postData.password, postData.passcon, postData.firstname, postData.lastname, postData.region, postData.position);

  var options = {
    response: res
  };

  options.callback = function(result, response) {
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
      //send email to user
    } else {
      console.log('unable to save');
      var errMessage = new ResponseMessage('Unable to create user, contact support', 500, 'error');
      errMessage.sendMessage(options.response);
    };
  };
  user.validateEmail(options);
});

app.listen(port);
var dbConn = new mongodb.Db('vpoc', new mongodb.Server('127.0.0.1', 27017, {}), {
  native_parser: false
});
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//helper classes here https://github.com/Marak/node_mailer

function Messager(mailType, mailTo, humanName, emailCode) {
  //mail types - recover, registration
  this.mailType = mailType; //register, recover
  this.mailTo = mailTo;
  this.humanName = humanName;
  this.emailCode = emailCode;
  this.mailFrom = 'useradmin@virtualpoc.net';
  this.subject = '';
  this.body = '';
  this.domain = 'virtualpoc.net';
};

Messager.prototype = {
  constructor: Messager,
  constructMessage: function() {
    //fill in template based on type
    var self = this;
    if (this.mailType == 'register') {
      this.subject = 'Welcome to the VirtualPOC!';
      this.body = 'Dear ' + self.humanName + 'Thank you for registering to use the VirtualPOC at Juniper Networks. Please click on the link below to complete the activation of your account. Once activated you will be able to access the VPOC and begin using the tool. Activation Link: http://www.virtualpoc.net/validate/' + self.emailCode + ' If you have any questions please contact us a vpoc-support@juniper.net';
    } else if (this.mailType == 'recover') {
      //text for recovery
      this.subject = 'Welcome to the VirtualPOC!';
      this.body = 'Dear ' + self.humanName + 'Please click on the link below to complete the activation of your account. Once activated you will be able to access the VPOC and begin using the tool. Activation Link: http://www.virtualpoc.net/ruser/validate/' + self.emailCode + ' If you have any questions please contact us a vpoc-support@juniper.net';
    }
  },
  sendMessage: function() {
    var self = this;
    //send message
    nodemailer.send_mail({
      sender: self.mailFrom,
      to: self.mailTo,
      subject: self.subject,
      body: self.body
    }, function(error, success) {
      console.log('Message ' + success ? 'sent' : 'failed');
    });
  },
  resetMessage: function() {
    //delete all properties
    this.type = '';
    this.mailTo = '';
    this.mailFrom;
  },
  previewMessage: function() {}
}

function User(username, emailAddress, password, passcon, firstname, lastname, region, position, emailVerificationCode, accountStatus) {
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
  this.emailVerificationCode = ((new Date().getTime() % 42) * new Date().getTime() * 7676).toString(24);
  this.accountStatus = 'pending-activation'; //activate, closed, active, suspended
};

User.prototype = {
  constructor: User,
  validateEmail: function(options) {
    var self = this;
    //check that the email domain is acceptable
    //connect to mongodb
    //grab all vpoc.accepteddomains with the domainType email
    //loop until a match is made
    //if match return true
    //if no match return false
    var emailDomain;
    if ( !! self.emailAddress) {
      var emailDomain = self.emailAddress.split('@', 2)[1]; //dont split this if
    } else {
      emailDomain = '';
    }
    console.log(emailDomain);
    if ( !! emailDomain) {
      dbConn.open(function(err, db) {
        if (err) {
          console.log('error' + err);
        };
        db.collection('accepteddomains', function(err, collection) {
          collection.findOne({
            domainType: 'email',
            domainName: emailDomain
          }, function(err, doc) {
            if (emailDomain == doc.domainName) {
              if ( !! options.callback) {
                options.callback(true, options.response);
              };
            } else {
              if ( !! options.callback) {
                options.callback(false, options.response);
              };
            };
          });
        });
      });
      return true;
    } else {
      console.log('Email Domain not found');
      return false;
    };
  },
  saveUser: function(options) {
    var self = this;
    console.log();
    dbConn.open(function(err, db) {
      db.collection('users', function(err, collection) {
        collection.insert(self.toObject(), {
          safe: true
        }, function(err, records) {
          if (err) {
            console.log(err);
            if (err.code == 11000) {
              var errMessage = new ResponseMessage('Username or Email ' + err.key + ' already in use', 11000, 'error');
              errMessage.sendMessage(options.response);
            };
          } else {
            if ( !! records) {
              //send validation email
              var newMail = new Messager('register', self.emailAddress, self.firstname, self.emailVerificationCode);
              newMail.constructMessage();
              newMail.sendMessage();
              console.log(newMail);
            } else {
              //some error occured
            };
          };
        });
      });
    });
  },
  generateEmailCode: function(options) {
    this.emailVerificationCode = ((new Date().getTime() % 42) * new Date().getTime() * 7676).toString(24);
    return true;
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
  refreshUser: function(method, options) {
    var self = this;
    //methods allowed, username, email
    if (method === 'email') {
      //lookup user by email
      dbConn.open(function(err, db) {
        if (err) {
          console.log('error ' + err);
        };
        db.collection('users', function(err, collection) {
          if (err) {
            console.log('error ' + err);
          };
          collection.findOne({
            emailAddress: self.emailAddress
          }, function(err, doc) {
            if (err) {
              console.log('error ' + err);
            }
            self.accountStatus = doc.accountStatus;
            self.emailAddress = doc.emailAddress;
            self.emailVerificationCode = doc.emailVerificationCode;
            self.firstname = doc.firstname;
            self.lastname = doc.lastname;
            self.passcon = doc.passcon;
            self.passHash = doc.passHash;
            self.passHashType = doc.passHashType;
            self.password = doc.password;
            self.position = doc.position;
            self.region = doc.region;
            self.salt = doc.salt;
            self.username = doc.username;
            if ( !! options.callback) {
              options.callback(self, options.response);
            };
          });
        });
      });
    } else if (method === 'username') {
      //lookup user by username
    } else {
      //fail
      console.log('This is not the method you are looking for!');

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
      passHashType: this.passHashType,
      emailVerificationCode: this.emailVerificationCode,
      accountStatus: this.accountStatus
    };
    return doc;
  }
};

function ResponseMessage(message, code, messageType) {
  this.message = message;
  this.code = code;
  this.messageType = messageType;
};

ResponseMessage.prototype = {
  constructor: ResponseMessage,
  sendMessage: function(response) {
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
};