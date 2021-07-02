const match = require('../model/match');

exports.createMatch = (req, res) => {
    console.log("requete match:");
    console.log(req.body);
    match.create(req.body)
        .then((m) => {
            console.log("Match:");
            console.log(m);
            res.status(200).send(m);
        })
        .catch(err => {
            console.log("error");
            console.log(err);
            res.status(500).json({ err });
        });
}

exports.getAllMatch = (req, res) => {
    match.find()
        .populate({
            path: 'pari',
            match: { _id: { $ne: null } }
        })
        .sort({ date_match: 1 })
        .exec((error, list_match) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(list_match);
            }
        });
}

exports.findByMatch = (req, res) => {
    match.findOne({ _id: req.params.id })
        .populate({
            path: 'pari',
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

    if (etat) {
        if (periode) {
            list = match.find({
                etat: etat,
                date_match: {
                    $gte: periode.date_debut,
                    $lte: periode.date_fin
                }
            })
        } else {
            list = match.find({
                etat: etat
            });
        }
    } else {
        if (periode) {
            list = match.find({
                etat: etat,
                date_match: {
                    $gte: periode.date_debut,
                    $lte: periode.date_fin
                }
            })
        } else {
            list = match.find()
        }
    }

    if (pari) {
        list.populate({
            path: 'pari',
            match: { _id: pari }
        });
    } else {
        list.populate({
            path: 'pari',
            match: { _id: { $ne: null } }
        });
    }
    if (equipe) {
        list.populate({
            path: 'equipe1',
            match : {
                nom : { $regex: '.*' + equipe + '.*' }
            }
        });
        list.populate({
            path: 'equipe2',
            match : {
                nom : { $regex: '.*' + equipe + '.*' }
            }
        });
    } else {
        list.populate({
            path: 'equipe1',
        });
        list.populate({
            path: 'equipe2',
        });
    }
    
    list.sort({ date_match: 1 })
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