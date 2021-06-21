let express = require('express');
var cors = require('cors');
let app = express();
var config = require('./config/config');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let bodyParser = require('body-parser');
let user = require('./routes/users');
let match = require('./routes/match');
let equipe = require('./routes/equipe');
let pari = require('./routes/pari');

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
const prefix = '/api';

/*------------------ User -----------------*/
app.route(prefixUser + '/register')
    .post(user.createUser);
app.route(prefixUser + '/auth')
    .get(user.connectUserByToken);
app.route(prefixUser + '/login')
    .post(user.login);
app.route(prefixUser + '/logout')
    .post(user.logout);



/*------------------ Match -----------------*/
app.route(prefix + '/match')
    .post(match.createMatch);

app.route(prefix + '/match/:id')
    .get(match.findByMatch);

app.route(prefix + '/addPari')
    .post(match.addPari);
/**
 * => etat : etat du pari : true or false
 * => periode : {
 *  date_debut : date debut de la recherche (date du match)
 *  date_fin : date fin de la recherche 
 * }
 * => pari : id du pari à rechercher
 * => equipe : nom de l'équipe
 */
app.route(prefix + '/matchs/search')
    .post(match.search);

app.route(prefix + '/matchs')
    .get(match.getAllMatch);


/*------------------ Equipe -----------------*/
app.route(prefix + '/equipe')
    .post(equipe.createEquipe);

app.route(prefix + '/equipe/:id')
    .get(equipe.findById)
    .post(equipe.update)

app.route(prefix + '/equipes')
    .get(equipe.getAllEquipe);


/*------------------ Pari -----------------*/
app.route(prefix + '/pari')
    .post(pari.create);

app.route(prefix + '/pari/:id')
    .get(pari.findById)
    .post(pari.update)

app.route(prefix + '/paris')
    .get(pari.getAll);

// On démarre le serveur

app.listen(port, () => {
    console.log('Serveur démarré sur http://localhost:' + port);
});


module.exports = app;
