const express = require('express'),
  router = express.Router(),
  database = require('../database/db'),
  scraper = require('aliexpress-product-scraper');

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

router.get('/products', (req, res) => {
  let sql = `SELECT ${dbConfig.databaseNames.PRODUCTS}.id, ${dbConfig.databaseNames.PRODUCTS}.name, ${dbConfig.databaseNames.PRODUCTS}.description, ${dbConfig.databaseNames.PRODUCTS}.price, ${dbConfig.databaseNames.PRODUCTS}.brand, IFNULL(${dbConfig.databaseNames.DISCOUNT}.discountPrice, 0) AS discountPrice, ${dbConfig.databaseNames.IMAGES}.imageUrl FROM ${dbConfig.databaseNames.PRODUCTS} LEFT JOIN ${dbConfig.databaseNames.DISCOUNT} ON ${dbConfig.databaseNames.DISCOUNT}.productId = ${dbConfig.databaseNames.PRODUCTS}.id LEFT JOIN ${dbConfig.databaseNames.IMAGES} ON ${dbConfig.databaseNames.IMAGES}.productId = ${dbConfig.databaseNames.PRODUCTS}.id`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.status(200).json({
      status: 200,
      products: data
    })
  })
});

router.get('/products/:categoryName', (req, res) => {
  let sql = `SELECT ${dbConfig.databaseNames.PRODUCTS}.id, ${dbConfig.databaseNames.PRODUCTS}.name, ${dbConfig.databaseNames.PRODUCTS}.description, ${dbConfig.databaseNames.CATEGORIES}.singularName, ${dbConfig.databaseNames.PRODUCTS}.price, ${dbConfig.databaseNames.PRODUCTS}.brand, IFNULL(${dbConfig.databaseNames.DISCOUNT}.discountPrice, 0) AS discountPrice FROM ${dbConfig.databaseNames.PRODUCTS} LEFT JOIN ${dbConfig.databaseNames.DISCOUNT} ON ${dbConfig.databaseNames.DISCOUNT}.productId = ${dbConfig.databaseNames.PRODUCTS}.id LEFT JOIN ${dbConfig.databaseNames.CATEGORIES} ON ${dbConfig.databaseNames.CATEGORIES}.id = ${dbConfig.databaseNames.PRODUCTS}.category WHERE ${dbConfig.databaseNames.CATEGORIES}.pluralName='${req.params.categoryName}'`;
  console.log(sql);
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.status(200).json({ 
      status: 200,
      products: data
    })
  })
});

router.get('/product/:productId', (req, res) => {
  let sql = `SELECT ${dbConfig.databaseNames.PRODUCTS}.id, ${dbConfig.databaseNames.PRODUCTS}.name, ${dbConfig.databaseNames.PRODUCTS}.description, ${dbConfig.databaseNames.PRODUCTS}.category, ${dbConfig.databaseNames.PRODUCTS}.price, ${dbConfig.databaseNames.PRODUCTS}.brand, IFNULL(${dbConfig.databaseNames.DISCOUNT}.discountPrice, 0) AS discountPrice FROM ${dbConfig.databaseNames.PRODUCTS} LEFT JOIN ${dbConfig.databaseNames.DISCOUNT} ON ${dbConfig.databaseNames.DISCOUNT}.productId = ${dbConfig.databaseNames.PRODUCTS}.id WHERE products.id=${req.params.productId} LIMIT 1`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    if(data.length > 0){
      res.status(200).json({
        status: 200,
        product: data[0]
      })
    } else {
      res.status(404).json({
        status: 404
      })
    }
  })
});

router.get('/product/:productId/sizes', (req, res) => {
  let sql = `SELECT * FROM ${dbConfig.databaseNames.SIZES} WHERE productId=${req.params.productId}`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.status(200).json({
      status: 200,
      sizes: data
    })
  })
});

router.get('/product/:productId/images', (req, res) => {
  let sql = `SELECT * FROM ${dbConfig.databaseNames.IMAGES} WHERE productId=${req.params.productId}`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.status(200).json({
      status: 200,
      images: data
    })
  })
});

router.post('/product', (req, res) => {
  let name = req.body.name ?? '';
  let category = req.body.category ?? '';
  let price = req.body.price ?? 0;
  let brand = req.body.brand ?? '';
  let description = req.body.description ?? '';
  let sizes = req.body.sizes  ?? [];
  let images = req.body.images ?? [];
  let sql = `SELECT ${dbConfig.databaseNames.PRODUCTS}.id FROM ${dbConfig.databaseNames.PRODUCTS} WHERE kebabName='${kebabCase(name)}' LIMIT 1`;
  db.query(sql, (err, data) => {
    if (err) {
      res.status(409).json({
        status: 409,
        message: 'Wystąpił nieoczekiwany błąd.'
      })
      return;
    }
    console.log(data.length <= 0, name.trim() == '')
    if(data.length > 0 || name.trim() == ''){
      res.status(409).json({
        status: 409,
        message: 'Taka nazwa przedmiotu już istnieje.'
      })
      return;
    }
    if(category.trim() == ''){
      res.status(409).json({
        status: 409,
        message: 'Niepoprawna kategoria.'
      })
      return;
    }
    if(price <= 0){
      res.status(409).json({
        status: 409,
        message: 'Cena musi być większa niż 0zł.'
      })
      return;
    }
    if(sizes.length <= 0){
      res.status(409).json({
        status: 409,
        message: 'Żaden rozmiar nie został ustawiony.'
      })
      return;
    }
    if(images.length <= 0){
      res.status(409).json({
        status: 409,
        message: 'Żadne zdjęcie nie zostało przesłane.'
      })
      return;
    }
    sql = 'INSERT INTO `products`(`id`, `kebabName`, `name`, `category`, `description`, `price`, `brand`) VALUES (0, "' + kebabCase(name) + '", "' + name + '", "' + category + '", "' + description + '", "' + price + '", "' + brand + '")';
    db.query(sql, (err, data) => {
      let id = data.insertId;
      for(let size in sizes){
        sql = 'INSERT INTO `sizes`(`id`, `productId`, `size`, `amount`, `stock`) VALUES (0,"' + id + '","' + size + '", "' + sizes[size] + '", "' + sizes[size] + '")';
        db.query(sql);
      }
      images.forEach((image, index) => {
        sql = 'INSERT INTO `images`(`id`, `productId`, `imageId`, `imageUrl`) VALUES (0, "' + id + '","' + index + '","' + image + '")';
        db.query(sql);
      })
    });
    res.status(200).json({
      status: 200,
      message: 'Przedmiot został dodany.'
    })
    return;
  })
})

/*
router.get('/products', (req, res) => {
  const product = scraper('1005002775713620');
  product.then(r => {
    let colorId = 0;
    r.variants.options.forEach((opt, index) => {
      if(opt.name == 'Color') colorId = index;
    })
    let colorValues = r.variants.options[colorId].values;
    let id = r.variants.options[colorId].values[1].id;

    let sizeId = 1;
    r.variants.options.forEach((opt, index) => {
      if(opt.name == 'Size') sizeId = index;
    })

    let shipId = 0;
    r.variants.options.forEach((opt, index) => {
      if(opt.name == 'Ships From') shipId = index;
    })
    let shipValues = r.variants.options[shipId].values;
    let shipValue = shipValues.filter(ship => ship.name == 'Poland')[0].id
    let pricesValues = r.variants.prices.filter(price => {
      let ids = price.optionValueIds.split(',');
      if(ids[0] == id && ids[2] == shipValue){
        return true;
      }
    })

    res.status(200).json({
      products: pricesValues
    })
  });
    
  })*/

function kebabCase(text){
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
}

module.exports = router;