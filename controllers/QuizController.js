var BaseController = require("./Base"),
    View = require("../views/Base"),

    userModel = new(require("../models/UserModel")),
    packetsModel = new(require("../models/PacketsModel")),
    questionModel = new(require("../models/QuestionsModel")),
    quizSessionModel = new(require("../models/QuizSessionModel"));

module.exports = BaseController.extend({
    name: "Quiz Contoller",
    content: null,
    startSession: function (req, res, next) {
        var self = this;
        this.content = {};
        if (!BaseController.shoudlBeLoggedIn(req, res)) {
            return;
        }
        self.content.userName = " " + req.session.username + " ";
        self.content.userLogin = "logout";
        self.content.userLoginText = "Log Out";
        userModel.setDB(req.db);
        questionModel.setDB(req.db);
        packetsModel.setDB(req.db);
        quizSessionModel.setDB(req.db);
        userModel.setCollection('users');
        questionModel.setCollection('questions');
        packetsModel.setCollection('packets');
        quizSessionModel.setCollection('quizsession');
        quizSessionModel.getSessionForUser(req.session.userid, function (err, doc) {
            if (doc != null) {
                self.content.oldsessionid = doc._id;
                self.content.packetid = req.params.packetid;
                self.content.mode = 'oldSession';
                var v = new View(res, 'beginquiz');
                v.render(self.content);
            } else {
                userModel.findUser(req.session.userid, function (err, user) {
                    console.log(user.ownedpackets.indexOf(req.params.packetid));
                    if (user.ownedpackets.indexOf(req.params.packetid) == -1) {
                        res.redirect('/play');
                    } else {
                        var firstTime = (user.playedpackets.indexOf(req.params.packetid) == -1);
                        packetsModel.findPacket(req.params.packetid, function (err, doc) {
                            quizSessionModel.createQuizSession(req.session.userid, req.params.packetid, doc.questions, firstTime, function (err, doc) {
                                self.content.quizsession = doc._id;
                                self.content.mode = 'newSession';
                                var v = new View(res, 'beginquiz');
                                v.render(self.content);
                            });
                        });
                    }
                });
            }
        });
    },
    prepareSession: function (req, res, next) {
        var self = this;
        self.content = {};
        if (!BaseController.shoudlBeLoggedIn(req, res)) {
            return;
        }
        self.content.userName = " " + req.session.username + " ";
        self.content.userLogin = "logout";
        self.content.userLoginText = "Log Out";
        userModel.setDB(req.db);
        questionModel.setDB(req.db);
        packetsModel.setDB(req.db);
        quizSessionModel.setDB(req.db);
        userModel.setCollection('users');
        questionModel.setCollection('questions');
        packetsModel.setCollection('packets');
        quizSessionModel.setCollection('quizsession');
        if (req.body.mode == 'old') {
            if (req.body.abort == 'yes') {
                quizSessionModel.getSessionForUser(req.session.userid, function (err, doc) {
                    console.log(req.body);
                    if (doc != null) {
                        userModel.gamePlayed(req.session.userid, doc.points, doc.packetid, doc.firstTimePlay)
                    }
                    quizSessionModel.deleteUserSession(req.session.userid);
                    var url = '/play/' + req.body.packetid;
                    console.log(url);
                    res.redirect(url);
                });
            } else {
                self.initQuiz(req, res, req.body.oldsessionid);
            }
        } else {
            self.initQuiz(req, res, req.body.sessionid);
        }
    },
    initQuiz: function (req, res, sessionid) {
        var self = this;
        self.content = {};
        self.content.userName = " " + req.session.username + " ";
        self.content.userLogin = "logout";
        self.content.userLoginText = "Log Out";
        var v = new View(res, 'quiz');
        v.render(self.content);
    },
    submitAnswer: function (req, res, next) {
        userModel.setDB(req.db);
        questionModel.setDB(req.db);
        quizSessionModel.setDB(req.db);
        userModel.setCollection('users');
        questionModel.setCollection('questions');
        quizSessionModel.setCollection('quizsession');
        quizSessionModel.getSessionForUser(req.session.userid, function (err, session) {
            if (req.body.answer != '') {
                console.log(session);
                questionModel.findQuestion(session.questions[session.currentQuestion - 1], function (err, question) {
                    var result = (question.answer.toLowerCase() == req.body.answer.toLowerCase());
                    questionModel.updateQuestion(question._id, result);
                    quizSessionModel.updateUserSession(req.session.userid, result, function (err, doc) {
                        var data = {};
                        data.answer = result ? "correct" : "incorrect";
                        data.correctanswers = result ? session.points + 1 : session.points;
                        console.log(data);
                        if (session.currentQuestion == session.questions.length) {
                            console.log(session);
                            console.log(req.session.userid);
                            userModel.gamePlayed(req.session.userid, session.points, session.packetid, session.firstTimePlay);
                            quizSessionModel.deleteUserSession(req.session.userid);
                        }
                        res.send(data);
                    });
                });
            } else {
                var data = {};
                data.answer = "unanswered";
                data.correctanswers = session.points;
                if (session.currentQuestion == session.questions.length) {
                    if (session.firstTimePlay) {
                        userModel.gamePlayed(req.session.userid, session.points, session.packetid);
                    }
                    quizSessionModel.deleteUserSession(req.session.userid);
                }
                res.send(data);
            }

        });
    },
    nextQuestion: function (req, res, next) {
        var self = this;
        this.content = {};
        userModel.setDB(req.db);
        questionModel.setDB(req.db);
        quizSessionModel.setDB(req.db);
        userModel.setCollection('users');
        questionModel.setCollection('questions');
        quizSessionModel.setCollection('quizsession');
        quizSessionModel.getSessionForUser(req.session.userid, function (err, session) {
            questionModel.findQuestion(session.questions[session.currentQuestion], function (err, question) {
                console.log(question);
                self.content.lastQuestion = (session.questions.length == (session.currentQuestion + 1));
                self.content.correctanswers = session.points;
                self.content.questionText = question.question;
                self.content.questionNumber = session.currentQuestion + 1;
                self.content.correctanswers = session.points;
                self.content.optA = question.optA;
                self.content.optB = question.optB;
                self.content.optC = question.optC;
                self.content.optD = question.optD;
                self.content.category = question.category.replace('\\', ' > ');
                self.content.rating = question.rating;
                quizSessionModel.updateUserQSession(req.session.userid, self.content.questionNumber, function (err, result) {
                    res.send(self.content);
                });
            });
        });
    },

});