const mongoose = require('mongoose');

const signUpData = new mongoose.Schema({
    user_name:{
        type:String,
    },
    user_email:{
        type:String,
    },
    user_password:{
        type:String,
    }

  },
  {
    timestamps: true
  }
);

  const signUpModel = mongoose.model('signUpUser', signUpData);

  module.exports = signUpModel;