const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const logger = require('../logger');
const SalesPerson = require('../models/SalesPerson');

exports.createOrder = async (req, res, next) => {
  try {
    const { storeId, salesPersonId, products, paymentStatus } = req.body;

    // Basic validation
    if (!storeId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: storeId/products' });
    }

    // Ensure store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: `Store not found: ${storeId}` });
    }

    const salesPerson = await SalesPerson.findById(salesPersonId);
    if (!salesPerson) {
      return res.status(404).json({ message: `salesPerson not found: ${salesPersonId}` });
    }

    // Resolve products and calculate total
    let total = 0;
    const items = [];

    for (const item of products) {
      const prod = await Product.findById(item.product);
      if (!prod) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      // Use saleRate from Product if not passed
      const unitPrice = prod.MRP;
      const qty = item.quantity || 1;

      items.push({
        product: prod._id,
        quantity: qty,
        unitPrice,
      });

      total += unitPrice * qty;
    }

    // Create order
    const order = new Order({
      storeId: store._id,
      salesPersonId: salesPersonId || null,
      products: items,
      totalAmount: total,
      paymentStatus: paymentStatus || 'Pending',
    });

    await order.save();

    logger.info('Order created successfully', {
      orderId: order._id,
      totalAmount: total,
      productsCount: items.length,
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });

  } catch (err) {
    logger.error('Error creating order', { error: err.message });
    next(err);
  }
};

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get list of orders (with filters & pagination)
 *     tags: [Order]
 *     description: Retrieve orders with optional filters for salesPerson, orderStatus, and paymentStatus. Supports pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page.
 *       - in: query
 *         name: salesPersonId
 *         schema:
 *           type: string
 *         description: Filter orders by salesperson ID.
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [Processing, Shipped, Delivered, Cancelled]
 *         description: Filter orders by their status.
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [Pending, Paid, Failed]
 *         description: Filter orders by payment status.
 *     responses:
 *       200:
 *         description: List of orders with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
exports.getOrders = async (req, res, next) => {
  try {
    // Extract query params
    const {
      page = 1,
      limit = 10,
      salesPersonId,
      orderStatus,
      paymentStatus,
    } = req.query;

    const query = { isDeleted: false };

    // Apply filters
    if (salesPersonId) query.salesPersonId = salesPersonId;
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log(query);
    // Fetch data
    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate('storeId', 'storeName ownerName location')
        .populate('salesPersonId', 'firstName lastName phoneNumber')
        .populate('products.product', 'productName saleRate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info('Fetched orders', {
      filters: query,
      totalOrders: totalCount,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
      data: orders,
    });
  } catch (err) {
    logger.error('Error fetching orders', { error: err.message });
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false })
      .populate('store')
      .populate('salesPerson', '-passwordHash')
      .populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Order not found' });
    o.isDeleted = true;
    o.deletedAt = new Date();
    await o.save();
    res.json({ message: 'Order soft-deleted' });
  } catch (err) { next(err); }
};
