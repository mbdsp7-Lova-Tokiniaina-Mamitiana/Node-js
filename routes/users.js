var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');


var User = require('../model/user');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/config');

// CREATES A NEW USER
function createUser(req, res) {
    console.log(req.body);
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    var role = req.body.role;
    if (role !== 'admin' && role !== 'client') {
        res.status(401).send("Role invalide.");
    }

    User.create({
            login: req.body.login,
            email: req.body.email,
            password: hashedPassword,
            role: role
        },
        function (err, user) {
            if (err) return res.status(500).send("There was a problem registering the user.")
            // create a token
            var token = jwt.sign({
                id: user._id
            }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({
                auth: true,
                token: token
            });
        });
};

//GET USER BY TOKEN
function connectUserByToken(req, res) {
    console.log(" connectUserByToken:");
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });
    console.log(token);
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });


        User.findById(decoded.id, {
            password: 0
        }, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            res.status(200).send(user);
        });
    });

};

//Login user
function login(req, res) {
    User.findOne({
        $or: [{
            email: req.body.email
        }, {
            login: req.body.login
        }]
        /**
         * Pas besoin de role pour le login
         */ 
        //role: req.body.role  
    }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({
            auth: false,
            token: null
        });

        var token = jwt.sign({
            user: user
        }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({
            auth: true,
            token: token
        });
    });

};

//Log out but useless
function logout(req, res) {
    res.status(200).send({
        auth: false,
        token: null
    });
};

module.exports = {
    createUser,
    connectUserByToken,
    login,
    logout
};
