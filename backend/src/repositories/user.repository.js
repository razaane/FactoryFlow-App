const User = require("../models/user.model");

async function create(data){
    return User.create(data);
}

async function findByEmail(email){
    return User.findOne({email:email.toLowerCase()})
}
async function findById(id) {
  return User.findById(id);
}

async function findAll(filter, limit) {
  // ne jamais renvoyer le hash du mot de passe
  return User.find(filter).select("-password").limit(limit);
}

async function count(filter) {
  return User.countDocuments(filter);
}
module.exports ={create , findByEmail,findById ,findAll , count}