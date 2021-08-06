const express = require('express'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  authRouter = require('./routes/authRouter'),
  productRouter = require('./routes/productRouter'),
  categoryRouter = require('./routes/categoryRouter')

const app = express();

var server = {
  port: 8080
};

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const date = new Date();
  console.log(`[${date.getFullYear()}-${date.getMonth() < 10 ? '0' + date.getMonth(): date.getMonth()}-${date.getDay() < 10 ? '0' + date.getDay() : date.getDay()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}] Request:`, req.get('host') + req.originalUrl);
  next();
})

app.use('/api', authRouter);
app.use('/api', productRouter);
app.use('/api', categoryRouter);

app.listen(server.port, () => console.log(`Api started on port: ${server.port}`));