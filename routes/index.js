/**
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { title: 'Live Draw' });
};

exports.users = function(req, res) {	
  res.render('index', { title: 'Live Draw', eventObj: eventObj });
};