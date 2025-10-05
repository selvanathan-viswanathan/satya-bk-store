const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  MRP: { type: Number, required: true },
  purchaseRate: { type: Number, required: true },
  GST: { type: Number, required: true },
  landingCost: { type: Number, required: true },
  profitPercent: { type: Number },
  profitAmount: { type: Number },
  saleRate: { type: Number, required: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
