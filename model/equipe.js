var mongoose = require('mongoose');  
const mongoosePaginate = require('mongoose-paginate-v2');
var EquipeSchema = new mongoose.Schema({  
  nom: String,
  avatar: String
});
EquipeSchema.plugin(mongoosePaginate);
mongoose.model('Equipe', EquipeSchema);
module.exports = mongoose.model('Equipe');