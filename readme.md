---

# 🏪 Satya Store Backend — API Documentation & Developer Guide

A Node.js + Express + MongoDB backend for managing **Stores, Products, Orders, and Salespersons**.  
Includes Swagger UI, JWT authentication, Excel import, and best practices for scalability.

---

## ⚙️ Tech Stack

- **Node.js (v18+)**
- **Express.js**
- **MongoDB + Mongoose**
- **Swagger UI (OpenAPI 3.0)**
- **Winston Logger**
- **JWT Authentication**
- **xlsx (Excel import)**

---

## 📁 Folder Structure

```
src/
├── config/              # Database, Logger, Environment setup
├── controllers/         # Core business logic
├── middleware/          # Auth, Error handling
├── models/              # Mongoose schemas
├── routes/              # Routes + Swagger docs
├── utils/               # Helpers & utilities
└── server.js            # App entry point

```

---

## 🚀 Setup Instructions

### 1️⃣ Clone and Install
```bash
git clone https://github.com/<your-org>/satya-store-backend.git
cd satya-store-backend
npm install
````

### 2️⃣ Environment Variables

Create a `.env` file in the project root:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/satyastore
JWT_SECRET=supersecretkey
LOG_LEVEL=info
```

### 3️⃣ Run the Application

```bash
npm run dev    # Development mode (nodemon)
npm start      # Production mode
```

### 4️⃣ Open Swagger Docs

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🔐 Authentication

All protected endpoints require an Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📘 API Endpoints

---

### 🧾 Orders

#### ➕ Create Order

**POST** `/orders`

**Request Body:**

```json
{
  "storeId": "652d83e9abc1234f56789012",
  "salesPersonId": "652d83e9abc1234f56789034",
  "products": [
    { "product": "652d83e9abc1234f56789099", "quantity": 2 }
  ],
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "paymentStatus": "Pending"
}
```

**Response:**

```json
{
  "_id": "6701ab3456de789012345678",
  "storeId": "652d83e9abc1234f56789012",
  "salesPersonId": "652d83e9abc1234f56789034",
  "totalAmount": 450,
  "paymentStatus": "Pending",
  "orderStatus": "Processing"
}
```

---

#### 📄 Get All Orders (Paginated + Filtered)

**GET** `/orders`

**Query Parameters:**

| Parameter       | Type    | Description                  | Example                  |
| --------------- | ------- | ---------------------------- | ------------------------ |
| `page`          | integer | Page number (default: 1)     | 1                        |
| `limit`         | integer | Items per page (default: 10) | 10                       |
| `salesPersonId` | string  | Filter by salesperson        | 652d83e9abc1234f56789034 |
| `orderStatus`   | string  | Filter by order status       | Delivered                |
| `paymentStatus` | string  | Filter by payment status     | Paid                     |

**Example Request:**

```
GET /orders?page=1&limit=5&salesPersonId=652d83e9abc1234f56789034&paymentStatus=Paid
```

**Response:**

```json
{
  "pagination": {
    "total": 52,
    "page": 1,
    "limit": 5,
    "totalPages": 11
  },
  "data": [
    {
      "_id": "6701ab3456de789012345678",
      "storeId": "652d83e9abc1234f56789012",
      "salesPersonId": "652d83e9abc1234f56789034",
      "totalAmount": 450,
      "paymentStatus": "Paid",
      "orderStatus": "Delivered",
      "createdAt": "2025-10-05T12:45:00Z"
    }
  ]
}
```

---

#### 🔍 Get Order by ID

**GET** `/orders/{id}`

Fetch a single order by its ID.

---

#### ✏️ Update Order

**PUT** `/orders/{id}`

**Request Body:**

```json
{
  "orderStatus": "Delivered",
  "paymentStatus": "Paid"
}
```

---

#### ❌ Delete Order

**DELETE** `/orders/{id}`
Soft-deletes the order (sets `isDeleted: true`).

---

### 📦 Products

#### 📤 Import Products via Excel

**POST** `/products/import/excel`

Uploads an Excel file with product data.

**Excel Columns Required:**

```
S.No | ProductCode | ProductName | MRP | PurchaseRate | GST | LandingCost | Profit | ProfitAmt | SaleRate
```

Automatically:

* Inserts new products.
* Updates existing ones.
* Deletes records not found in Excel.

---

#### 📄 Get All Products

**GET** `/products`

**Query Parameters:**

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| `search`  | string | Search by Product Name or Code |

---

#### 🔍 Get Product by ID

**GET** `/products/{id}`

#### ✏️ Update Product

**PUT** `/products/{id}`

#### ❌ Delete Product

**DELETE** `/products/{id}`

---

### 🏬 Stores

#### ➕ Create Store

**POST** `/stores`

```json
{
  "storeName": "Main Branch",
  "ownerName": "Ravi Kumar",
  "location": { "lat": 12.9716, "lng": 77.5946 },
  "physicalAddress": "Chennai",
  "gstNumber": "29ABCDE1234F1Z5"
}
```

#### 📄 Get All Stores

**GET** `/stores`

#### 🔍 Get Store by ID

**GET** `/stores/{id}`

#### ✏️ Update Store

**PUT** `/stores/{id}`

#### ❌ Delete Store

**DELETE** `/stores/{id}`

---

### 👨‍💼 SalesPersons

#### ➕ Create SalesPerson

**POST** `/salespersons`

```json
{
  "firstName": "Kumar",
  "lastName": "Raj",
  "address": "Bangalore",
  "phoneNumber": "9876543210",
  "username": "kumarraj",
  "password": "password123"
}
```

#### 📄 Get All SalesPersons

**GET** `/salespersons`

#### 🔍 Get SalesPerson by ID

**GET** `/salespersons/{id}`

#### ✏️ Update SalesPerson

**PUT** `/salespersons/{id}`

#### ❌ Delete SalesPerson

**DELETE** `/salespersons/{id}`

---

### 🔐 Authentication

#### 🔑 Sign Up

**POST** `/auth/signup`

```json
{
  "firstName": "Kumar",
  "lastName": "Raj",
  "username": "kumarraj",
  "password": "password123",
  "phoneNumber": "9876543210"
}
```

#### 🔓 Login

**POST** `/auth/login`

```json
{
  "username": "kumarraj",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "652d83e9abc1234f56789012",
    "firstName": "Kumar",
    "lastName": "Raj"
  }
}
```

---

## 📊 Filters & Pagination Examples

| Use Case              | Example URL                                      |
| --------------------- | ------------------------------------------------ |
| Get all Paid Orders   | `/orders?paymentStatus=Paid`                     |
| Get Delivered Orders  | `/orders?orderStatus=Delivered`                  |
| Orders by SalesPerson | `/orders?salesPersonId=652d83e9abc1234f56789034` |
| Paginated Orders      | `/orders?page=2&limit=10`                        |

---

## 🧩 Developer Notes

* **Swagger** auto-generates documentation from route annotations.
* **Winston** handles logs at multiple levels (`info`, `warn`, `error`).
* **Soft deletes** preserve records using `isDeleted` and `deletedAt`.
* **JWT tokens** are issued on login and must be sent with each request.

---

## 🧪 Swagger UI

Accessible at:
👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🧾 Logging

* Configured via `config/logger.js`
* Uses Winston + Console transports
* Logs include timestamps and metadata

---

## 🧠 Common Commands

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start server in dev mode |
| `npm start`    | Start production server  |
| `npm run lint` | Run code linter          |
| `npm test`     | Run unit tests           |

---

> 🧠 **Tip:**
> New developers can clone the repo, set `.env`, run `npm run dev`, and explore all APIs in Swagger UI instantly.

```

---

Would you like me to include **cURL examples for each endpoint** (for quick testing without Swagger)?  
It’s useful for new devs who prefer terminal-based testing.
```
