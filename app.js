let express = require('express');
var cors = require('cors');
let app = express();
var config = require('./config/config');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let bodyParser = require('body-parser');
let user = require('./routes/users');

let uri = config.dburi;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};


mongoose.connect(uri, options)
    .then(() => {
            console.log("Connecté à la base MongoDB assignments dans le cloud !");
            console.log("at URI = " + uri);
            console.log("vérifiez with http://localhost:8010/api/ que cela fonctionne")
        },
        err => {
            console.log('Erreur de connexion: ', err);
        });

// Pour accepter les connexions cross-domain (CORS)
app.use(cors())
app.options('*', cors())

// Pour les formulaires
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;

// les routes
const prefixUser = '/api/users';

// Users
app.route(prefixUser + '/register')
    .post(user.createUser);
app.route(prefixUser + '/auth')
    .get(user.connectUserByToken);
app.route(prefixUser + '/login')
    .post(user.login);
app.route(prefixUser + '/logout')
    .post(user.logout);

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;
