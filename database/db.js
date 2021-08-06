const mysql = require('mysql');

const config = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: '',
    DATABASE: 'mk-shop',
    databaseNames: {
      AUTH: 'administrators',
      PRODUCTS: 'products',
      DISCOUNT: 'discounts_products',
      SIZES: 'sizes',
      CATEGORIES: 'categories',
      IMAGES: 'images'
    },
    isConnect: false
};

const db = mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE
});

db.connect(error => {
  if(error){
    config.isConnect = false;
    return console.log('No database connection.');
  } else {
      config.isConnect = true;
      return console.log('Database connected successful.');
  }
  console.log(config.isConnect);
})

module.exports = {
  db: db,
  config: config
};