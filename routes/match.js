const match = require('../model/match');
const pari = require('../model/pari');
const equipe = require('../model/equipe');
const moment = require('moment');
var config = require('../config/config');
const today = new Date().toLocaleDateString('fr-CA');

exports.createMatch = (req, res) => {
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
    var dateMomentObject = moment(req.body.date_match, "YYYY-MM-DD hh:mm"); // 1st argument - string, 2nd argument - format
    var date = dateMomentObject.toDate();
   
    var now = new Date();
    console.log("now:" + now.toString() + " vs " + date);
    if (date < now) {
        
        res.status(403).send({ message: 'Il faut choisir une date future' });
        return;
    }
    req.body.date_match = date;
    match.create(req.body)
        .then((m) => {
            const createPariPromises = req.body.paris.filter(p => !p._id || p._id === '').map(p => {
                delete p._id;
                return pari.create(p);
            });
            Promise.all(createPariPromises).then(paris => {
               m.pari.push(...paris);
               m.save((error, matchSaved) => {
                   if (error) {
                       console.log("Erreur serveur lors de la liaison des paris");
                       console.log(err);
                       res.status(500).send({ message: 'Erreur serveur lors de la liaison des paris' });
                   }
                   res.status(200).json(matchSaved);
               });
            }).catch(error => {
                console.log("Erreur serveur lors de la creation des paris");
                console.log(err);
                res.status(500).send({ message: 'Erreur serveur lors de la creation des paris' });
            });
        })
        .catch(err => {
            console.log("error");
            console.log(err);
            res.status(500).send({ message: 'Erreur serveur lors de la creation du match' });
        });
}

exports.getMatchCount = (req, res) => {
    match.count()
        .exec((error, count_match) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(count_match);
            }
        });
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
            match: { description: { $regex: `.*?${description}.*?`, '$options' : 'i' } }
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
            match: { nom: { $regex: `.*?${nom}.*?`, '$options' : 'i' } }
            //match: { nom: { $regex: new RegExp(`^${nom}$`), $options: 'i' }} 
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
            match: { nom: { $regex: `.*?${nom}.*?`, '$options' : 'i' } }
        })
        .exec();

    let result2 = equipe2List.filter(element => element.equipe2 != null);

    if (result2.length > 0) {
        for (const el of result2) {
            listEquipe.push(el);
        }
    }
    return listEquipe;
}

async function searchEtat(etatMatch, liste_match) {
    let searchResult = [];

    if (liste_match.length == 0) {
        searchResult = await match.find({
            etat: etatMatch
        })
            .populate("equipe1")
            .populate("equipe2")
            .populate("pari")
            .exec();
    } else {
        for (const item of liste_match) {
            if (item.etat) {
                searchResult.push(item)
            }
        }
    }
    return searchResult;
}

async function isDateBetween(dateBefore, dateMatch, dateAfter) {
    // Date Before && Date After
    if (dateBefore && dateAfter) {
        const _dateBefore = new Date(dateBefore);
        const _dateAfter = new Date(dateAfter);
        _dateBefore.setDate(_dateBefore.getDate()-1);

        return (dateMatch.getTime() >= _dateBefore.getTime() && dateMatch.getTime() <= _dateAfter.getTime());

    // Date Before 
    } else if(dateBefore) {
        const _dateBefore = new Date(dateBefore);
        _dateBefore.setDate(_dateBefore.getDate()-1);

        return (dateMatch.getTime() >= _dateBefore.getTime());

    // Date After
    } else if(dateAfter) {
        const _dateAfter = new Date(dateAfter);

        return (dateMatch.getTime() <= _dateAfter.getTime());
    }
    return true;
    
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

    for (const item of matchs) {
        const dateMatch = new Date(item.date_match);
        const dateMatchComplet = new Date(dateMatch.getFullYear() + '-' + (+dateMatch.getMonth() + 1) + '-' + dateMatch.getDate());
        const result = await isDateBetween(dateDebut, dateMatchComplet, dateFin);

        if (result) {
            searchResult.push(item)
        }
    }
    //console.log(searchResult);
    return searchResult;
}

async function isTodayMatch(liste_match) { 
    return searchMatch(today,today, liste_match);
}

exports.search = async (req, res) => {
    
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
                for (const item of pariSearch) {
                    liste_match.push(item);
                }
            }
        }

        if (req.body.equipe) {
            console.log("*** Recherche Equipe ***");
            equipeSearch = await searchEquipe(req.body.equipe);
            if (equipeSearch.length > 0) {
                for (const item of equipeSearch) {
                    liste_match.push(item);
                }
            }
        }

        if (req.body.etat || !req.body.etat) {
            console.log("*** Recherche Etat ***");
            etatSearch = await searchEtat(req.body.etat, liste_match);
            liste_match = etatSearch;
        }

        if (req.body.isToday) {
            console.log("*** Recherche isToday Match ***");
            todaySearch = await isTodayMatch(liste_match);
            liste_match = todaySearch;
        }

        if (req.body.date_debut || req.body.date_fin) {
            console.log("*** Recherche Periode ***");
            const dateDebut = req.body.date_debut;
            const dateFin = req.body.date_fin;
            periodeSearch = await searchMatch(dateDebut,dateFin, liste_match);
            liste_match = periodeSearch;
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

        if (req.body.pari == undefined && req.body.equipe == undefined && req.body.date_debut == undefined && req.body.date_fin == undefined && req.body.isToday == undefined && req.body.etat == undefined) {
            match.paginate({}, options, (error, list_match_paginate) => {
                res.status(200).json(list_match_paginate);
            })
        } else {
            let match_result = [];
            if (liste_match.length != 0) {
                match_result = (liste_match[0].length == undefined) ? liste_match : liste_match[0];
            }

            for (const item of match_result) {
                liste_id_match.push(item._id);
            }

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
    match.findByIdAndUpdate(req.body.id, {'etat': true}, (err, result) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json('Match terminé');
        }
    })
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

exports.removeMatch = (req, res) => {
    match.findByIdAndDelete(req.params.id, null, (error, docs) => {
        if (error) {
            console.log(error);
            return res.send(error);
        }
        res.status(200).json(docs);
    });
}
