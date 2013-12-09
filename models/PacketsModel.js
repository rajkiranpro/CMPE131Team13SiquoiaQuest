var Model = require("./Base"),
    model = new Model();

var PacketsModel = model.extend({
    findPacket: function (packetid, callback) {
        this.collection().findOne({
            _id: packetid
        }, callback);
    },
    findUserPackets: function (packetList, callback) {
        this.collection().find({
            _id: {
                $in: packetList
            }
        }).toArray(function (err, obj) {
            callback(err, obj);
        });
    },
    findAllPackets: function (packetList, callback) {
        this.collection().find({
            _id: {
                $nin: packetList
            },
            free: false
        }).toArray(function (err, obj) {
            callback(err, obj);
        });
    }
});

module.exports = PacketsModel;