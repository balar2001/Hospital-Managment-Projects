var express = require('express');
var router = express.Router();
const WindowsBalloon = require('node-notifier').WindowsBalloon;


var notifier = new WindowsBalloon({
  withFallback: false, // Try Windows Toast and Growl first?
  customPath: undefined // Relative/Absolute path if you want to use your fork of notifu
});

const book_appointment_model = require('../model/book_appointment');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sign_in', function(req, res, next) {
  res.render('sign_in', { title: 'Express' });
});
router.get('/book_appointment', function(req, res, next) {
  res.render('book_appointment', { title: 'Express' });
});

router.post('/book_appointment', async function(req, res, next) {
  try {
    const {
      pat_fname,
      pat_mname,
      pat_lname,
      pat_email,
      pat_dob,
      pat_gender,
      pat_age,
      pat_mobileNumber,
      pat_appointmentDate,
      pat_appointmentTime,
      sel_doctor,
      sel_department,
      pat_message
    } = req.body;

    if (!pat_fname || !pat_mname || !pat_lname || !pat_email ||
        !pat_dob || !pat_gender || !pat_age || !pat_mobileNumber || !pat_appointmentDate || !pat_appointmentTime || !sel_doctor || !sel_department || !pat_message) {
        return notifier.notify({
            title: 'Book Appointment',
            message: 'All fields are required',
            sound: true,
            wait: true,
            type: 'info',
            gravity: "center", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
        });
        // return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if a similar appointment already exists
    const findPt = await book_appointment_model.find({ pat_email: pat_email });

    if (findPt.length > 0) {
        console.log("===============" + findPt[0].status);
        if (findPt[0].status == 'approve' || findPt[0].status == 'pending') {
            notifier.notify({
                title: 'Book Appointment',
                message: 'Appointment request already sent',
                sound: true,
                wait: true,
                type: 'info'
            });
            return res.redirect('/book_appointment'); // Ensure further processing stops
        } else {
          const id = {
            _id : findPt[0]._id
          }
          await book_appointment_model.findByIdAndDelete(id);
        }
    }

    // Create appointment object
    const obj = {
      pat_fname,
      pat_mname,
      pat_lname,
      pat_email,
      pat_dob,
      pat_gender,
      pat_age,
      pat_mobileNumber,
      pat_appointmentDate,
      pat_appointmentTime,
      sel_doctor,
      sel_department,
      pat_message,
      appoiment_mode:'ofline'
    };
    // Save to database
    const patData = await book_appointment_model.create(obj);
    console.log(patData);

    notifier.notify({
      title: 'Book Appointment',
      message: 'Appointment Book',
      sound: true,
      wait: true,
      type: 'info'
    });
    return res.redirect('/book_appointment'); // Ensure no further response is sent
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

router.get('/add_doctor', function(req, res, next) {
  res.render('add_doctor', { title: 'Express' });
});

router.get('/all_doctor', function(req, res, next) {
  res.render('all_doctor', { title: 'Express' });
});

router.get('/all_appoiment', async function(req, res, next) {

  const pat = await book_appointment_model.find();

  res.render('all_appoiment', { title: 'Express',pat });
});

// router.post('/all_appoiment', async function(req, res, next) {

//   var mailid = req.body.sent;

//   const email = req.body.email;
//   const action = req.body.action;

//   console.log("qwertyyuikjhg"+email);
//   console.log("qwertyyuikjhg"+action);
  

//   if(action === 'approve') {
//     var allInfo = await book_appointment_model.find({pat_email : email});

//     if(!allInfo){
//       console.log("Not Found");
//     }
  
//     var patID = allInfo[0]._id;
  
//     const uid = {
//       _id:patID,
//     }
//     const upStatus = {
//       status:"approve",
//     }
  
//     await book_appointment_model.findByIdAndUpdate(uid,upStatus);
//     res.redirect('all_appoiment');

//   } else if(action === 'reject') {
//     var allInfo = await book_appointment_model.find({pat_email : email});

//     if(!allInfo){
//       console.log("Not Found");
//     }
  
//     var patID = allInfo[0]._id;
  
//     const uid = {
//       _id:patID,
//     }
//     const upStatus = {
//       status:"reject",
//     }
  
//     await book_appointment_model.findByIdAndUpdate(uid,upStatus);
//     res.redirect('all_appoiment');

//   }
  

//   res.redirect('all_appoiment');
// });

router.post('/all_appoiment', async function(req, res, next) {

  var mailid = req.body.sent;
  const email = req.body.email;
  const action = req.body.action;

  console.log("qwertyyuikjhg" + email);
  console.log("qwertyyuikjhg" + action);
  
  try {
    if(action === 'approve') {
      var allInfo = await book_appointment_model.find({pat_email: email});
  
      if (!allInfo || allInfo.length === 0) {
        console.log("Not Found");
        return res.redirect('all_appoiment');  // Redirect if no records are found
      }
  
      var patID = allInfo[0]._id;
  
      const uid = {
        _id: patID,
      };
      const upStatus = {
        status: "approve",
      };
  
      await book_appointment_model.findByIdAndUpdate(uid, upStatus);
      return res.redirect('all_appoiment');
  
    } else if(action === 'reject') {
      var allInfo = await book_appointment_model.find({pat_email: email});
  
      if (!allInfo || allInfo.length === 0) {
        console.log("Not Found");
        return res.redirect('all_appoiment');  // Redirect if no records are found
      }
  
      var patID = allInfo[0]._id;
  
      const uid = {
        _id: patID,
      };
      const upStatus = {
        status: "reject",
      };
  
      await book_appointment_model.findByIdAndUpdate(uid, upStatus);
      return res.redirect('all_appoiment');
    }

    // Remove the below res.redirect as it's unnecessary
    // res.redirect('all_appoiment');  // No need to call this outside the condition

  } catch (error) {
    next(error);  // Pass errors to the error handler middleware
  }
});

router.get('/add_patient', function(req, res, next) {
  res.render('add_patient', { title: 'Express' });
});

module.exports = router;
