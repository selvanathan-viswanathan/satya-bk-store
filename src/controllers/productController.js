const Product = require("../models/Product");
const Store = require("../models/Store");
const logger = require("../logger");
const xlsx = require("xlsx");

exports.createProduct = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.productId || !body.name || !body.price || !body.store) {
      return res
        .status(400)
        .json({
          message: "Missing required fields productId/name/price/store",
        });
    }
    const p = new Product(body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const p = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("store");
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const p = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    p.isDeleted = true;
    p.deletedAt = new Date();
    await p.save();
    res.json({ message: "Product soft-deleted" });
  } catch (err) {
    next(err);
  }
};

/**
 * Excel import: expects file upload (multipart/form-data) with field 'file'.
 * For each row, map columns to Product schema. The mapping below is flexible:
 * - If your excel contains column 'SKU' -> it maps to productId
 * - If 'Name' -> name
 * - 'Price' -> price
 * - 'MRP' -> mrp etc.
 *
 * Adjust mapping as needed for your exact spreadsheet column names.
 */
exports.importProductsFromExcel = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Excel file required" });
    await Product.deleteMany({});
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

    if (!rows.length)
      return res.status(400).json({ message: "Excel is empty" });

    const defaultStoreId = req.body.defaultStoreId;
    const excelProductCodes = [];
    const created = [];
    const updated = [];
    const normalizedRows = rows.map(row => {
      const newRow = {};
      for (const key in row) {
        if(row[key]) {
          newRow[key.trim()] = row[key];  // remove leading/trailing spaces
        }
      }
      return newRow;
    });
    for (const row of normalizedRows) {
      const productCode = row["ProductCode"];
      if (!productCode) continue; // skip rows without code
      excelProductCodes.push(productCode);
      console.log(pData);
      // const storeId = row['Store
      // Id'] || row['storeId'] || defaultStoreId;
      // if (!storeId) return res.status(400).json({ message: 'storeId missing in excel or defaultStoreId' });

      // const store = await Store.findOne({ storeId });
      // if (!store) continue; // skip if store not found
      const pData = {
        productCode: row["ProductCode"] || "", // exact column name
        productName: row["ProductName"] || "",
        MRP: Number(row["MRP"] || 0),
        purchaseRate: Number(row["PurchaseRate"] || 0), // matches your column
        GST: Number(row["GST"] || 0),
        landingCost: Number(row["LandingCost"] || 0),
        profitPercent: Number(row["Profit"] || 0), // Profit column
        profitAmount: Number(row["ProfitAmt"] || 0),
        saleRate: Number(row["SaleRate"] || 0),
        // store: store._id
      };

      // Upsert: check if exists
      let product = await Product.findOne({ productCode});
      if (product) {
        Object.assign(product, pData);
        await product.save();
        updated.push(productCode);
        logger.info(`Updated product: ${productCode}`);
      } else {
        product = new Product(pData);
        await product.save();
        created.push(productCode);
        logger.info(`Inserted new product: ${productCode}`);
      }
    }

    // Delete DB products for this store not in Excel
    let deletedCount = 0;
    if (defaultStoreId) {
      const store = await Store.findOne({ storeId: defaultStoreId });
      if (store) {
        const deleteResult = await Product.deleteMany({
          store: store._id,
          productCode: { $nin: excelProductCodes },
        });
        deletedCount = deleteResult.deletedCount || 0;
        if (deletedCount)
          logger.info(`Deleted ${deletedCount} products not present in Excel`);
      }
    }

    res.json({
      message: "Products imported successfully",
      created: created.length,
      updated: updated.length,
      deleted: deletedCount,
    });
  } catch (err) {
    logger.error("Error importing products from Excel", err);
    next(err);
  }
};
