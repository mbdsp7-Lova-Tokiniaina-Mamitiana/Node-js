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
    
    for (const element of liste_pari) {
        if (element.pari.length != 0) {
            list_pari_result.push(element);
        }
    }

    return list_pari_result;
}

async function searchEquipe(nom) {
    const listEquipe = [];

    const equipe1List = await match.find()
        .populate("pari")
        .populate({
            path: "equipe1",
            match: { nom: { $regex: `.*?${nom}.*?` } }
        })
        .populate({
            path: "equipe2"
        })
        .exec();

    let result1 = equipe1List.filter(element => element.equipe1 != null);

    if (result1.length > 0) {
        for (const el of result1) {
            listEquipe.push(el);
        }
    }

    const equipe2List = await match.find()
        .populate({ path: "pari" })
        .populate({
            path: "equipe1"
        })
        .populate({
            path: "equipe2",
            match: { nom: { $regex: `.*?${nom}.*?` } }
        })
        .exec();

    let result2 = equipe2List.filter(element => element.equipe2 != null);

    if (result2.length > 0) {
        for (const el of result2) {
            listEquipe.push(el);
        }
    }

    console.log(listEquipe);
    return listEquipe;
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

function isDateBetween(dateBefore, dateMatch, dateAfter) {
    return (dateMatch.getTime() >= dateBefore.getTime() && dateMatch.getTime() <= dateAfter.getTime());
}

async function searchMatch(dateDebut,dateFin, liste_match) {
    let searchResult = [];
    let matchs = [];
    if (liste_match.length == 0) {
        matchs = await match.find()
            .populate("equipe1")
            .populate("equipe2")
            .populate("pari")
            .exec();
    } else {
        matchs = liste_match;
    }

    matchs.forEach((match) => {
        const dateMatch = new Date(match.date_match);
        const dateMatchComplet = new Date(dateMatch.getFullYear() + '-' + (+dateMatch.getMonth() + 1) + '-' + dateMatch.getDate());
        const result = isDateBetween(dateDebut, dateMatchComplet, dateFin);

        if (result) {
            searchResult.push(match)
        }
    });
    //console.log(searchResult);
    return searchResult;
}

exports.search = async (req, res) => {
    const today = new Date().toLocaleDateString('fr-CA');
    let periodeSearch = []; //yyyy-mm-dd
    let todaySearch = [];
    let etatSearch = [];
    let pariSearch = [];
    let equipeSearch = [];
    let liste_match = [];
    let liste_id_match = [];

    let page = (req.body.page) ? parseInt(req.body.page) : 1;
    let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;

    console.log("_____________________________________________________________________");
    console.log("***********************************");
    console.log("REQUETE ENVOYE : ");
    console.log(req.body);
    console.log("***********************************");

    try {
        if (req.body.pari) {
            console.log("*** Recherche Pari ***");
            pariSearch = await searchPari(req.body.pari);
            if (pariSearch.length > 0) {
                pariSearch.filter(function (el) {
                    liste_match.push(el);
                })
            }
        }

        if (req.body.equipe) {
            console.log("*** Recherche Equipe ***");
            equipeSearch = await searchEquipe(req.body.equipe);
            if (equipeSearch.length > 0) {
                equipeSearch.filter(function (el) {
                    liste_match.push(el);
                })
            }
        }

        if (req.body.etat) {
            console.log("*** Recherche Etat ***");
            etatSearch = await searchEtat(req.body.etat);

            if (etatSearch.length > 0) {
                etatSearch.filter(function (el) {
                    liste_match.push(el);
                })
            } else {
                liste_match.push(etatSearch);
            }
        }

        if (req.body.isToday) {
            console.log("*** Recherche Today match ***");
            const todayMatch = await match.find()
                .populate("equipe1")
                .populate("equipe2")
                .populate("pari")
                .exec();

            todayMatch.filter(function (el) {
                const dateMatch = new Date(el.date_match);
                const dateMatchComplet = new Date(dateMatch.getFullYear() + '-' + (+dateMatch.getMonth() + 1) + '-' + dateMatch.getDate()).toLocaleDateString('fr-CA');
                if (today == dateMatchComplet) {
                    todaySearch.push(el)
                }
            })

            if (todaySearch.length > 0) {
                todaySearch.filter(function (el) {
                    liste_match.push(el);
                })
            }
        }

        if (req.body.periode) {
            console.log("*** Recherche Periode ***");
            const dateDebut = new Date(req.body.periode.date_debut);
            const dateFin = new Date(req.body.periode.date_fin);
            periodeSearch = await searchMatch(dateDebut,dateFin, liste_match);
            if (periodeSearch.length > 0) {
                periodeSearch.filter(function (el) {
                    liste_match.push(el);
                })
            }
        }


        /*------- Enregistre tous les id du match pour la pagination -------*/


        var options = {
            sort: { date_match: 1 },
            populate: [
                { path: 'pari' },
                { path: 'equipe1' },
                { path: 'equipe2' }
            ],
            page: page,
            limit: limit,
            lean: true
        };

        if (req.body.pari == undefined && req.body.equipe == undefined && req.body.periode == undefined && req.body.isToday == undefined && req.body.etat == undefined) {
            match.paginate({}, options, (error, list_match_paginate) => {
                res.status(200).json(list_match_paginate);
            })
        } else {
            let match_result = [];
            if (liste_match.length != 0) {
                match_result = (liste_match[0].length == undefined) ? liste_match : liste_match[0];
            }
            match_result.filter(function (el) {
                liste_id_match.push(el._id);
            })

            //console.log(match_result);
            match.paginate({
                "_id": { "$in": liste_id_match }
            }, options, (error, list_match_paginate) => {
                res.status(200).json(list_match_paginate);
            })
        }
        console.log("_____________________________________________________________________");
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
