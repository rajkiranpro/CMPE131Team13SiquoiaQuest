var Model = require("./Base"),
    crypto = require("crypto"),
    model = new Model();

var QuizSessionModel = model.extend({
    getSession: function (sessionId, callback) {
        this.collection().findOne({
            _id: sessionId
        }, callback);
    },
    getSessionForUser: function (username, callback) {
        this.collection().findOne({
            username: username
        }, callback);
    },
    createQuizSession: function (username, packetid, questions, firstTimePlay, callback) {
        var data = {
            _id: crypto.randomBytes(20).toString('hex'),
            username: username,
            packetid: packetid,
            questions: questions,
            currentQuestion: 0,
            answered: false,
            points: 0,
            lastQuestionTime: new Date().toJSON(),
            firstTimePlay: firstTimePlay,
        }
        this.collection().insert(data, callback);
    },
    updateUserSession: function (username, correctAnswer, callback) {
        var data = {};
        if (correctAnswer) {
            data = {
                $inc: {
                    points: 1
                },
                $set: {
                    answered: true
                }
            };
        } else {
            data = {
                $inc: {
                    points: 0
                },
                $set: {
                    answered: true
                }
            };
        }
        this.collection().update({
            username: username
        }, data, {}, callback)
    },
    updateUserQSession: function (username, currentQuestion, callback) {
        var data = {
            $set: {
                answered: false,
                currentQuestion: currentQuestion,
                lastQuestionTime: new Date().toJSON()
            }
        };
        this.collection().update({
            username: username
        }, data, {}, callback)
    },
    deleteSession: function (sessionid) {
        this.collection().remove({
            _id: sessionid
        }, {}, function (err, result) {});
    },
    deleteUserSession: function (username) {
        this.collection().remove({
            username: username
        }, {}, function (err, result) {});
    }
});

module.exports = QuizSessionModel;