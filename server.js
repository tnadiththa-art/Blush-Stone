const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Products Data Loader
const getProducts = () => {
  const filePath = path.join(__dirname, 'src', 'data', 'products.json');
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading products.json:', err);
    return [];
  }
};

// ================= API ENDPOINTS ================= //

// GET /api/products - list all with optional filters (category, search, featured)
app.get('/api/products', (req, res) => {
  let products = getProducts();
  const { category, search, featured, sort } = req.query;

  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featured === 'true') {
    products = products.filter(p => p.isFeatured);
  }

  if (search) {
    const query = search.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.badge && p.badge.toLowerCase().includes(query))
    );
  }

  if (sort) {
    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }
  }

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// GET /api/products/:id - single product detail
app.get('/api/products/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with ID '${req.params.id}' not found.`
    });
  }

  // Related products in same category
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  res.json({
    success: true,
    data: {
      ...product,
      related
    }
  });
});

// POST /api/newsletter - newsletter subscription
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  // Simulated subscription success
  res.json({
    success: true,
    message: 'Thank you for joining the Blush Stone Circle. Enjoy your 10% welcome gift on your first piece with code BLUSH2026.'
  });
});

// POST /api/contact - customer concierge contact message
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required fields.'
    });
  }

  res.json({
    success: true,
    message: `Thank you, ${name}. Your message has reached our Atelier Concierge. We will reply within 24 hours.`
  });
});

// POST /api/cart/checkout - mock order checkout
app.post('/api/cart/checkout', (req, res) => {
  const { items, customer, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty.'
    });
  }

  const orderId = 'BLUSH-' + Math.floor(100000 + Math.random() * 900000);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({
    success: true,
    orderId,
    total,
    deliveryEstimate: '2-4 Business Days with Insured Delivery',
    message: 'Order placed successfully! A confirmation email and certificate of authenticity have been sent.'
  });
});

// ================= PAGE ROUTING ================= //
// Clean page routes mapping to html files
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Fallback to index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`✨ Blush Stone Atelier server running at http://localhost:${PORT}`);
});
