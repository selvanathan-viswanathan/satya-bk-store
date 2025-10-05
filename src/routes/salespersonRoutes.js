const express = require("express");
const SalesPerson = require("../models/SalesPerson");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SalesPerson
 *   description: Salesperson management
 */

/**
 * @swagger
 * /salespersons/signup:
 *   post:
 *     summary: Sign up a new salesperson
 *     tags: [SalesPerson]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesPerson'
 *     responses:
 *       201:
 *         description: SalesPerson registered successfully
 */
router.post("/signup", async (req, res) => {
  try {
    const user = new SalesPerson(req.body);
    await user.save();
    res.status(201).json({ message: "SalesPerson created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /salespersons/login:
 *   post:
 *     summary: Login for salesperson
 *     tags: [SalesPerson]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await SalesPerson.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

module.exports = router;
