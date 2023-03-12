import express from 'express';
import path from 'path';
const router = express.Router();

router.post('/htmlfile', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'file.html'));
});
