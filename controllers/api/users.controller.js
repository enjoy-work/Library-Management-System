var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.post('/addBook', addBooks);
router.post('/issueBook', issueBooks);
router.post('/returnBook', returnBooks);
router.post('/removeBook', removeBooks);

module.exports = router;
 
function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password,req.body.role)
        .then(function (token) {
            if (token) {
                res.send({ token: token });
            } else {
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addBooks(req, res) {  
    userService.addBook(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function issueBooks(req, res) {
    userService.issueBook(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function removeBooks(req, res) {
    userService.removeBook(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function returnBooks(req, res) {
    userService.returnBook(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}