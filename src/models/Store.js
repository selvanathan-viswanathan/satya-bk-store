const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  storeName: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }
  },
  physicalAddress: { type: String, required: true },
  gstNumber: { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

StoreSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', StoreSchema);
