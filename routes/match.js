const match = require('../model/match');
const pari = require('../model/pari');
const equipe = require('../model/equipe');
const moment = require('moment');
var config = require('../config/config');


exports.createMatch = (req, res) => {
    console.log("requete match:");
    console.log(req.body);

    if (req.body.date_match == null || req.body.date_match == '') {
        res.status(403).send({ message: 'Il faut choisir un date pour le match' });
        return;
    }
    if (req.body.longitude == null || req.body.longitude == '') {
        res.status(403).send({ message: 'Il faut choisir une longitude' });
        return;
    }
    if (req.body.latitude == null || req.body.latitude == '') {
        res.status(403).send({ message: 'Il faut choisir une latitude ' });
        return;
    }
    if (req.body.equipe1 == null || req.body.equipe1 == '') {
        res.status(403).send({ message: 'Il faut choisir une premiere equipe' });
        return;
    }
    if (req.body.equipe2 == null || req.body.equipe2 == '') {
        res.status(403).send({ message: 'Il faut choisir une deuxieme equipe' });
        return;
    }
    if (req.body.equipe2 == req.body.equipe1) {
        res.status(403).send({ message: 'Il faut choisir deux equipes differentes' });
        return;
    }
    var dateMomentObject = moment(req.body.date_match, "YYYY-MM-DD HH:mm:ss"); // 1st argument - string, 2nd argument - format
    var date = dateMomentObject.toDate();
    var now = new Date();
    if (date < now) {
        console.log("now:" + now.toString() + " vs " + date);
        res.status(403).send({ message: 'Il faut choisir une date future' });
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
            res.status(500).send({ message: 'Erreur serveur lors de la creation du match' })
        });
}

exports.getAllMatch = (req, res) => {

    var options = {
        sort: { date_match: 1 },
        populate: [
            { path: 'pari' },
            { path: 'equipe1' },
            { path: 'equipe2' }
        ],
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        lean: true
    };

    match.paginate({}, options, (error, list_match) => {
        if (error) {
            res.status(500).send(error);
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

async function searchPari(description) {
    const liste_pari = await match.find()
        .populate("equipe1")
        .populate("equipe2")
        .populate({
            path: "pari",
            match: { description: { $regex: `.*?${description}.*?` } }
        })
        .exec();

    let list_pari_result = [];
    liste_pari.filter(function (el) {
        if (el.pari.length == true) {
            list_pari_result.push(el);
        }
    })
    return list_pari_result;
}

async function searchEquipe(nom) {
    const listEquipe = [];

    const equipe1List = await match.find({
        equipe1: { $ne: null }
    })
        .populate("pari")
        .populate({
            path: "equipe2"
        })
        .populate({
            path: "equipe1",
            match: { nom: { $regex: `.*?${nom}.*?` } }
        })
        .exec();

    let result1 = equipe1List.filter(function (el) {
        return el.equipe1 != null;
    })
    listEquipe.push(result1[0]);

    const equipe2List = await match.find({
        equipe2: { $ne: null }
    })
        .populate({ path: "pari" })
        .populate({
            path: "equipe1"
        })
        .populate({
            path: "equipe2",
            match: { nom: { $regex: `.*?${nom}.*?` } }
        })
        .exec();

    let result2 = equipe2List.filter(function (el) {
        return el.equipe2 != null;
    })
    listEquipe.push(result2[0]);


    let listEquipe_result = [];
    listEquipe.filter(function (el) { 
        if (el != null) {
            listEquipe_result.push(el);
        }
    })
    return (listEquipe_result[0])?listEquipe_result[0]:listEquipe_result;
}

async function searchEtat(etatMatch) { 
    const liste_pari_etat = await match.find({
        etat: etatMatch
    })
    .populate("equipe1")
    .populate("equipe2")
    .populate("pari")
    .exec();

    return liste_pari_etat;
}

exports.search = async (req, res) => {
    const today = new Date().toLocaleDateString('fr-CA');
    let periodeSearch = [];
    let todaySearch = [];
    let etatSearch = [];
    let pariSearch = [];
    let equipeSearch = [];
    let liste_match = [];
    let liste_id_match = [];


    try {
        if (req.body.pari != undefined) {
            pariSearch = await searchPari(req.body.pari);
            if (pariSearch.length > 0)  {
                pariSearch.filter(function (el) {
                    liste_match.push(el);
                })
            } else {
                liste_match.push(pariSearch);
            } 
            liste_match.push(pariSearch);
        }

        if (req.body.equipe != undefined) {
            equipeSearch = await searchEquipe(req.body.equipe);

            if (equipeSearch.length > 0)  {
                equipeSearch.filter(function (el) {
                    liste_match.push(el);
                })
            } else {
                liste_match.push(equipeSearch);
            } 
        }

        if (req.body.periode != undefined) {
            periodeSearch = match.find({
                date_match: {
                    '$gte': `${req.body.periode.avant} 00:00:00`,
                    '$lt': `${req.body.periode.apres} 23:59:59`
                }
            }).exec();
            liste_match.push(periodeSearch);
        }

        if (req.body.isToday!= undefined) {
            console.log("TodaySearch");
            match.find({
                date_match: new Date('2021-07-11')
            }).then(data => {
                todaySearch = data;
                console.log(data);
            });
            liste_match.push(todaySearch);
        }

        if (req.body.etat != undefined) {
            etatSearch = await searchEtat(req.body.etat);

            if (etatSearch.length > 0)  {
                etatSearch.filter(function (el) {
                    liste_match.push(el);
                })
            } else {
                liste_match.push(etatSearch);
            }
        }


        /*------- Enregistre tous les id du match pour la pagination -------*/    
        liste_match.filter(function (el) {
            liste_id_match.push(el._id);
        })
        


        var options = {
            sort: { date_match: 1 },
            populate: [
                { path: 'pari' },
                { path: 'equipe1' },
                { path: 'equipe2' }
            ],
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            lean: true
        };
    
        match.paginate({
            "_id": { "$in": liste_id_match }
        }, options, (error, list_match_paginate) => {
            res.status(200).json(list_match_paginate);
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
}

exports.addPari = (req, res) => {
    match.findOne({ _id: req.body.match })
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
    match.findOne({ _id: req.body.match })
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
    match.findOne({ _id: req.body.match })
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
