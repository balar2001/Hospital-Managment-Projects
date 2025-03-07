var express = require('express');
var router = express.Router();
const storage = require('node-persist');
var nodemailer = require('nodemailer');
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const axios = require("axios");

var notifier = new WindowsBalloon({
  withFallback: false, 
  customPath: undefined 
});


const signUpModel = require('../model/signUp');
const book_appointment_model = require('../model/book_appointment');
const loginFailModel = require('../model/loginFail');
const doctorBasicInformatioDataModel = require('../model/doctorBasicInformation');

// emialKey == bnrv hcsh xtnx mzwz

/* GET home page. */
router.get('/', async function(req, res, next){
  res.render('index', { title: 'Express' });
});

router.get('/index',async function(req, res, next){

  notifier.notify(
    {
      title: 'Information message',
      message: 'If you book apoiment than first login ',
      sound: true,
      wait: true,
      type: 'info',
      
    });

  res.render('index', { title: 'Express'});

});

router.get('/home', async function(req, res, next){

  try {

    var profile =  req.session?.user?.name;
    console.log("Session Data:", profile);

    const allDoctor = await doctorBasicInformatioDataModel.find();

    if(!profile){
      notifier.notify(
        {
          title: 'Alert message',
          message: 'Sign in First',
          sound: true,
          wait: true,
          type: 'warn', //info | warn | error
        });
      
      res.redirect('/sign_in');
    }

    res.render('home', { profile, allDoctor });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/sign_in', async function(req, res, next){
  // res.render('sign_in', { message: req.flash('message') });
  res.render('sign_in');
});

router.post('/sign_in', async function(req, res, next){
  try {
    await storage.init();
    const { user_email, user_password } = req.body;

    if(!user_email){
      return notifier.notify(
        {
          title: 'Alert message',
          message: 'Please enter Email',
          sound: true,
          wait: true,
          type: 'error', 
        });
    } else if(!user_password){
      return notifier.notify(
        {
          title: 'Alert message',
          message: 'Please enter Password',
          sound: true,
          wait: true,
          type: 'error', 
        });
    }

    const findUser = await signUpModel.find({ user_email: user_email })

    if (findUser.length > 0) {
      if (findUser[0].user_password == user_password) {
        await storage.setItem('user_name', findUser[0].user_name);
        await storage.setItem('user_id', findUser[0]._id);
        var otp = Math.floor(100000 + Math.random() * 900000);
        await storage.setItem('loginOtp', otp);
        req.session.otp = otp;
        console.log(otp);
        req.session.user = {
          id: findUser[0]._id,
          name: findUser[0].user_name,
          email: findUser[0].user_email
        };
        
      //email
      // if (findUser !== '') {
      //     var nodemailer = require('nodemailer');
      
      //     var transporter = nodemailer.createTransport({
      //         service: 'gmail',
      //         auth: {
      //             user: '24ic03ca037@ppsu.ac.in',
      //             pass: 'bnrv hcsh xtnx mzwz'
      //         }
      //     });
      
      //     var mailOptions = {
      //         from: '24ic03ca037@ppsu.ac.in',
      //         to: user_email,
      //         subject: 'Oreo Hospital Management - Login Verification',
      //         html: `
      //         <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      //             <header style="text-align: center; background-color: #04CFD1; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
      //                 <h1>Oreo Hospital Management</h1>
      //             </header>
      //             <main style="padding: 20px;">
      //                 <h2 style="color: #4CAF50;">Login Verification</h2>
      //                 <p>Dear ${findUser.user_name},</p>
      //                 <p>We received a login request for your account. Please use the following OTP to verify your identity:</p>
      //                 <div style="text-align: center; margin: 20px 0;">
      //                     <span style="font-size: 24px; font-weight: bold; color: #04CFD1;">${otp}</span>
      //                 </div>
      //                 <p>The OTP is valid for the next 10 minutes. If you did not request this login, please ignore this email or contact us immediately.</p>
      //             </main>
      //             <footer style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #555;">
      //                 <p>Thank you for choosing Oreo Hospital Management.</p>
      //                 <p>&copy; ${new Date().getFullYear()} Oreo Hospital Management. All rights reserved.</p>
      //             </footer>
      //         </div>
      //         `
      //     };
      
      //     transporter.sendMail(mailOptions, function (error, info) {
      //         if (error) {
      //             console.log(error);
      //         } else {
      //             console.log('Email sent: ' + info.response);
      //         }
      //     });
      // } else {
      //     res.send('Please check your email ID');
      // }
        
        res.redirect('/otp');

      } else {

        const getIP = async (req) => {
          let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
          if (ip === "::1" || ip === "127.0.0.1") {
            try {
              const response = await axios.get("https://api64.ipify.org?format=json");
              return response.data.ip;
            } catch (error) {
              console.error("Error fetching public IP:", error);
              return "UNKNOWN";
            }
          }
          return ip;
        };
  
        const getLocationData = async (ip) => {
          try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            return response.data;
          } catch (error) {
            console.error("Error fetching location data:", error);
            return null;
          }
        };
  
        const ip = await getIP(req);  // Ensure we get the correct public IP
        const locationData = await getLocationData(ip);
  
        console.log("locationData" + JSON.stringify(locationData));
  
        const loginFailModelData = loginFailModel({
          ip,
          country: locationData?.country || "Unknown",
          city: locationData?.city || "Unknown",
          region: locationData?.regionName || "Unknown",
          isp: locationData?.isp || "Unknown",
          user_email : user_email,
          user_password : user_password,
          error: "Wrong password"
        });
  
        await loginFailModelData.save();

        notifier.notify(
          {
            title: 'Alert message',
            message: 'Wrong password',
            sound: true,
            wait: true,
            type: 'info' 
          });
        return res.redirect('/sign_in');
      }
    } else {

      const getIP = async (req) => {
        let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        if (ip === "::1" || ip === "127.0.0.1") {
          try {
            const response = await axios.get("https://api64.ipify.org?format=json");
            return response.data.ip;
          } catch (error) {
            console.error("Error fetching public IP:", error);
            return "UNKNOWN";
          }
        }
        return ip;
      };

      const getLocationData = async (ip) => {
        try {
          const response = await axios.get(`http://ip-api.com/json/${ip}`);
          return response.data;
        } catch (error) {
          console.error("Error fetching location data:", error);
          return null;
        }
      };

      const ip = await getIP(req);  // Ensure we get the correct public IP
      const locationData = await getLocationData(ip);

      console.log("locationData" + JSON.stringify(locationData));

      const loginFailModelData = loginFailModel({
        ip,
        country: locationData?.country || "Unknown",
        city: locationData?.city || "Unknown",
        region: locationData?.regionName || "Unknown",
        isp: locationData?.isp || "Unknown",
        user_email : user_email,
        user_password : user_password,
        error: "Wrong username"
      });

      await loginFailModelData.save();

      notifier.notify(
        {
          title: 'Alert message',
          message: 'Wrong username',
          sound: true,
          wait: true,
          type: 'info' 
        });

      res.redirect('/sign_in'); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/sign_up', async function(req,res,next){
  res.render('sign_up',{title: 'Sign In'})
});

router.post('/sign_up',async function(req,res,next){

  try {

    const { user_name, user_email, user_password } = req.body;

    if(!user_name){
      return notifier.notify(
        {
          title: 'Alert message',
          message: 'Please enter Name',
          sound: true,
          wait: true,
          type: 'error', 
        });
    } else if(!user_email){
      return notifier.notify(
        {
          title: 'Alert message',
          message: 'Please enter Email',
          sound: true,
          wait: true,
          type: 'error', 
        });
    } else if(!user_password){
      return notifier.notify(
        {
          title: 'Alert message',
          message: 'Please enter Password',
          sound: true,
          wait: true,
          type: 'error', 
        });
    }

    const findUser = await signUpModel.find({ user_email: user_email});

    if(findUser == ''){

      var obj = {

        user_name: req.body.user_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
      }

      const data = await signUpModel.create(obj);

      console.log(data);

      if (data !== '') {
        var nodemailer = require('nodemailer');
    
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '24ic03ca037@ppsu.ac.in',
                pass: 'bnrv hcsh xtnx mzwz'
            }
        });
    
        var mailOptions = {
            from: '24ic03ca037@ppsu.ac.in',
            to: user_email,
            subject: 'Welcome to Oreo Hospital Management',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <header style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
                    <h1>Oreo Hospital Management</h1>
                </header>
                <main style="padding: 20px;">
                    <h2 style="color: #4CAF50;">Account Successfully Created</h2>
                    <p>Dear ${user_name},</p>
                    <p>Welcome to Oreo Hospital Management! We're thrilled to have you on board. Your account has been successfully created and is now ready to use.</p>
                    <p>If you have any questions or need assistance, feel free to reach out to us anytime.</p>
                </main>
                <footer style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #555;">
                    <p>Thank you for choosing Oreo Hospital Management.</p>
                    <p>&copy; ${new Date().getFullYear()} Oreo Hospital Management. All rights reserved.</p>
                </footer>
            </div>
            `
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
      } else {
          res.send('Please check your email ID');
      }
    

      res.redirect('sign_in')

    } else {
      return res.json({ success: false, message: 'User Already Exist' });
    }

  } catch (error) {

    console.error(error);
    res.status(500).send('Internal Server Error'); 
    
  }

})

router.get('/logout',async function(req,res){
  req.session.destroy((err) => {
    if (err) {
      // console.error("Error destroying session:", err);
      // return res.status(500).send("Error logging out"); 
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
    return res.redirect('/sign_in');
  });

})


router.get('/otp',async function(req, res, next){
  res.render('otp');
});

router.post('/otp',async function(req, res, next){
  try {

    const {user_otp} = req.body;
    const otp = await storage.getItem('loginOtp');
    if(user_otp == otp){
      res.redirect('/home');
    } else {
      res.redirect('/otp');
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error'); 
  }
});

router.get('/appoiment', async function(req, res, next){
  res.render('appoiment', { title: 'Express' });
});

router.get('/appoiment', async function(req, res, next){
  res.render('appoiment', { title: 'Express' });
});

router.get('/book_appointment',async function(req,res){
  res.redirect('/home')
})

router.post('/book_appointment', async function(req, res) {
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
          !pat_dob || !pat_gender || !pat_age || !pat_mobileNumber || !pat_appointmentDate || !pat_appointmentTime || !sel_doctor  || !pat_message) {
          return notifier.notify({
              title: 'Book Appointment',
              message: 'All fields are required',
              sound: true,
              wait: true,
              type: 'info',
              gravity: "center",
              position: "center",
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
              return res.redirect('/home'); // Ensure further processing stops
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
        appoiment_mode:'online'
      };


      let fname = obj.pat_fname.toString();
      let mname = obj.pat_mname.toString();
      let lame = obj.pat_lname.toString();
      let email = obj.pat_email.toString();
      let mobileNumber = obj.pat_mobileNumber.toString();
      let appointmentTime = obj.pat_appointmentTime.toString();
      let doctor = obj.sel_doctor.toString();
      let seldepartment = obj.department.toString();

      const patData = await book_appointment_model.create(obj);

      // if (patData !== '') {
      //   var nodemailer = require('nodemailer');
    
      //   var transporter = nodemailer.createTransport({
      //       service: 'gmail',
      //       auth: {
      //           user: '24ic03ca037@ppsu.ac.in',
      //           pass: 'bnrv hcsh xtnx mzwz'
      //       }
      //   });
    
      // var mailOptions = {
      //     from: '24ic03ca037@ppsu.ac.in',
      //     to: email,
      //     subject: 'Appointment Confirmation - Oreo Hospital',
      //     html: `
      //     <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      //         <header style="text-align: center; background-color: #04CFD1; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
      //             <h1>Oreo Hospital</h1>
      //             <p>Your Health, Our Priority</p>
      //         </header>
      //         <main style="padding: 20px;">
      //             <h2 style="color: #04CFD1;">Appointment Confirmed</h2>
      //             <p>Dear <strong>${fname} ${mname} ${lame}</strong>,</p>
      //             <p>Your appointment has been successfully booked with the following details:</p>
      //             <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
      //                 <p><strong>Doctor:</strong> ${doctor}</p>
      //                 <p><strong>Department:</strong> ${department}</p>
      //                 <p><strong>Appointment Date & Time:</strong> ${appointmentTime}</p>
      //                 <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
      //                 <p><strong>Email:</strong> ${email}</p>
      //             </div>
      //             <p>If you have any questions, please contact our support team.</p>
      //             <p>We look forward to serving you!</p>
      //         </main>
      //         <footer style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #555;">
      //             <p>Thank you for choosing Oreo Hospital.</p>
      //             <p>&copy; ${new Date().getFullYear()} Oreo Hospital. All rights reserved.</p>
      //         </footer>
      //     </div>
      //     `
      // };
      
    
      //   transporter.sendMail(mailOptions, function (error, info) {
      //       if (error) {
      //           console.log(error);
      //       } else {
      //         notifier.notify({
      //           title: 'Book Appointment',
      //           message: 'Appointment Sent Successfully',
      //           sound: true,
      //           wait: true,
      //           type: 'info'
      //           });
      //           console.log('Email sent: ' + info.response);
      //       }
      //   });
      // } else {
      //     res.send('Please check your email ID');
      // }

      //
      
      notifier.notify({
          title: 'Book Appointment',
          message: 'Appointment Sent Successfully',
          sound: true,
          wait: true,
          type: 'info'
      });

      console.log(patData);

      return res.redirect('/home');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/services',async function(req,res){
  res.render('services')
})

router.get('/departments',async function(req,res){
  res.render('departments')
})

router.get('/forgotPassword',async function(req,res){
  res.render('forgotPassword')
})

router.post('/forgotPassword', async function(req, res) {
  try {
    await storage.init();
    const { userEmail } = req.body;
    const findMail = await signUpModel.find({ user_email: userEmail });

    if (findMail.length === 0) {
      notifier.notify({
        title: 'Alert message',
        message: 'Email not found',
        sound: true,
        wait: true,
        type: 'error' 
      });

      return res.redirect('/sign_in');
    } else {

      var Forgototp = Math.floor(100000 + Math.random() * 900000);

      req.session.Forgotpass = {
        Forgototp: Forgototp,
        userEmail: userEmail,
      };
      // await storage.setItem('otpForForgot', Forgototp);
      // await storage.setItem('userMailID', userEmail);
      console.log(Forgototp);
      return res.redirect('/otpForgot');
    }


  } catch (error) {
    console.error("Error in forgotPassword route:", error);
    res.status(500).send("Internal Server Error"); // Handle errors properly
  }
});

router.get('/otpForgot',async function(req,res){
  res.render('otpForgot')
})

router.post('/otpForgot',async function(req,res){
  try {
    await storage.init();
    const {user_otp}= req.body;
    // const otpForForgot = await storage.getItem('otpForForgot');
    var Forgototp =  req.session?.Forgotpass?.Forgototp;
    console.log("req.session?.Forgotpass?.Forgototp " + Forgototp);
    if(!Forgototp){
      return res.redirect('/forgotPassword');
    }

    if(Forgototp == user_otp){
      notifier.notify({
        title: 'Alert message',
        message: 'OTP Match',
        sound: true,
        wait: true,
        type: 'info' 
      });
      return res.redirect('/resetPassword');
    } else {
      notifier.notify({
        title: 'Alert message',
        message: 'OTP not match please check',
        sound: true,
        wait: true,
        type: 'error' 
      });
      return res.redirect('/forgotPassword');
    }
  } catch (error) {
    console.error("Error in forgotPassword route:", error);
    res.status(500).send("Internal Server Error"); 
  }
  
})

router.get('/resetPassword',async function(req,res){
  res.render('resetPassword')
})

router.post('/resetPassword',async function(req,res){
  try {
    await storage.init()
    const { newPass, rePass} = req.body;

    if(newPass !== rePass){
      notifier.notify({
        title: 'Alert message',
        message: 'Password Not Match Please Check',
        sound: true,
        wait: true,
        type: 'error' 
      });
      return res.redirect('/forgotPassword'); 
    }

    var userEmail =  req.session?.Forgotpass?.userEmail;
    console.log("req.session?.Forgotpass?.userEmail " + userEmail);
    

    if(!userEmail){
      notifier.notify({
        title: 'Alert message',
        message: 'Please ReVerify',
        sound: true,
        wait: true,
        type: 'error' 
      });
      return res.redirect('/forgotPassword');
    }

    const findUser = await signUpModel.find({ user_email: userEmail});
    
    const updateUserPassword = await signUpModel.findByIdAndUpdate(
      {_id:findUser[0]._id },
      {user_password: newPass},
      {new: true}
    );

     if(updateUserPassword){
        notifier.notify({
          title: 'Alert message',
          message: 'Password Update successfully',
          sound: true,
          wait: true,
          type: 'info' 
        });
        return res.redirect('/sign_in');
     } else {
      notifier.notify({
        title: 'Alert message',
        message: 'Password Not Update',
        sound: true,
        wait: true,
        type: 'error' 
      });
      return res.redirect('/forgotPassword');
     }
      
  
  } catch (error) {
    console.error("Error in forgotPassword route:", error);
    res.status(500).send("Internal Server Error");
  }
})

router.get('/loginHeader',async function(req,res){
  res.render('loginHeader')
})

router.get('/navbar',async function(req,res){
  res.render('navbar')
})

router.get('/doctors',async function(req,res){
  res.render('doctors')
})

router.get('/blog',async function(req,res){
  res.render('blog')
})

router.get('/blogDetail',async function(req,res){
  res.render('blogDetail')
})
router.get('/about',async function(req,res){
  res.render('about')
})

router.get('/faq',async function(req,res){
  res.render('faq')
})

router.get('/galary',async function(req,res){
  res.render('galary')
})

router.get('/pricelist',async function(req,res){
  res.render('pricelist')
})

router.get('/contact',async function(req,res){
  res.render('contact')
})


module.exports = router;