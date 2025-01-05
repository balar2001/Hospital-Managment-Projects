var express = require('express');
var router = express.Router();
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
