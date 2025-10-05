const Store = require('../models/Store');
const logger = require('../logger');

exports.createStore = async (req, res, next) => {
  try {
    const { storeName, ownerName, location, physicalAddress, gstNumber } = req.body;
    if ( !storeName || !ownerName || !location || !Array.isArray(location.coordinates)) {
      return res.status(400).json({ message: 'Missing required fields or invalid location' });
    }

    const existingstore = await Store.findOne({ storeName })
    if(existingstore) {
     return res.status(409).json({ message: `Store with name ${storeName} already exists. try different name` }); 
    }
    const s = new Store({ storeName, ownerName, location: {
      coordinates: location.coordinates
    }, physicalAddress, gstNumber });
    await s.save();
    logger.info('Store created', { id: s._id });
    res.status(201).json(s);
  } catch (err) { next(err); }
};

exports.getStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ isDeleted: false });
    res.json(stores);
  } catch (err) { next(err); }
};

exports.getStore = async (req, res, next) => {
  try {
    const s = await Store.findOne({ _id: req.params.id, isDeleted: false });
    if (!s) return res.status(404).json({ message: 'Store not found' });
    res.json(s);
  } catch (err) { next(err); }
};

exports.updateStore = async (req, res, next) => {
  try {
    const s = await Store.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
    if (!s) return res.status(404).json({ message: 'Store not found' });
    res.json(s);
  } catch (err) { next(err); }
};

exports.deleteStore = async (req, res, next) => {
  try {
    const s = await Store.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Store not found' });
    s.isDeleted = true;
    s.deletedAt = new Date();
    await s.save();
    res.json({ message: 'Store soft-deleted' });
  } catch (err) { next(err); }
};
