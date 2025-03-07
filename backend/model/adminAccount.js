const mongoose = require('mongoose');

const adminAccountData = new mongoose.Schema({
    admin_email:{
        type:String,
    },
    admin_password:{
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

  const adminAccountDataModel = mongoose.model('adminAccount', adminAccountData);

  module.exports = adminAccountDataModel;