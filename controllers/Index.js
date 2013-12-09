var BaseController = require("./Base"),
    View = require("../views/Base"),
    userModel = new(require("../models/UserModel"));

module.exports = BaseController.extend({
    name: "Index",
    content: null,
    run: function (req, res, next) {
        var self = this;
        var v = new View(res, 'index');
        this.content = {};
        if (req.session &&
            req.session.userid &&
            req.session.username) {
            self.content.userName = " " + req.session.username + " ";
            self.content.userLogin = "logout";
            self.content.userLoginText = "Log Out";
        } else {
            self.content.userName = "";
            self.content.userLogin = "login";
            self.content.userLoginText = "Log In / Register";
        }
        userModel.setDB(req.db);
        userModel.setCollection('users');
        userModel.leaderboard(function (err, doc) {
            console.log(doc);
            self.content.userData = require('util').format('%j', doc);
            console.log(self.content);
            v.render(self.content);
        });

    },
    profile: function (req, res, next) {
        var self = this;
        this.content = {};
        if (!BaseController.shoudlBeLoggedIn(req, res)) {
            return;
        }
        self.content.userName = " " + req.session.username + " ";
        self.content.userLogin = "logout";
        self.content.userLoginText = "Log Out";
        userModel.setDB(req.db);
        userModel.setCollection('users');
        userModel.findUser(req.session.userid, function (err, doc) {
            self.content.gamesplayed = doc.gamesplayed;
            self.content.correctanswers = doc.correctanswers;
            self.content.points = doc.points;
            self.content.packets = doc.ownedpackets.length;
            var v = new View(res, 'profile');
            v.render(self.content);
        });
    }
});