const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Shop = require('../models/shop');
const { authenticateToken } = require('../middleware/auth');

// Initialize Razorpay conditionally
let razorpay = null;
let crypto = null;

try {
  // Only attempt to require and initialize if environment variables exist
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    crypto = require('crypto');
    
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    console.log('Razorpay initialized successfully');
  } else {
    console.warn('Razorpay credentials missing. Payment features will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Razorpay:', error.message);
}

// Create an order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    // Create order in database
    const order = new Order({
      userId,
      items,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Handle Razorpay integration
    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service unavailable. Please contact support.',
        order: order._id
      });
    }

    try {
      // Amount needs to be in smallest currency sub-unit (paise)
      const amountInPaise = Math.round(totalAmount * 100);
      
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString(),
          userId: userId.toString()
        },
        partial_payment: false
      });

      res.status(201).json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      
      // Still return the created order but with an error
      return res.status(500).json({ 
        error: 'Payment gateway error. Please try again later.',
        order: order._id
      });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    if (!razorpay || !crypto) {
      return res.status(503).json({ 
        error: 'Payment verification service unavailable' 
      });
    }
    
    const { orderId, paymentId, signature } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing payment verification details' });
    }
    
    // Verify signature
    try {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest('hex');
      
      const isSignatureValid = generatedSignature === signature;
      
      if (!isSignatureValid) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
      
      // Find the order using the receipt from Razorpay
      const razorpayOrder = await razorpay.orders.fetch(orderId);
      const dbOrderId = razorpayOrder.receipt;
      
      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        dbOrderId,
        {
          status: 'completed',
          paymentStatus: 'paid'
        },
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Update product stock
      try {
        for (const item of updatedOrder.items) {
          await Shop.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } }
          );
        }
      } catch (stockUpdateError) {
        // Log but don't fail the transaction if stock update fails
        console.error('Failed to update product stock:', stockUpdateError);
      }
      
      res.json({
        success: true,
        order: updatedOrder
      });
    } catch (verificationError) {
      console.error('Payment verification processing error:', verificationError);
      res.status(500).json({ error: 'Payment verification processing failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'itemName image price discountedPrice');
    
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.productId', 'itemName image price discountedPrice');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Fetch order details error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch order details' });
  }
});

module.exports = router; 