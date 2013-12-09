var crypto = require("crypto");
module.exports = function (db) {
    this.db = db;
};
module.exports.prototype = {
    extend: function (properties) {
        var Child = module.exports;
        Child.prototype = module.exports.prototype;
        for (var key in properties) {
            Child.prototype[key] = properties[key];
        }
        return Child;
    },
    setDB: function (db) {
        this.db = db;
    },
    setCollection: function(name) {
        this._collection = this.db.collection(name);
    },
    collection: function () {
        return this._collection
    },
    insert: function (data, callback) {
        data._id = crypto.randomBytes(20).toString('hex');
        this.collection().insert(data, {}, callback || function () {});
    },
    update: function (data, callback) {
        this.collection().update({
            _id: data._id
        }, data, {}, callback || function () {});
    },
    getlist: function (callback, query) {
        this.collection().find(query || {}).toArray(callback);
    },
    remove: function (_id, callback) {
        this.collection().findAndModify({
            _id: _id
        }, [], {}, {
            remove: true
        }, callback);
    }
}