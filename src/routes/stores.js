const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/storeController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Store
 *   description: Store management
 */

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Create a new store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       201:
 *         description: Store created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', auth, ctrl.createStore);

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Store]
 *     responses:
 *       200:
 *         description: List of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 */
router.get('/', ctrl.getStores);

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get a single store by ID
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       404:
 *         description: Store not found
 */
router.get('/:id', ctrl.getStore);

/**
 * @swagger
 * /stores/{id}:
 *   put:
 *     summary: Update a store by ID
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       200:
 *         description: Store updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Store not found
 */
router.put('/:id', auth, ctrl.updateStore);

/**
 * @swagger
 * /stores/{id}:
 *   delete:
 *     summary: Delete a store by ID
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store deleted successfully
 *       404:
 *         description: Store not found
 */
router.delete('/:id', auth, ctrl.deleteStore);

module.exports = router;
