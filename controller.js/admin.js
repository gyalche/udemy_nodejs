import Product from '../models/product';
import UserVerification from '../models/userVerification.js';
import dotenv from 'dotenv';
//nodemailer;
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import userVerication from '../models/userVerification.js';
dotenv.config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

//testing success;
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log(success);
  }
});

const verifyCustomer = ({ _id, email }, res) => {
  //html link;
  const currentUrl = 'http://localhost:8080/userVerification';
  //unique string;
  const uniqueString = uuidv4() + _id;
  //mail options;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Verify your email',
    html: `<p>Please verify your email</p> <a href=${currentUrl} + user/verify/ + _id  + / uniqueString}>here</a>`,
  };

  //hash the unique string;
  const salt = new genSalt(10);
  bcrypt.hash(uniqueString, salt).then((hashedString) => {
    //set values in user verification collection;
    const newVerification = new UserVerification({
      userId: _id,
      uniqueString: hashedString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    });
    newVerification
      .save()
      .then(() => {
        transporter
          .sendMail(mailOptions)
          .then(() => {
            //email send and verification record saved;
            res.json({
              status: 'PENDING',
              message: 'email sent for verification',
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
router.get('/verify/:userId/:uniqueString', (req, res) => {
  let { userId, uniqueString } = req.params;
  userVerication.find({ userId }).then((result) => {
    if (result.length > 0) {
      console.log(result);
      //user verification exist so we passed;
      //now check if it expired or not;
      const { expiredAt } = result[0];
      const hashedUniqueString = result[0].uniqueString;
      if (expiredAt < Date.now()) {
        //record has expired and now delete it;
        userVerication
          .deleteOne({ userId })
          .then((result) => {
            user
              .deleteOne({ _id: userId })
              .then((result) => {})
              .catch((err) => {
                console.log('error', err);
              });
          })
          .catch((err) => {
            let message = 'verication is expired';
            res.redirect(`user/verified/error=true&message=${message}`);
          });
      } else {
        //when user verification is not expired;
        //compare the hashed unique string;
        bcrypt
          .compare(uniqueString, hashedUniqueString)
          .then((result) => {
            if (result) {
              //string matches
              User.updateOne({ _id: userId }, { verified: true })
                .then(() => {
                  UserVerification.deleteOne({ _id: userId }).then(() => {
                    res.sendFile(
                      path.join(__dirname, 'views/userVerified.html')
                    );
                  });
                })
                .catch();
            } else {
              let message = 'invalid verification passed, check your inbox';
              res.redirect(`user/verified/error=true&message=${message}`);
            }
          })
          .catch(() => {
            let message = 'error occured while comparing unique string';
            res.redirect(`/user/verification/error=true&message=${message}`);
          });
      }
    }
  });
});
const AppProduce = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  Product.create({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
  })
    .then((result) => {
      // verifyCustomer(result, res);
      sendOTPVerificationEmail(result, res);
    })
    .catch((err) => {
      console.log(err);
    });
};

//reset password;
router.post('/resetPassword', (req, res) => {
  let { userId, resetString, newPassword } = req.body;
  PasswordReset.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        //password reset record exist;
        //check if password reset record expired or not;
        const { expiredAt } = result[0];
        const hashedString = result[0].uniqueString();
        if (expiredAt < Date.now()) {
          // it is expired;
          PasswordRest.deleteOne({ userId })
            .then(() => {
              //Reset password deleted successfully;
              res.json({
                status: 'FAILED',
                message: 'password reset link has expired',
              });
            })
            .catch(() => {});
        }
      } else {
        //valid reset string exist so we validate the rest string;
        //first compare the hashed string;
        bcrypt
          .compare(resetString, hashedString)
          .then((result) => {
            //password matches hash password again;
            const hashed = 10;
            const hashedPassword = bcrypt.hash(newPassword, hashed);
            User.updateOne({ _id: userId }, { password: hashedPassword })
              .then(() => {
                //delte password reset module
                PasswordReset.deleteOne({ userId });
              })
              .catch(() => {});
          })
          .catch(() => {
            res.json({
              status: 'FAILED',
              message: 'invalid password reset details  passed',
            });
          });
      }
    })
    .catch();
});

//otp verification email;
const sendOTPVerificationEmail = async ({ email, _id }, res) => {
  try {
    const otp = Math.floor(1000 + math.random() * 9000);
    //mail options;
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'verify email',
      html: `<p>Enter ${otp} to verify your email address</p>`,
    };

    //hash the opt;
    const saltRounds = 10;
    const hashedOTP = bcrypt.hash(otp, saltRounds);
    const newOtpVerification = await new UserOTPVerification({
      userId: _id,
      opt: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    //save otp;
    await newOtpVerification.save();
    transporter.sendMail(mailOptions).then(() => {
      res.status({
        status: 'PENDING',
        message: 'otp send sucessfully',
        data: {
          userId: _id,
          email,
        },
      });
    });
  } catch (error) {
    res.json({
      status: 'FAILED',
    });
  }
};

//verify otp email;
router.post('/verifyotp', async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId && !otp) {
      throw Error('empty userid and otp is not allowed');
    
      
    }else{
        await UserOTPVerification.find({ userId }).then((result) => {
        if (result.length > 0) {
          //verification exists;
          //now check if it expires or not;
          const { expiredAt } = result[0].expiredAt;
          const hashedOtp = result[0].otp;
          if (expiredAt < Date.now()) {
            //it means it is expired;
            UserOTPVefication.deleteOne({ userId }).then(() => {
              throw new Error('Code has expired');
            });
          } else {
            const validOTP = bcrypt.compare(otp, hashedOtp);
            if (!validOTP) {
              throw new Error('invalid otp');
            } else {
              User.updateOne({ _id: userId }, { verified: true });
              OtpVerification.deleteOne({ userId });
              res.json({
                status: 'SUCCESS',
                message: 'User email verified successfully',
              });
            }
          }
        }
      }
    }
  } catch (error) {}
});

//resent verification;
router.post('/resendverification', async (req, res) => {
  try {
    let { userId, email } = req.body;
    if (!userId || !email) {
      throw new Error('cannot send empty');
    } else {
      //delete existing;
      await OTPVerification.deleteOne({ userId });
      sendOTPVerificationEmail({ _id, email }, res);
    }
  } catch (error) {}
});

// const [seviceList, setServceList] = useState([{ service: '' }]);
// {serviceList.length-1===index && show the add button}
// {serviceList.length > 1 && show the remove button}

// const handleAddSubCategory = (e) => {
//   setSubCategory([...subCategory, { service: "" }]);
// };

// const handleRemoveSubCategory = (index) => {
//   const list = [...subCategory];
//   list.splice(index, 1);
//   setSubCategory(list);
// };

// const handleChangeSubCategory = (e, index) => {
//   const { name, value } = e.target;
//   const list = [...subCategory];
//   list[index][name] = value;
//   serSubCategory(list);
// };
