var express = require('express');
var router = express.Router();
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const multer = require('multer');
const fs = require('fs');

var notifier = new WindowsBalloon({
  withFallback: false, // Try Windows Toast and Growl first?
  customPath: undefined // Relative/Absolute path if you want to use your fork of notifu
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); 
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  // fileFilter: fileFilter,
});

const book_appointment_model = require('../model/book_appointment');
const loginFailModel = require("../model/loginFail");
const doctorAccountDataModel = require("../model/doctorAccount");
const doctorBasicInformatioDataModel = require('../model/doctorBasicInformation');
const adminAccountDataModel = require("../model/adminAccount");
const adminBasicInformatioDataModel = require("../model/adminBasicInformation");
const staffAccountDataModel = require("../model/staffAccount");
const staffBasicInformatioDataModel = require("../model/staffBasicInformation");
const { log } = require('util');

// Apply middleware to all routes

/* GET users listing. */

//Extra
// router.get('/', async function(req, res, next) {

//   var profile =  req.session?.userType;
//   var parmissions = profile?.roll;

//   if(profile?.roll == 'doctor'){
//     console.log("Please select");
//     var findDocData = await doctorBasicInformatioDataModel.findOne({docEmail: profile?.email})
//   }
  
  
//   if(!profile){
//     notifier.notify(
//       {
//         title: 'Alert message',
//         message: 'Sign in First',
//         sound: true,
//         wait: true,
//         type: 'warn',
//       });
//     res.redirect('/login');
//   }

//   res.render('index', { title: 'Express', parmissions,findDocData });

// });


// Main 

//MAIN
// router.get('/', async function(req, res, next) {
//   var profile = req.session?.userType;
//   var parmissions = profile?.roll;
//   var findDocData = null; // Initialize to avoid reference errors

//   if (!profile) {
//     notifier.notify({
//       title: 'Alert message',
//       message: 'Sign in First',
//       sound: true,
//       wait: true,
//       type: 'warn',
//     });
//     return res.redirect('/login'); // Ensure execution stops after redirect
//   }

//   if (profile.roll === 'doctor') {
//     console.log("Please select");
//     findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
//   }

//   res.render('index', { title: 'Express', parmissions, findDocData });
// });

router.get('/', async function (req, res, next) {
  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('index', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    notifier.notify(
      {
        title: 'Wrong Password',
        message: 'Please Cheack your password',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/');
  }
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/login', async function(req, res, next) {
  try {
    console.log(req.body);

    const {userType, panelEmail, panelPassword} = req.body;
    
    if(userType == 'admin'){
      
      const FindData = await adminAccountDataModel.findOne({admin_email:panelEmail});

      if(FindData != null){

        if(FindData.admin_password == panelPassword){
  
          req.session.userType = {
            id: FindData._id,
            email: FindData.admin_email,
            roll : FindData.roll
          };

          res.redirect('/');

        } else {
          notifier.notify(
            {
              title: 'Wrong Password',
              message: 'Please Cheack your password',
              sound: true,
              wait: true,
              type: 'info',
            });
            return res.redirect('/login');
        }

      } else {
        notifier.notify(
          {
            title: 'Wrong Email',
            message: 'Please Cheack your Email',
            sound: true,
            wait: true,
            type: 'info',
          });
          return res.redirect('/login');
        
      }

    }

    if(userType == 'doctor'){
      const FindData = await doctorAccountDataModel.findOne({doctor_email:panelEmail});

      if(FindData != null){

        if(FindData.doctor_password == panelPassword){

          req.session.userType = {
            id: FindData._id,
            email: FindData.doctor_email,
            roll : FindData.roll
          };

          res.redirect('/');

        } else {
          notifier.notify(
            {
              title: 'Wrong Password',
              message: 'Please Cheack your password',
              sound: true,
              wait: true,
              type: 'info',
            });
            return res.redirect('/login');
        }

      } else {
        notifier.notify(
          {
            title: 'Wrong Email',
            message: 'Please Cheack your Email',
            sound: true,
            wait: true,
            type: 'info',
          });
          return res.redirect('/login');
        
      }
    }

    if(userType == 'staff'){
      
      const FindData = await staffAccountDataModel.findOne({staffemail:panelEmail});  

      if(FindData != null){

        if(FindData.staffpassword == panelPassword){

          req.session.userType = {
            id: FindData._id,
            email: FindData.staffemail,
            roll : FindData.roll
          };

          res.redirect('/');

        } else {
          notifier.notify(
            {
              title: 'Wrong Password',
              message: 'Please Cheack your password',
              sound: true,
              wait: true,
              type: 'info',
            });
            return res.redirect('/login');
        }

      } else {
        notifier.notify(
          {
            title: 'Wrong Email',
            message: 'Please Cheack your Email',
            sound: true,
            wait: true,
            type: 'info',
          });
          return res.redirect('/login');
        
      }
    }

    // req.session.user = {
    //   id: findUser[0]._id,
    //   name: findUser[0].user_name,
    //   email: findUser[0].user_email
    // };

  } catch (error) {
    console.log(error + "login ");
    
    notifier.notify(
      {
        title: 'Went Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'warn',
      });
      return res.redirect('/login');
  }
});

router.get('/book_appointment', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    const allDoctor = await doctorBasicInformatioDataModel.find();

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('book_appointment', { 
      title: 'Express', 
      allDoctor,
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
  
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
      department,
      pat_message
    } = req.body;

    if (!pat_fname || !pat_mname || !pat_lname || !pat_email ||
        !pat_dob || !pat_gender || !pat_age || !pat_mobileNumber || !pat_appointmentDate || !pat_appointmentTime || !sel_doctor || !pat_message) {
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
      department,
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
    notifier.notify(
      {
        title: 'Wrong Email',
        message: 'Please Cheack your Email',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/book_appointment');
}
});

router.get('/all_doctor', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    const findDoc = await doctorBasicInformatioDataModel.find();

    console.log("findDoc" + findDoc);

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('all_doctor', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData,
      findDoc 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }

});

router.get('/all_appoiment', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    const pat = await book_appointment_model.find();

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('all_appoiment', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData,
      pat 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }

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

router.get('/add_patient', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('add_patient', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/history', async function(req, res, next) {

  const failData = await loginFailModel.find();
  console.log(failData);

  res.render('history', { title: 'Express', failData });
});

router.get('/logout', async function(req, res, next) {

  req.session.destroy((err) => {
    if (err) {
      return notifier.notify(
        {
          title: 'Alert message',
          message: 'Log out not successfully',
          sound: true,
          wait: true,
           type: 'info' 
        });
    }
    notifier.notify(
      {
        title: 'Alert message',
        message: 'Log out successfully',
        sound: true,
        wait: true,
         type: 'info' 
      });
    res.clearCookie('connect.sid');
    return res.redirect('/login');
  });
});

router.get('/add_doctor', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('add_doctor', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }

});

router.post('/doctorAccountInformation', async function(req, res, next) {

  try {
    
    const doctorAccountData = doctorAccountDataModel({
      doctor_email: req.body.docEmail,
      doctor_password: req.body.docPassword,
      roll: "doctor"
    });

    const saveData = await doctorAccountData.save();

    console.log(saveData + "saveData");

    if(saveData){
      notifier.notify(
        {
          title: 'Success Message',
          message: 'Doctor Account Information is save',
          sound: true,
          wait: true,
          type: 'info',
        });
      res.redirect('/add_doctor');
    }
    

  } catch (error) {
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/add_doctor'); 
  }
});

router.post('/doctorBasicInformation',upload.single('doc_image'), async function(req, res, next) {

  try {

    const { docEmail } = req.body;

    const findDoc = await doctorAccountDataModel.findOne({doctor_email: docEmail});

    if(findDoc == null){
       notifier.notify(
        {
          title: 'Fail Message',
          message: 'Please Create a Doctor account',
          sound: true,
          wait: true,
          type: 'info',
        });
        fs.unlinkSync(req.file.path);
        return res.redirect('/add_doctor');
    }

    const findDocBasic = await doctorBasicInformatioDataModel.findOne({docEmail: docEmail});

      if(findDocBasic != null){
        notifier.notify(
        {
          title: 'Fail Message',
          message: 'Doc Information is taken',
          sound: true,
          wait: true,
          type: 'info',
        });
        fs.unlinkSync(req.file.path);
        return res.redirect('/add_doctor');
      }

    
    const doctorBasicInformatioDataModelData = doctorBasicInformatioDataModel({
      docID: findDoc._id,
      docFname: req.body.docFname,
      docLname: req.body.docLname,
      docDOB: req.body.docDOB,
      docGender: req.body.docGender,
      docSpeciality: req.body.docSpeciality,
      docPhone: req.body.docPhone,
      docEmail: req.body.docEmail,
      docWeb: req.body.docWeb,
      doc_image:req.file.filename,
      docText: req.body.docText,
    });
    
    const saveData = await doctorBasicInformatioDataModelData.save();

  
      notifier.notify(
      {
        title: 'Success Message',
        message: 'Docter Basic Information is saved successfully',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/add_doctor');

  } catch (error) {
    fs.unlinkSync(req.file.path);
    log.error(error.message + ": error: ");
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/add_doctor');
    next(error); 
  }
});

router.get('/addAdmin', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('addAdmin', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/adminAccountInformation', async function(req, res, next) {

  try {
    
    const adminAccountData = adminAccountDataModel({
      admin_email: req.body.admin_email,
      admin_password: req.body.admin_password,
      roll: "admin"
    });

    const saveData = await adminAccountData.save();

    console.log(saveData + "saveData");

    if(saveData){
      notifier.notify(
        {
          title: 'Success Message',
          message: 'Admin Account Information is save',
          sound: true,
          wait: true,
          type: 'info',
        });
      res.redirect('/addAdmin');
    }

  } catch (error) {
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addAdmin');
  }
});

router.post('/adminBasicInformation',upload.single('adminImage'), async function(req, res, next) {

  try {

    const { adminEmail } = req.body;

    const findadmin = await adminAccountDataModel.findOne({admin_email: adminEmail});

    console.log(findadmin + "findadmin");
    

    if(findadmin == null){
       notifier.notify(
        {
          title: 'Fail Message',
          message: 'Please Create a Doctor account',
          sound: true,
          wait: true,
          type: 'info',
        });
        fs.unlinkSync(req.file.path);
        return res.redirect('/addAdmin');
    }
  
    const findAdminBasic = await adminBasicInformatioDataModel.findOne({adminEmail: adminEmail});

      if(findAdminBasic != null){
        notifier.notify(
        {
          title: 'Fail Message',
          message: 'Doc Information is taken',
          sound: true,
          wait: true,
          type: 'info',
        });
        fs.unlinkSync(req.file.path);
        return res.redirect('/add_doctor');
      }

    
    const adminBasicInformatioDataModelData = adminBasicInformatioDataModel({
      adminID: findadmin._id,
      adminFname: req.body.adminFname,
      adminLname: req.body.adminLname,
      adminDOB: req.body.adminDOB,
      adminGender: req.body.adminGender,
      adminSpeciality: req.body.adminSpeciality,
      adminPhone: req.body.adminPhone,
      adminEmail: req.body.adminEmail,
      adminWeb: req.body.adminWeb,
      adminImage:req.file.filename,
      adminText: req.body.docText,
    });
    
    const saveData = await adminBasicInformatioDataModelData.save();

    console.log(saveData + "saveData");
    
  
      notifier.notify(
      {
        title: 'Success Message',
        message: 'Docter Basic Information is saved successfully',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addAdmin');

  } catch (error) {
    fs.unlinkSync(req.file.path);
    console.error(error.message + ": error: ");
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addAdmin');
    next(error); 
  }
});

router.get('/addStaff', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('addStaff', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    notifier.notify(
      {
        title: 'Wrong Email',
        message: 'Please Cheack your Email',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addStaff');
  }
});

router.post('/staffAccountInformation', async function(req, res, next) {

  try {
    
    const staffAccountData = staffAccountDataModel({
      staffemail: req.body.staffEmail,
      staffpassword: req.body.staffPassword,
      roll: "staff"
    });

    const saveData = await staffAccountData.save();

    console.log(saveData + "saveData");

    if(saveData){
      notifier.notify(
        {
          title: 'Success Message',
          message: 'Staff Account Information is save',
          sound: true,
          wait: true,
          type: 'info',
        });
      res.redirect('/addStaff');
    }

  } catch (error) {
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addStaff');
  }
});

router.post('/staffBasicInformation',upload.single('staffimage'), async function(req, res, next) {

  try {

    const { staffEmail } = req.body;

    const findstaff = await staffAccountDataModel.findOne({staffemail: staffEmail});

    console.log(findstaff + "findstaff");
    

    if(findstaff == null){
       notifier.notify(
        {
          title: 'Fail Message',
          message: 'Please Create a staff account',
          sound: true,
          wait: true,
          type: 'info',
        });
        fs.unlinkSync(req.file.path);
        return res.redirect('/addStaff');
    }
  
    const findStaffBasic = await staffBasicInformatioDataModel.findOne({staffEmail: staffEmail});

      if(findStaffBasic != null){
        notifier.notify(
        {
          title: 'Fail Message',
          message: 'Staff Information is taken',
          sound: true,
          wait: true,
          type: 'info',
        });
        fs.unlinkSync(req.file.path);
        return res.redirect('/addStaff');
      }

    
    const staffBasicInformatioDataModelData = staffBasicInformatioDataModel({
      staffID: findstaff._id,
      staffFname: req.body.staffFname,
      staffLname: req.body.staffLname,
      staffDOB: req.body.staffDOB,
      staffGender: req.body.staffGender,
      staffSpeciality: req.body.staffSpeciality,
      staffPhone: req.body.staffPhone,
      staffEmail: req.body.staffEmail,
      staffWeb: req.body.staffWeb,
      staffImage:req.file.filename,
      staffText: req.body.staffText,
    });
    
    const saveData = await staffBasicInformatioDataModelData.save();

    console.log(saveData + "saveData");
    
  
      notifier.notify(
      {
        title: 'Success Message',
        message: 'Staff Basic Information is saved successfully',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addStaff');

  } catch (error) {
    console.log(req.file.path + "sdsdsdsdsds");
    fs.unlinkSync(req.file.path);
    
    console.error(error.message + ": error: ");
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/addStaff');
  }
});

router.get('/all_staff', async function (req, res, next) {
  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    const findStaff = await staffBasicInformatioDataModel.find();

    console.log( findStaff + " findStaff ");
    
    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('all_staff', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData,
      findStaff 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    notifier.notify(
      {
        title: 'Wrong Email',
        message: 'Please Cheack your Email',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/login');
  }
});

router.get('/viewProfileDoc', async function (req, res, next) {
  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      // console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      // console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      // console.log(findStaffData + "findStaffData");
    }

    let docId = req.query.id;
    const DocProfie = await doctorBasicInformatioDataModel.findOne({ _id: docId})
    
    res.render('viewProfileDoc', { 
      title: 'Express', 
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData,
      DocProfie 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    notifier.notify(
      {
        title: 'Wrong Email',
        message: 'Please Cheack your Email',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/viewProfileDoc');
  }
});

router.get('/updateBookAppointment', async function(req, res, next) {

  var profile = req.session?.userType;
  var permissions = profile?.roll; // ✅ Corrected 'roll' to 'role'
  var findDocData = null;
  var findAdminData = null;
  var findStaffData = null;
  let patID = req.query.id;

  console.log(permissions + "permissions");

  if (!profile) {
    notifier.notify({
      title: 'Alert message',
      message: 'Sign in First',
      sound: true,
      wait: true,
      type: 'warn',
    });
    return res.redirect('/login'); 
  }

  try {

    const allDoctor = await doctorBasicInformatioDataModel.find();
    const findPAT = await book_appointment_model.findOne({_id: patID});
    

    if (profile.roll === 'doctor') {
      findDocData = await doctorBasicInformatioDataModel.findOne({ docEmail: profile.email });
      console.log(findDocData + "findDocData");
    } else if (profile.roll === 'admin') {
      findAdminData = await adminBasicInformatioDataModel.findOne({ adminEmail: profile.email });
      console.log(findAdminData + "findAdminData");
    } else if (profile.roll === 'staff') {
      findStaffData = await staffBasicInformatioDataModel.findOne({ staffEmail: profile.email });
      console.log(findStaffData + "findStaffData");
    }

    res.render('updateBookAppointment', { 
      title: 'Express',
      findPAT,
      allDoctor,
      permissions,  
      findDocData, 
      findAdminData, 
      findStaffData 
    });


  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
  
});

router.post('/updatePatient', async function(req, res, next) {


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
      department,
      pat_message,
    } = req.body;

    if (!pat_fname || !pat_mname || !pat_lname || !pat_email ||
      !pat_dob || !pat_gender || !pat_age || !pat_mobileNumber || !pat_appointmentDate || !pat_appointmentTime || !sel_doctor || !pat_message) {
      notifier.notify({
          title: 'Book Appointment',
          message: 'All fields are required',
          sound: true,
          wait: true,
          type: 'info',
          gravity: "center", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
      });
      return res.redirect('/updatePatient');

    }

    const findData = await book_appointment_model.find({pat_email : pat_email});

    const UpdateData = await book_appointment_model.findByIdAndUpdate({_id : findData[0]._id},{
      pat_fname : pat_fname,
      pat_mname : pat_mname,
      pat_lname : pat_lname,
      pat_dob : pat_dob,
      pat_gender : pat_gender,
      pat_age : pat_age,
      pat_mobileNumber : pat_mobileNumber,
      pat_appointmentDate : pat_appointmentDate,
      pat_appointmentTime : pat_appointmentTime,
      sel_doctor : sel_doctor,
      department : department,
      pat_message : pat_message,
    },{new: true})

    if(UpdateData){

      notifier.notify(
        {
          title: 'Success',
          message: 'Data Update successfull',
          sound: true,
          wait: true,
          type: 'info',
        });
        return res.redirect('/all_appoiment');

    } else {

      notifier.notify(
        {
          title: 'Wrong',
          message: 'Somthing went wrong',
          sound: true,
          wait: true,
          type: 'info',
        });
        return res.redirect('/all_appoiment');

    }
    
  } catch (error) {
    
    notifier.notify(
      {
        title: 'Wrong',
        message: 'Somthing Went Wrong',
        sound: true,
        wait: true,
        type: 'info',
      });
      return res.redirect('/login');
  }
});


module.exports = router;
