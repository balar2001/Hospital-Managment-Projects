const mongoose = require('mongoose');

const doctorBasicInformationData = new mongoose.Schema({
    docID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'doctorAccount',
        required: true
    },
    docFname:{
        type:String,
    },
    docLname:{
        type:String,
    },
    docDOB:{
        type:String,
    },
    docGender:{
        type:String,
    },
    docSpeciality:{
        type:String,
    },
    docPhone:{
        type:String,
    },
    docEmail:{
        type:String,
    },
    docWeb:{
        type:String,
    },
    doc_image:{
        type:String,
    },
    docText:{
        type:String,
    },
  },
  {
    timestamps: true
  }
);

  const doctorBasicInformatioDataModel = mongoose.model('doctorBasicInformatio', doctorBasicInformationData);

  module.exports = doctorBasicInformatioDataModel;