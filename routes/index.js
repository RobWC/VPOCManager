
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.tester = function(req, res){
  res.render('index', { title: 'TESTER' })
};

exports.userreg = function(req, res){
  res.render('cuser')
};