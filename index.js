import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './utils/database.js';
import userVerification from './models/userVerification.js';

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', 'views');

app.use('/addProduct', (req, res, next) => {
  res.send(
    '<form action="/product" method="/post"><input type="text" name="title"><button style="color:blue" type="submit">Add Product</button></form>'
  );
});
app.use('/product', (req, res, next) => {
  console.log(req.body);
  res.redirect('/');
});
app.use('/', (req, res, next) => {
  res.send('<h1>Don</h1>');
});

const PORT = 5000;
sequelize
  .sync()
  .then((data) => {
    app.listen(PORT, () => {
      console.log(`server is listening to port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
