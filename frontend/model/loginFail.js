const mongoose = require('mongoose');

const loginFailData = new mongoose.Schema({
    user_email:{type:String,},
    user_password:{type:String},
    error:{
        type:String,
        default: 'Wrong username and Password',
    },
    ip: {type :String},
    country: {type: String},
    city: {type: String},
    region: {type: String},
    isp: {type: String},
  },
  {
    timestamps: true
  }
);

  const loginFailModel = mongoose.model('loginFail', loginFailData);

  module.exports = loginFailModel;