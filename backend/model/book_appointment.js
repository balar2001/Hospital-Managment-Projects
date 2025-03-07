const mongoose = require('mongoose');

const book_appointment_data = new mongoose.Schema({
    pat_fname:{
        type:String,
    },
    pat_mname:{
        type:String,
    },
    pat_lname:{
        type:String,
    },
    pat_email:{
        type:String,
    },
    pat_dob:{
        type:String,
    },
    pat_gender:{
        type:String,
    },
    pat_age:{
        type:String,
    },
    pat_mobileNumber:{
        type:String
    },
    pat_appointmentDate:{
        type:String
    },
    pat_appointmentTime:{
        type:String
    },
    sel_doctor:{
        type:String,
    },
    department:{
        type:String
    },
    pat_message:{
        type:String,
    },
    status:{
        type:String,
        default: 'pending',
        enum: ['pending', 'approve','reject']
    },
    appoiment_mode:{
        type:String,
        default: 'null',
        enum: ['online', 'ofline']
    }

  },
  {
    timestamps: true
  }
);

  const book_appointment_model = mongoose.model('book_appointment', book_appointment_data);

  module.exports = book_appointment_model;