var Model = require("./Base"),
    model = new Model();

var QuestionsModel = model.extend({
    findQuestion: function (questionId, callback) {
        this.collection().findOne({
            _id: questionId
        }, function (err, obj) {
            if (obj) {
                if (obj.numberOfAttempts >= 5) {
                    var rating = (1 - (obj.correctAnswers / obj.numberOfAttempts)) * 100;
                    if (rating >= 80) {
                        obj.rating = "Hard";
                    } else if (rating >= 60) {
                        obj.rating = "Challenging";
                    } else if (rating >= 40) {
                        obj.rating = "Nomal";
                    } else if (rating >= 20) {
                        obj.rating = "Easy";
                    } else {
                        obj.rating = "Very Easy";
                    }
                } else {
                    obj.rating = "Unavailable";
                }
            }
            callback(err, obj);
        });
    },
    updateQuestion: function (questionId, isCorrectAnswer) {
        var updateData = {};
        if (isCorrectAnswer) {
            updateData = {
                $inc: {
                    numberOfAttempts: 1,
                    correctAnswers: 1
                }
            };
        } else {
            updateData = {
                $inc: {
                    numberOfAttempts: 1
                }
            }
        }
        this.collection().update({
            _id: questionId
        }, updateData, {}, function (error, result) {});
    },
});

module.exports = QuestionsModel;