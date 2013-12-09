var BaseController = require("./Base"),
    View = require("../views/Base"),
    model = new(require("../models/UserModel"));

module.exports = BaseController.extend({
    name: "Authentication",
    content: null,
    run: function (req, res, next) {
        if (!BaseController.shoudNotBeLoggedIn(req, res)) {
            return;
        } else {
            var v = new View(res, 'login');
            v.render(this.content);
        }
    },
    sigin: function (req, res, next) {
        var self = this;
        this.content = {};

        if (!BaseController.shoudNotBeLoggedIn(req, res)) {
            return;
        }

        self.content.loginpassword = req.body.loginpassword;
        self.content.loginusername = req.body.loginusername;
        model.setDB(req.db);
        model.setCollection('users');
        model.findUser(req.body.loginusername, function (err, doc) {
            if (doc) {
                if (doc.password == req.body.loginpassword) {
                    req.session.userid = doc.username;
                    req.session.username = doc.name;
                    res.redirect('/');
                } else {
                    self.content.errorText = "Invalid Password!"
                }
            } else {
                if (err) {
                    self.content.errorText = "Server Error! " + err;
                } else {
                    self.content.errorText = "No Such User!"
                }
            }
            var v = new View(res, 'login');
            v.render(self.content);
        });
    },
    register: function (req, res, next) {
        var self = this;
        this.content = {};
        if (!BaseController.shoudNotBeLoggedIn(req, res)) {
            return;
        }
        self.content.registerusername = req.body.registerusername;
        self.content.registeremail = req.body.registeremail;
        self.content.registerpassword = req.body.registerpassword;
        self.content.registername = req.body.registername;
        model.setDB(req.db);
        model.setCollection('users');
        model.findUser(req.body.registerusername, function (err, doc) {
            if (doc) {
                self.content.registerErrorText = "Username already exists";
                var v = new View(res, 'login');
                v.render(self.content);
            } else {

                model.createUser(req.body.registerusername, req.body.registerpassword, req.body.registername, req.body.registeremail, function (error, result) {

                    if (!error) {
                        req.session.userid = req.body.registerusername;
                        req.session.username = req.body.registername;
                        res.redirect('/play');
                        return;
                    } else {
                        self.content.registerErrorText = "Error While Registering User " + error;
                        var v = new View(res, 'login');
                        v.render(self.content);
                    }
                });
            }

        });
    },
    logout: function (req, res, next) {
        req.session.userid = null;
        req.session.username = null;
        res.redirect('/');
    }
});