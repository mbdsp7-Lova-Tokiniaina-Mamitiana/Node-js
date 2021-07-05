const match = require('../model/match');
const moment= require('moment') ;
var config = require('../config/config');


exports.createMatch = (req, res) => {
    console.log("requete match:");
    console.log(req.body);
    
    if(req.body.date_match == null || req.body.date_match == ''){
        res.status(403).send({message : 'Il faut choisir un date pour le match'});
        return;
    }
    if(req.body.longitude == null || req.body.longitude == ''){
        res.status(403).send({message : 'Il faut choisir une longitude'});
        return;
    }
    if(req.body.latitude == null || req.body.latitude == ''){
        res.status(403).send({message : 'Il faut choisir une latitude '});
        return;
    }
    if(req.body.equipe1 == null || req.body.equipe1 == ''){
        res.status(403).send({message : 'Il faut choisir une premiere equipe'});
        return;
    }
    if(req.body.equipe2 == null || req.body.equipe2 == ''){
        res.status(403).send({message : 'Il faut choisir une deuxieme equipe'});
        return;
    }
    if(req.body.equipe2 == req.body.equipe1){
        res.status(403).send({message : 'Il faut choisir deux equipes differentes'});
        return;
    }
    var dateMomentObject = moment(req.body.date_match, "YYYY-MM-DD HH:mm:ss"); // 1st argument - string, 2nd argument - format
    var date = dateMomentObject.toDate();
    var now = new Date();
    if(date<now){
        console.log("now:"+now.toString() + " vs "+date);
        res.status(403).send({message : 'Il faut choisir une date future'});
        return;
    }
    req.body.date_match = date;
    match.create(req.body)
        .then((m) => {
            console.log("Match:");
            console.log(m);
            res.status(200).send(m);
        })
        .catch(err => {
            console.log("error");
            console.log(err);
            res.status(500).send({message:'Erreur serveur lors de la creation du match'})
        });
}

exports.getAllMatch = (req, res) => {

    var options = {
        sort: { date_match: 1 },
        populate: [
            {path : 'pari'},
            {path : 'equipe1'},
            {path : 'equipe2'}
        ],
        page: parseInt(req.query.page) || 1, 
        limit: parseInt(req.query.limit) || 10,
        lean: true
    };

    match.paginate({}, options, (error, list_match) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(list_match);
        }
    })
}

exports.findByMatch = (req, res) => {
    match.findOne({ _id: req.params.id })
        .populate({
            path: 'pari',
            match: { _id: { $ne: null } }
        })
        .populate({
            path: 'equipe1',
            match: { _id: { $ne: null } }
        })
        .populate({
            path: 'equipe2',
            match: { _id: { $ne: null } }
        })
        .sort({ date_match: 1 })
        .exec((error, liste_match) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_match);
            }
        });
}

exports.findByPari = (req, res) => {
    match.find()
        .populate({
            path: 'pari',
            match: { _id: req.params.id }
        })
        .sort({ date_match: 1 })
        .exec((error, liste_match) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_match);
            }
        });
}

exports.findByPari = (req, res) => {
    match.find()
        .populate({
            path: 'pari',
            match: { _id: req.params.id }
        })
        .sort({ date_match: 1 })
        .exec((error, liste_match) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_match);
            }
        });
}

exports.search = (req, res) => {
    let periode = req.body.periode;
    let etat = req.body.etat;
    let pari = req.body.pari;
    let equipe = req.body.equipe;

    
    var list;
    math.find({})
    .populate({
        path: 'pari',
        match: { _id: pari }
    })
    .populate({
        path: 'equipe1',
        match: { nom: { $regex: '.*' + equipe + '.*' } }
    })
    .populate({
        path: 'equipe2',
        match: { nom: { $regex: '.*' + equipe + '.*' } }
    })
    .sort({ date_match: 1 })
    .exec((error, liste_match) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(liste_match);
        }
    });
}

exports.addPari = (req, res) => {
    match.findOne({ _id: req.body.match})
    .exec((error, liste_match) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            liste_match.pari.push(req.body.pari);
            liste_match.save(function (error, liste) { 
                if (error) return res.send(error);
                res.status(200).json(liste);
            })
        }
    });
}


exports.terminer = (req, res) => {
    match.findOne({ _id: req.body.match})
    .exec((error, m) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            m.etat = false;
            m.save(function (error, liste) { 
                if (error) return res.send(error);
                res.status(200).json(liste);
            })
        }
    });
}
exports.removePari = (req, res) => {
    match.findOne({ _id: req.body.match})
    .exec((error, m) => {
        var index = m.pari.indexOf(req.body.pari);
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            m.pari.splice(index, 1);
            m.save(function (error, liste) { 
                if (error) return res.send(error);
                res.status(200).json(liste);
            })
        }
    });
}
