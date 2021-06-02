const equipe = require('../model/equipe');

function getAll(req, res) { 
    equipe.find()
        .exec((error, liste_equipe) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_equipe);
            }
        });
}
exports.createEquipe = (req, res) => {
    equipe.create(req.body)
        .then(() => {
            getAll(req, res);
        })
        .catch(err => {
            res.status(500).json({ err });
        });
}

exports.getAllEquipe = (req, res) => {
    equipe.find()
        .exec((error, liste_equipe) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_equipe);
            }
        });
}


exports.findById = (req, res) => {
    equipe.findOne({_id:req.params.id})
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
      }).catch( err => {
          console.log(err);
          res.status(500).json({
              error: "Internal Server Error"
          });
      });
}