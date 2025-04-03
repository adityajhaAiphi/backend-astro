const express = require('express');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
const { authenticateToken } = require('../middleware/auth');

// Start a consultation (chat or call)
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { astrologerId, type } = req.body;
    const userId = req.user.id;

    // Validate user's balance first
    const { user, astrologer, requiredAmount } = await PaymentService.validateBalance(
      userId,
      astrologerId,
      1 // Start with 1 minute for chat
    );

    // Create consultation
    const consultation = await PaymentService.createConsultation(
      userId,
      astrologerId,
      type
    );

    res.json({
      success: true,
      consultation: {
        ...consultation.toObject(),
        remainingBalance: user.balance - requiredAmount,
        ratePerMinute: astrologer.price.discounted
      }
    });
  } catch (error) {
    console.error('Error starting consultation:', error);
    
    if (error.code === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        details: error.details
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Extend consultation duration
router.post('/extend/:consultationId', authenticateToken, async (req, res) => {
  try {
    const { consultationId } = req.params;

    const result = await PaymentService.updateConsultationDuration(consultationId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error extending consultation:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// End consultation
router.post('/end/:consultationId', authenticateToken, async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await PaymentService.endConsultation(consultationId);

    res.json({
      success: true,
      consultation
    });
  } catch (error) {
    console.error('Error ending consultation:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Validate balance for chat
router.post('/validate-balance', authenticateToken, async (req, res) => {
  try {
    const { astrologerId } = req.body;
    const userId = req.user.id;

    const validation = await PaymentService.validateBalance(userId, astrologerId);
    
    res.json({
      success: true,
      balance: validation.user.balance,
      requiredAmount: validation.requiredAmount
    });
  } catch (error) {
    console.error('Balance validation error:', error);
    
    if (error.code === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 