var mongoose = require('mongoose');  
const Schema = require('mongoose').Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

var MatchSchema = new mongoose.Schema({  
  date_match: Date,
  latitude: Number,
  longitude: Number,
  equipe1: { type: Schema.Types.ObjectId, ref: 'Equipe'},
  equipe2: { type: Schema.Types.ObjectId, ref: 'Equipe'},
  etat: Boolean,
  pari: [{ type: Schema.Types.ObjectId, ref: 'Pari'}],
});

MatchSchema.plugin(mongoosePaginate);
mongoose.model('Match', MatchSchema);



module.exports = mongoose.model('Match');