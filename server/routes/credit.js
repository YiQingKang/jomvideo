import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { CreditTransaction, Payment } from '../models/associations.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Get credit balance
router.get('/balance', authenticate, async (req, res) => {
  res.json({
    credits: req.user.credits,
    user_id: req.user.id,
  });
});

// Get credit transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: transactions, count } = await CreditTransaction.findAndCountAll({
      where: { user_id: req.user.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Purchase credits
router.post('/purchase', authenticate, [
  body('package_id').notEmpty().withMessage('Package ID is required'),
  body('payment_method').isIn(['stripe', 'paypal']).withMessage('Invalid payment method'),
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { package_id, payment_method } = req.body;
    
    // Define credit packages
    const packages = {
      starter: { credits: 10, price: 9.99 },
      pro: { credits: 50, price: 39.99 },
      enterprise: { credits: 100, price: 79.99 },
    };
    
    const selectedPackage = packages[package_id];
    if (!selectedPackage) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    // Mock payment processing
    const paymentResult = await processPayment({
      amount: selectedPackage.price,
      method: payment_method,
      user_id: req.user.id,
    });

    if (!paymentResult.success) {
      await transaction.rollback();
      return res.status(402).json({ message: 'Payment failed' });
    }

    // Record payment
    const payment = await Payment.create({
      user_id: req.user.id,
      provider: payment_method,
      provider_payment_id: paymentResult.payment_id,
      amount: selectedPackage.price,
      credits_purchased: selectedPackage.credits,
      status: 'completed',
      provider_response: paymentResult,
    }, { transaction });

    // Add credits to user
    const newBalance = req.user.credits + selectedPackage.credits;
    await req.user.update({
      credits: newBalance,
    }, { transaction });

    // Record credit transaction
    await CreditTransaction.create({
      user_id: req.user.id,
      type: 'purchase',
      amount: selectedPackage.credits,
      description: `${package_id} pack purchase`,
      reference_id: payment.id,
      reference_type: 'payment',
      balance_after: newBalance,
      metadata: { package_id, payment_method },
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Credits purchased successfully',
      credits_added: selectedPackage.credits,
      new_balance: newBalance,
      payment_id: payment.id,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Failed to process purchase' });
  }
});

// Mock payment processing function
const processPayment = async ({ amount, method, user_id }) => {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    payment_id: `${method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    status: 'completed',
  };
};

export default router;