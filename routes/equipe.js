const equipe = require('../model/equipe');

exports.createEquipe = (req, res) => {
    equipe.create(req.body)
        .then((e) => {
            res.status(200).send(e);
        })
        .catch(err => {
            res.status(500).json({ err });
        });
}

exports.getAllEquipe = (req, res) => {
    var options = {
        sort: { nom: 1 },
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        lean: true
    };

    equipe.paginate({}, options, (error, list_match) => {
        if (error) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(list_match);
        }
    })
}


exports.findById = (req, res) => {
    equipe.findOne({ _id: req.params.id })
        .exec((error, liste_equipe) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_equipe);
            }
        });
}

exports.update = (req, res) => {
    equipe.findByIdAndUpdate(req.params.id, {
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