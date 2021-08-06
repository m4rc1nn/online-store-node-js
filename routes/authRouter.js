const express = require('express'),
  router = express.Router(),
  database = require('../database/db'),
  tokenController = require('../controllers/tokenController');

const db = database.db;
const dbConfig = database.config;

router.use((req, res, next) => {
  if(!dbConfig.isConnect){
    res.status(500).json({
      status: 500,
      message: 'No database connection.',
    })
    return;
  }
  next();
}) 

router.post('/login', (req, res) => {
  let sql = `SELECT * FROM ${dbConfig.databaseNames.AUTH} WHERE username = ? AND password = ?`;
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) throw err;
    if(data.length <= 0) {
        res.status(404).json({
          status: 404,
          message: 'User not found.'
        });
        return;
    }
    res.status(200).json({
      status: 200,
      message: 'Succesfull login.',
      token: tokenController.createToken(data[0].id)
    })
  })
});

router.post('/verify', async (req, res) => {
  let sql = `SELECT username FROM ${dbConfig.databaseNames.AUTH} WHERE id = ?`;
  const token = await tokenController.decodeToken(req.body.token);
  if(token == null) {
    res.status(404).json({
      status: 404,
      message: 'User not found.'
    })
    return;
  }
  db.query(sql, [token], (err, data) => {
    if(err) throw err;
    if(data.length <= 0){
      res.status(404).json({
        status: 404,
        message: 'User not found.'
      })
      return;
    }
    res.status(200).json({
      status: 200,
      message: 'User has been found.'
    })
  })
})

module.exports = router;