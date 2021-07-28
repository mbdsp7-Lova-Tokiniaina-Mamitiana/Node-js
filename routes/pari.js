const pari = require('../model/pari');

function getAll(req, res) {
    pari.find()
        .exec((error, liste_pari) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_pari);
            }
        });
}
exports.create = (req, res) => {
    if (req.body.description == null || req.body.description == '') {
        res.status(403).send({ message: 'Il faut choisir une description du pari' });
        return;
    }
    if (req.body.cote == null || req.body.cote == '') {
        res.status(403).send({ message: 'Il faut choisir une cote du pari' });
        return;
    }
    if (req.body.cote < 0) {
        res.status(403).send({ message: 'Il faut choisir une cote positif' });
        return;
    }

    pari.create(req.body)
        .then((p) => {
            console.log(p);
            res.status(200).send(p);
        })
        .catch(err => {
            res.status(500).json({ message: 'Erreur serveur lors de la creation de pari' });
        });
}

exports.getAll = (req, res) => {
    pari.find()
        .sort({ cote: 1 })
        .exec((error, liste_pari) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_pari);
            }
        });
}

exports.findById = (req, res) => {
    pari.findOne({ _id: req.params.id })
        .exec((error, liste_pari) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_pari);
            }
        });
}

exports.update = (req, res) => {
    pari.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }).then(() => {
        getAll(req, res);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: "Internal Server Error"
        });
    });
}

exports.search = (req, res) => {
    pari.find(
        { description: { $regex: `.*?${req.body.pari}.*?`, '$options' : 'i' } }
    )
    .exec((error, liste_pari) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(liste_pari);
        }
    });
}