var BaseController = require("./Base"),
    View = require("../views/Base"),

    userModel = new(require("../models/UserModel")),
    packetsModel = new(require("../models/PacketsModel"));
//  quizModel = new(require("../models/QuizModel"));

module.exports = BaseController.extend({
    name: "Packets Contoller",
    content: null,
    run: function (req, res, next) {
        if (req.session &&
            req.session.userid &&
            req.session.username) {
            res.redirect('/');
            return;
        } else {
            var v = new View(res, 'login');
            v.render(this.content);
        }
    },
    getPackets: function (req, res, next) {
        var self = this;
        this.content = {};
        if (!BaseController.shoudlBeLoggedIn(req, res)) {
            return;
        }
        userModel.setDB(req.db);
        userModel.setCollection('users');
        packetsModel.setDB(req.db);
        packetsModel.setCollection('packets');
        userModel.findUser(req.session.userid, function (err, userdoc) {
            packetsModel.findAllPackets(userdoc.ownedpackets, function (err, allpackets) {
                self.content.userName = " " + req.session.username + " ";
                self.content.userLogin = "logout";
                self.content.userLoginText = "Log Out";
                self.content.packetsData = require('util').format('%j', allpackets);
                var v = new View(res, 'buylist');
                v.render(self.content);
            });
        });
    },
    getUserPackets: function (req, res, next) {
        var self = this;
        this.content = {};
        if (!BaseController.shoudlBeLoggedIn(req, res)) {
            return;
        }
        userModel.setDB(req.db);
        userModel.setCollection('users');
        packetsModel.setDB(req.db);
        packetsModel.setCollection('packets');
        userModel.findUser(req.session.userid, function (err, userdoc) {
            packetsModel.findUserPackets(userdoc.ownedpackets, function (err, userpackets) {
                for (var i = 0; i < userpackets.length; i++) {
                    userpackets[i].played = (userdoc.playedpackets.indexOf(userpackets[i]._id) == -1) ? "No" : "Yes";
                }
                self.content.userName = " " + req.session.username + " ";
                self.content.userLogin = "logout";
                self.content.userLoginText = "Log Out";
                self.content.packetsData = require('util').format('%j', userpackets);
                var v = new View(res, 'purchasedlist');
                v.render(self.content);
            });
        });
    },

});