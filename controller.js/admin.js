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
    html: `<p>Please verify your email</p>`,
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
      verifyCustomer(result, res);
    })
    .catch((err) => {
      console.log(err);
    });
};

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
