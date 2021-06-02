var mongoose = require('mongoose');  
var EquipeSchema = new mongoose.Schema({  
  nom: String,
  avatar: String
});
mongoose.model('Equipe', EquipeSchema);
module.exports = mongoose.model('Equipe');