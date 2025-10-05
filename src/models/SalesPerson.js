const mongoose = require('mongoose');

const SalesPersonSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // for login
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, default: null },
  phoneNumber: { type: String, required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('SalesPerson', SalesPersonSchema);
