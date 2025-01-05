const mongoose = require('mongoose');

const book_appointment_data = new mongoose.Schema({
    pat_name:{
        type:String,
    },
    pat_mobileNumber:{
        type:String,
    },
    pat_age:{
        type:String,
    },
    pat_apoi_date:{
        type:String,
    },
    sel_doctor:{
        type:String,
    },
    sel_department:{
        type:String
    },
    pat_email:{
        type:String
    },
    status:{
        type:String,
        default: 'pending',
        enum: ['pending', 'approve','reject']
    },

  },
  {
    timestamps: true
  }
);

  const book_appointment_model = mongoose.model('book_appointment', book_appointment_data);

  module.exports = book_appointment_model;