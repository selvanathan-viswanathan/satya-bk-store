// config/swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const m2s = require("mongoose-to-swagger");

const Store = require("./models/Store");
const SalesPerson = require("./models/SalesPerson");
const Product = require("./models/Product");
const Order = require("./models/Order");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Store Management API",
    version: "1.0.0",
    description: "APIs for Store, SalesPerson, Products, and Orders"
  },
  servers: [{ url: "http://localhost:4000/api" }],
  components: {
    schemas: {
      Store: m2s(Store),
      SalesPerson: m2s(SalesPerson),
      Product: m2s(Product),
      Order: m2s(Order),
    },
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    }
  },
  security: [{ bearerAuth: [] }]
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js"], // make sure this matches your actual path

};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
