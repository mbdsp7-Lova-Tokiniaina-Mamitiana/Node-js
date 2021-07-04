const match = require('../model/match');
var config = require('../config/config');

exports.createMatch = (req, res) => {
    match.create(req.body)
        .then((m) => {
            console.log("Match:");
            console.log(m);
            res.status(200).send(m);
        })
        .catch(err => {
            res.status(500).json({ err });
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