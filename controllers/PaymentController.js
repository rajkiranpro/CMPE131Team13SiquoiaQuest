var BaseController = require("./Base"),
    View = require("../views/Base"),
    userModel = new(require("../models/UserModel")),
    packetsModel = new(require("../models/PacketsModel"));

module.exports = BaseController.extend({
    name: "Payment Contoller",
    content: null,
    run: function (req, res, next) {
        var self = this;
        this.content = {};
        self.content.userName = " " + req.session.username + " ";
        self.content.userLogin = "logout";
        self.content.userLoginText = "Log Out";
        if (!BaseController.shoudlBeLoggedIn(req, res)) {
            return;
        }
        userModel.setDB(req.db);
        userModel.setCollection('users');
        packetsModel.setDB(req.db);
        packetsModel.setCollection('packets');
        userModel.findUser(req.session.userid, function (err, userdoc) {
            if (userdoc.ownedpackets.indexOf(req.params.id) != -1) {
                res.redirect('/play');
            } else {
                self.content.packetid = req.params.id;
                self.content.pointsBalance = userdoc.points;
                if (userdoc.points < 20) {
                    self.content.pointsErrorText = "Insufficient Balance";
                }
                packetsModel.findPacket(req.params.id, function (err, doc) {
                    self.content.packetName = doc.name;
                    var v = new View(res, 'pay');
                    v.render(self.content);
                });
            }
        });
    },
    pay: function (req, res, next) {
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
        packetsModel.setDB(req.db);
        packetsModel.setCollection('packets');
        userModel.findUser(req.session.userid, function (err, userdoc) {
            if (userdoc.ownedpackets.indexOf(req.body.packetid) != -1) {
                res.redirect('/play');
            } else {
                var mode = req.body.mode;
                if (mode == 'cc') {
                    userModel.buyPacket(req.session.userid, req.body.packetid, function (err, doc) {
                        res.redirect('/play');
                    });
                } else {
                    if (userdoc.points < 20) {
                        res.redirect('/play');
                    } else {
                        userModel.buyPacketWithPoints(req.session.userid, req.body.packetid, function (err, doc) {
                            res.redirect('/play');
                        });
                    }
                }
            }
        });
    }
});