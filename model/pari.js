var mongoose = require('mongoose');  
var PariSchema = new mongoose.Schema({  
  description: String,
  cote: Number
});
mongoose.model('Pari', PariSchema);
module.exports = mongoose.model('Pari');