var mongoose = require('mongoose');  
const Schema = require('mongoose').Schema;

var MatchSchema = new mongoose.Schema({  
  date_match: Date,
  localisation: String,
  equipe1: { type: Schema.Types.ObjectId, ref: 'Equipe'},
  equipe2: { type: Schema.Types.ObjectId, ref: 'Equipe'},
  etat: Boolean,
  pari: { type: Schema.Types.ObjectId, ref: 'Pari'},
});
mongoose.model('Match', MatchSchema);
module.exports = mongoose.model('Match');