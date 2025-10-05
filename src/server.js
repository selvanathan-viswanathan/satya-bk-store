require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./logger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
// const swaggerSetup = require('./swagger');
const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// swagger
// swaggerSetup(app);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

// start
const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger UI: http://localhost:${PORT}/api/docs`);
  });
});
