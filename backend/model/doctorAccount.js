const mongoose = require('mongoose');

const doctorAccountData = new mongoose.Schema({
    doctor_email:{
        type:String,
    },
    doctor_password:{
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

  const doctorAccountDataModel = mongoose.model('doctorAccount', doctorAccountData);

  module.exports = doctorAccountDataModel;