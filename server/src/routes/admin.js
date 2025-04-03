const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Shop = require('../models/shop');
const { authenticateToken, hasRole, isAdmin } = require('../middleware/auth');
const AstrologerProfile = require('../models/astrologer');
const Order = require('../models/order');

router.get('/users', authenticateToken, hasRole(['admin','superadmin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/shop', authenticateToken, hasRole(['admin']), async (req, res) => {
  try {
    const items = await Shop.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ error: 'Failed to fetch shop items' });
  }
});

router.get('/stats', authenticateToken, hasRole(['admin','superadmin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    const astrologers = await User.find({ role: 'astrologer' });
    const totalAstrologers = astrologers.length;
    const verifiedAstrologers = astrologers.filter(a => a.isVerified).length;
    const onlineAstrologers = astrologers.filter(a => a.availability?.online).length;
    
    const products = await Shop.find();
    const totalProducts = products.length;
    
    const completedOrders = await Order.find({ 
      status: 'completed',
      paymentStatus: 'paid'
    });
    
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    
    const totalRatings = astrologers.reduce((acc, astrologer) => acc + (astrologer.rating || 0), 0);
    const averageRating = totalAstrologers > 0 ? totalRatings / totalAstrologers : 0;

    // Get revenue breakdown
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalUsers,
      totalAstrologers,
      verifiedAstrologers,
      onlineAstrologers,
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating,
      monthlyRevenue,
      revenueBreakdown: {
        products: completedOrders.reduce((acc, order) => acc + order.totalAmount, 0),
        consultations: 0 
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.put('/users/:userId/role', authenticateToken, hasRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['user', 'astrologer', 'admin','superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updateObj = {
      role,
      ...(role === 'astrologer' ? {
        isVerified: true,
        experience: '0 years',
        expertise: ['Vedic Astrology'],
        languages: ['English'],
        price: {
          original: 20,
          discounted: 10
        },
        availability: {
          online: false,
          startTime: '09:00',
          endTime: '18:00'
        },
        status: {
          chat: false,
          call: false
        },
        rating: 0,
        totalRatings: 0
      } : {})
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateObj,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (role === 'astrologer') {
      await AstrologerProfile.findOneAndUpdate(
        { userId },
        {
          userId,
          name: updatedUser.name,
          email: updatedUser.email,
          experience: '0 years',
          expertise: ['Vedic Astrology'],
          languages: ['English'],
          about: '',
          price: {
            original: 20,
            discounted: 10
          },
          availability: {
            online: false,
            startTime: '09:00',
            endTime: '18:00'
          },
          status: {
            chat: false,
            call: false
          },
          rating: 0,
          totalRatings: 0,
          isVerified: true
        },
        { upsert: true, new: true }
      );
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.get('/users/:userId', authenticateToken, hasRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'astrologer') {
      const astrologerProfile = await AstrologerProfile.findOne({ userId: user._id });
      if (astrologerProfile) {
        user._doc = { ...user._doc, ...astrologerProfile._doc };
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

router.get('/astrologers/unverified', authenticateToken, isAdmin, async (req, res) => {
  try {
    const unverifiedAstrologers = await User.find({
      role: 'astrologer',
      isVerified: false
    }).select('-password');

    res.json(unverifiedAstrologers);
  } catch (error) {
    console.error('Error fetching unverified astrologers:', error);
    res.status(500).json({ error: 'Failed to fetch unverified astrologers' });
  }
});

// Update user profile
router.put('/users/:userId', authenticateToken, hasRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});
router.post('/astrologers/verify/:id', authenticateToken, hasRole(['superadmin']), async (req, res) => {
  try {
    const astrologer = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        price: req.body.price || {
          original: 20,
          discounted: 10
        }
      },
      { new: true }
    ).select('-password');

    if (!astrologer) {
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    res.json({
      success: true,
      message: 'Astrologer verified successfully',
      astrologer
    });
  } catch (error) {
    console.error('Error verifying astrologer:', error);
    res.status(500).json({ error: 'Failed to verify astrologer' });
  }
});

router.post('/astrologers/reject/:id', authenticateToken, hasRole(['superadmin']), async (req, res) => {
  try {
    const astrologer = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: false,
        rejectionReason: req.body.reason || 'Not specified'
      },
      { new: true }
    ).select('-password');

    if (!astrologer) {
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    res.json({
      success: true,
      message: 'Astrologer rejected',
      astrologer
    });
  } catch (error) {
    console.error('Error rejecting astrologer:', error);
    res.status(500).json({ error: 'Failed to reject astrologer' });
  }
});

router.post('/astrologers/unverify/:id', authenticateToken, hasRole(['superadmin']), async (req, res) => {
  try {
    const astrologer = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: false,
        rejectionReason: req.body.reason || 'Unverified by admin'
      },
      { new: true }
    ).select('-password');

    if (!astrologer) {
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    res.json({
      success: true,
      message: 'Astrologer unverified successfully',
      astrologer
    });
  } catch (error) {
    console.error('Error unverifying astrologer:', error);
    res.status(500).json({ error: 'Failed to unverify astrologer' });
  }
});

// Handle wallet transactions
router.post('/users/:userId/wallet', authenticateToken, hasRole(['admin','superadmin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, amount, note } = req.body;
    
    console.log('======== WALLET TRANSACTION ========');
    console.log(`User ID: ${userId}`);
    console.log(`Type: ${type}`);
    console.log(`Amount: ${amount} (${typeof amount})`);
    console.log(`Note: ${note}`);

    // Validate amount - ensure it's a number and greater than zero
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // First check if user exists
    const user = await User.findById(userId).select('balance');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Make sure balance is initialized
    if (user.balance === undefined || user.balance === null) {
      user.balance = 0;
      console.log('Balance initialized to 0');
    }
    
    const currentBalance = Number(user.balance || 0);
    console.log(`Current balance before operation: ${currentBalance}`);

    // Separate handling for credit and debit operations
    if (type === 'credit') {
      // Credit: Add to balance
      const newBalance = currentBalance + numericAmount;
      
      // Update using $set instead of conflicting operators
      const result = await User.findByIdAndUpdate(
        userId,
        { $set: { balance: newBalance } },
        { new: true, runValidators: true }
      );

      if (!result) {
        return res.status(500).json({ error: 'Failed to update user balance' });
      }
      
      console.log(`Credit transaction complete. New balance: ${result.balance}`);
      
      return res.json({ 
        success: true,
        message: 'Transaction successful',
        balance: result.balance 
      });
      
    } else if (type === 'debit') {
      // Debit: Check if enough balance
      if (currentBalance < numericAmount) {
        console.log(`Insufficient balance. Required: ${numericAmount}, Available: ${currentBalance}`);
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      
      // Subtract from balance
      const newBalance = currentBalance - numericAmount;
      
      // Update using $set for debit as well
      const result = await User.findByIdAndUpdate(
        userId,
        { $set: { balance: newBalance } },
        { new: true, runValidators: true }
      );
      
      if (!result) {
        return res.status(500).json({ error: 'Failed to update balance after deduction' });
      }
      
      console.log(`Debit transaction complete. New balance: ${result.balance}`);
      
      return res.json({ 
        success: true,
        message: 'Transaction successful',
        balance: result.balance 
      });
    } else {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
  } catch (error) {
    // Log specific MongoDB error information
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      console.error('MongoDB error code:', error.code);
      console.error('MongoDB error codeName:', error.codeName);
    }
    
    console.error('Error processing wallet transaction:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process transaction',
      details: error.message
    });
  }
});

router.get('/astrologers/:userId/schedule', authenticateToken, hasRole(['admin','superadmin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'astrologer') {
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    res.json({
      workingDays: user.availability?.workingDays || [],
      startTime: user.availability?.startTime || '09:00',
      endTime: user.availability?.endTime || '18:00',
      breaks: user.availability?.breaks || []
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Update astrologer schedule
router.put('/astrologers/:userId/schedule', authenticateToken, hasRole(['admin','superadmin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { workingDays, startTime, endTime, breaks } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== 'astrologer') {
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    user.availability = {
      ...user.availability,
      workingDays,
      startTime,
      endTime,
      breaks
    };

    await user.save();

    res.json({ 
      message: 'Schedule updated successfully',
      schedule: user.availability
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

module.exports = router;