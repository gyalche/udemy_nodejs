import express from 'express';
import path from 'path';
const router = express.Router();

router.post('/htmlfile', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'file.html'));
});

router.get('/', (req, res, next) => {
  res.render('index.ejs', { name: 'dawa' });
});
