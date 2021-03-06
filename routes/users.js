var User = require('../model/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/config');

// CREATES A NEW USER
exports.createUser = (req, res) => {
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
                token: token,
                id: user._id
            });
        });
};

//GET USER BY TOKEN
exports.connectUserByToken = (req, res) => {
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
        console.log("decoded:");
        console.log(decoded);
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
exports.login = (req, res) => {
    User.findOne({
        $or: [{
            email: req.body.email
        }, {
            login: req.body.login
        }]
        /**
         * Pas besoin de role pour le login
         */
    }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({
            auth: false,
            token: null,
        });

        var token = jwt.sign({
            user: user,
            id: user._id
        }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({
            auth: true,
            token: token,
            connected: user
        });
    });

};


exports.countUser = (req, res) => {
    User.count({
        role: 'client'
    }, function (error, user_count) { 
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(user_count);
        }
     })
    
}


//Log out
exports.logout = (req, res) => {
    res.status(200).send({
        auth: false,
        token: null
    });
};
