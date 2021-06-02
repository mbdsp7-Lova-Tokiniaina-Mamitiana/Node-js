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
    pari.create(req.body)
        .then(() => {
            getAll(req, res);
        })
        .catch(err => {
            res.status(500).json({ err });
        });
}

exports.getAll = (req, res) => {
    pari.find()
        .exec((error, liste_pari) => {
            if (error) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(liste_pari);
            }
        });
}


exports.findById = (req, res) => {
    pari.findOne({_id:req.params.id})
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
      }).catch( err => {
          console.log(err);
          res.status(500).json({
              error: "Internal Server Error"
          });
      });
}