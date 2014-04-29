var express = require('express');
var router = express.Router();
var config = require('../config/config');
var i = 1;
/* GET home page. */
router.get('/:username', function(req, res) {
	var model = {
		title: 'Express'
	};
	var username = req.params.username;
	model.username = username;
	res.render('index', model);
});

module.exports = router;
