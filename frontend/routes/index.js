var express = require('express');
var router = express.Router();
const storage = require('node-persist');
var nodemailer = require('nodemailer');
const WindowsBalloon = require('node-notifier').WindowsBalloon;

var notifier = new WindowsBalloon({
  withFallback: false, 
  customPath: undefined 
});


const signUpModel = require('../model/signUp');
const book_appointment_model = require('../model/book_appointment');

// emialKey == bnrv hcsh xtnx mzwz

/* GET home page. */
router.get('/', async function(req, res, next){
  res.render('index', { title: 'Express' });
});

router.get('/index',async function(req, res, next){

  notifier.notify(
    {
      title: 'Information message',
      message: 'If you bok apoiment than first login ',
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

    res.render('home', { profile});

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

    const findUser = await signUpModel.find({ user_email: user_email });

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
      //             // Save or handle the OTP as needed, e.g., store it in the database for verification
      //         }
      //     });
      // } else {
      //     res.send('Please check your email ID');
      // }
      

        // req.flash('message', 'Login successful');
        // res.redirect('/home');
        
        res.redirect('/otp');

      } else {
    
        notifier.notify(
          {
            title: 'Alert message',
            message: 'Wrong username or password',
            sound: true,
            wait: true,
             type: 'info' 
          });
        res.redirect('/sign_in');
      }
    } else {
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
      return res.json({ success: false, message: 'Please enter Name' });
    } else if(!user_email){
      return res.json({ success: false, message: 'Please enter Email' });
    } else if(!user_password){
      return res.json({ success: false, message: 'Please enter Password' });
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
        sel_department,
        pat_message,
        appoiment_mode:'online'
      };

      // Save to database
      const patData = await book_appointment_model.create(obj);
      console.log(patData);

      return res.redirect('/home'); // Ensure no further response is sent
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;