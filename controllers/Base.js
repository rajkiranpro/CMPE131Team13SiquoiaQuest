var _ = require("underscore"),
    View = require("../views/Base");
module.exports = {
	name: "base",
	extend: function(child) {
		return _.extend({}, this, child);
	},
	run: function (req, res, next) {
        
    },
    shoudlBeLoggedIn: function(req,res,content){
        if (req.session &&
            req.session.userid &&
            req.session.username) {
            return true;
        } else {
            res.redirect('/login');
            return false;
        }
    },
    shoudNotBeLoggedIn: function(req,res){
        if (req.session &&
            req.session.userid &&
            req.session.username) { 
            res.redirect('/');
            return false;
        } else {
            return true;
        }
    }
}