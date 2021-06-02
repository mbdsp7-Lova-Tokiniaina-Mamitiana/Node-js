const match = require('../model/match');

exports.createMatch = (req, res) => {
    match.create(req.body)
        .then(() => {
            res.status(200).json();
        })
        .catch(err => {
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
    match.findOne({_id:req.params.id})
    .populate({
        path: 'pari',
        match: { _id: { $ne: null } }
    })
    .sort({type: 1})
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
    .sort({type: 1})
    .exec((error, liste_match) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(liste_match);
        }
    });
}