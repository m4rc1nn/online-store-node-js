const express = require('express'),
  router = express.Router(),
  database = require('../database/db')

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

router.get('/categories', (req, res) => {
  let sql = `SELECT pluralName FROM ${dbConfig.databaseNames.CATEGORIES} WHERE display=1`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.status(200).json({
      status: 200,
      categories: data
    })
  })
});

router.get('/categories/all', (req, res) => {
  let sql = `SELECT pluralName FROM ${dbConfig.databaseNames.CATEGORIES}`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.status(200).json({
      status: 200,
      categories: data
    })
  })
});


module.exports = router;