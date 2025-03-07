const mongoose = require('mongoose');

const adminBasicInformationData = new mongoose.Schema({
    adminID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'adminAccount',
        required: true
    },
    adminFname:{
        type:String,
    },
    adminLname:{
        type:String,
    },
    adminDOB:{
        type:String,
    },
    adminGender:{
        type:String,
    },
    adminSpeciality:{
        type:String,
    },
    adminPhone:{
        type:String,
    },
    adminEmail:{
        type:String,
    },
    adminWeb:{
        type:String,
    },
    adminImage:{
        type:String,
    },
    adminText:{
        type:String,
    },
  },
  {
    timestamps: true
  }
);

  const adminBasicInformatioDataModel = mongoose.model('adminBasicInformatio', adminBasicInformationData);

  module.exports = adminBasicInformatioDataModel;