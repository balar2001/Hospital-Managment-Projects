const mongoose = require('mongoose');

const staffBasicInformationData = new mongoose.Schema({
    staffID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'staffAccount',
        required: true
    },
    staffFname:{
        type:String,
    },
    staffLname:{
        type:String,
    },
    staffDOB:{
        type:String,
    },
    staffGender:{
        type:String,
    },
    staffSpeciality:{
        type:String,
    },
    staffPhone:{
        type:String,
    },
    staffEmail:{
        type:String,
    },
    staffWeb:{
        type:String,
    },
    staffImage:{
        type:String,
    },
    staffText:{
        type:String,
    },
  },
  {
    timestamps: true
  }
);

  const staffBasicInformatioDataModel = mongoose.model('staffBasicInformatio', staffBasicInformationData);

  module.exports = staffBasicInformatioDataModel;