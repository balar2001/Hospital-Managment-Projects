const mongoose = require('mongoose');

const staffAccountData = new mongoose.Schema({
    staffemail:{
        type:String,
    },
    staffpassword:{
        type:String,
    },
    roll:{
        type:String,
        default: 'staff',
        enum: ['admin', 'doctor','staff']
    }
  },
  {
    timestamps: true
  }
);

  const staffAccountDataModel = mongoose.model('staffAccount', staffAccountData);

  module.exports = staffAccountDataModel;