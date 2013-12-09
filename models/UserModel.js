var Model = require("./Base"),
    crypto = require("crypto"),
    model = new Model();
var UserModel = model.extend({
    findUser: function (username, callback) {
        this.collection().findOne({
            username: username
        }, callback);
    },
    buyPacket: function (username, packetId, callback) {
        this.collection().update({
            username: username
        }, {
            $addToSet: {
                ownedpackets: packetId
            }
        }, {}, callback);
    },
    buyPacketWithPoints: function (username, packetId, callback) {
        this.collection().update({
            username: username
        }, {
            $addToSet: {
                ownedpackets: packetId
            },
            $inc: {
                points: -20
            }
        }, {}, callback);
    },
    gamePlayed: function (username, points, packetid, firsttime) {
        if (firsttime) {
            this.collection().update({
                username: username
            }, {
                $addToSet: {
                    playedpackets: packetid
                },
                $inc: {
                    correctanswers: points,
                    points: points,
                    gamesplayed: 1
                }
            }, {}, function (error, result) {
                console.log('Game Played User Update');
                console.log(error);
                console.log(result);
            });
        } else {
            this.collection().update({
                username: username
            }, {
                $addToSet: {
                    playedpackets: packetid
                },
                $inc: {
                    correctanswers: points,
                    gamesplayed: 1
                }
            }, {}, function (error, result) {
                console.log('Game Played User Update');
                console.log(error);
                console.log(result);
            });
        }
    },
    createUser: function (username, password, name, email, callback) {
        var data = {
            _id: crypto.randomBytes(20).toString('hex'),
            username: username,
            name: name,
            email: email,
            password: password,
            ownedpackets: ['a0'],
            playedpackets: [],
            points: 0,
            gamesplayed: 0,
            correctanswers: 0
        };
        this.collection().insert(data, callback);
    },
    leaderboard: function (callback) {
        this.collection().find({}, {
            limit: 5,
            fields: {
                name: 1,
                gamesplayed: 1,
                correctanswers: 1,
                _id: 0
            },
            sort: [['gamesplayed', 'desc'], ['correctanswers', 'desc']]
        }).toArray(function (err, docs) {
            callback(err, docs);
        });
    }

});
module.exports = UserModel;