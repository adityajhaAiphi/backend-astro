const User = require('../models/user');
const ConsultationOrder = require('../models/consultationOrder');

class PaymentService {
  static async validateBalance(userId, astrologerId, duration = 1) {
    const [user, astrologer] = await Promise.all([
      User.findById(userId),
      User.findById(astrologerId)
    ]);

    if (!user || !astrologer) {
      throw new Error('User or astrologer not found');
    }

    // For chat messages, we'll check if user has enough balance for at least 1 minute
    const requiredAmount = astrologer.price.discounted * duration;
    if (user.balance < requiredAmount) {
      const error = new Error('Insufficient balance');
      error.code = 'INSUFFICIENT_BALANCE';
      error.details = {
        required: requiredAmount,
        current: user.balance,
        shortfall: requiredAmount - user.balance
      };
      throw error;
    }

    return {
      user,
      astrologer,
      requiredAmount
    };
  }

  static async createConsultation(userId, astrologerId, type) {
    const { user, astrologer, requiredAmount } = await this.validateBalance(userId, astrologerId);

    // Create consultation order with 1 minute initial duration
    const consultation = await ConsultationOrder.create({
      userId,
      astrologerId,
      duration: 1, // Changed from 5 to 1
      ratePerMinute: astrologer.price.discounted,
      totalAmount: requiredAmount,
      status: 'scheduled',
      paymentStatus: 'pending',
      consultationType: type
    });

    // Deduct initial amount from user's balance
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -requiredAmount }
    });

    return consultation;
  }

  static async updateConsultationDuration(consultationId) {
    const consultation = await ConsultationOrder.findById(consultationId);
    if (!consultation) {
      throw new Error('Consultation not found');
    }

    const { userId, astrologerId, ratePerMinute } = consultation;
    const additionalAmount = ratePerMinute * 5; // Add 5 more minutes

    const { user } = await this.validateBalance(userId, astrologerId, 5);

    // Update consultation duration and amount
    await Promise.all([
      ConsultationOrder.findByIdAndUpdate(consultationId, {
        $inc: {
          duration: 5,
          totalAmount: additionalAmount
        }
      }),
      User.findByIdAndUpdate(userId, {
        $inc: { balance: -additionalAmount }
      })
    ]);

    return { success: true, newBalance: user.balance - additionalAmount };
  }

  static async endConsultation(consultationId) {
    const consultation = await ConsultationOrder.findByIdAndUpdate(
      consultationId,
      {
        status: 'completed',
        paymentStatus: 'paid'
      },
      { new: true }
    );

    return consultation;
  }
}

module.exports = PaymentService; 