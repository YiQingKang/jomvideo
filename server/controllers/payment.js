const crypto = require('crypto');
const Models = require('../models');

const packages = {
  starter: { credits: 10, price: 9.99 },
  bundle: { credits: 50, price: 39.99 },
  bulk: { credits: 100, price: 79.99 },
};

class PaymentController {
  static async gkashCallback(req, res) {
    try {
      const { CID, POID, status, cartid, currency, amount, signature } = req.body;
      const { GKASH_SIGNATURE_KEY: signatureKey } = process.env;

      const amountFormatted = (parseFloat(amount) * 100).toFixed(0).padStart(3, '0');
      const signatureString = `${signatureKey};${CID};${POID};${cartid};${amountFormatted};${currency};${status}`.toUpperCase();
      const calculatedSignature = crypto.createHash('sha512').update(signatureString).digest('hex');

      if (calculatedSignature.toLowerCase() !== signature.toLowerCase()) { //testyq
        console.error('Gkash callback: Invalid signature');
        return res.status(400).send('Invalid signature');
      }

      if (status === '88 - Transferred') {
        const transaction = await Models.sequelize.transaction();
        try {
          const existingPayment = await Models.payment.findOne({ where: { provider_payment_id: POID } });
          if (existingPayment) {
            await transaction.commit();
            return res.send('OK');
          }

          const userId = cartid.split('__')[1];
          const user = await Models.user.findByPk(userId);

          if (!user) {
            await transaction.rollback();
            console.error('Gkash callback: User not found');
            return res.status(404).send('User not found');
          }

          const packageId = Object.keys(packages).find(p => packages[p].price == amount);
          const selectedPackage = packages[packageId];

          if (!selectedPackage) {
            await transaction.rollback();
            console.error('Gkash callback: Package not found');
            return res.status(400).send('Package not found');
          }

          const payment = await Models.payment.create({
            user_id: user.id,
            provider: 'gkash',
            provider_payment_id: POID,
            amount: selectedPackage.price,
            credits_purchased: selectedPackage.credits,
            status: 'completed',
            provider_response: req.body,
          }, { transaction });

          const newBalance = user.credits + selectedPackage.credits;
          await user.update({ credits: newBalance }, { transaction });

          await Models.credit_transaction.create({
            user_id: user.id,
            type: 'purchase',
            amount: selectedPackage.credits,
            description: `${packageId} pack purchase via Gkash`,
            reference_id: payment.id,
            reference_type: 'payment',
            balance_after: newBalance,
            metadata: { package_id: packageId, payment_method: 'gkash' },
          }, { transaction });

          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.error('Gkash callback processing error:', error);
          return res.status(500).send('Internal Server Error');
        }
      }

      res.send('OK');
    } catch (error) {
      console.error('Gkash callback error:', error);
      res.status(500).send('OK');
    }
  }

  static async gkashReturn(req, res) {
    try {
      const { CID, POID, status, cartid, currency, amount, signature } = req.body;
      const { GKASH_SIGNATURE_KEY: signatureKey, CLIENT_URL } = process.env;

      const amountFormatted = (parseFloat(amount) * 100).toFixed(0).padStart(3, '0');
      const signatureString = `${signatureKey};${CID};${POID};${cartid};${amountFormatted};${currency};${status}`.toUpperCase();
      const calculatedSignature = crypto.createHash('sha512').update(signatureString).digest('hex');

      if (calculatedSignature.toLowerCase() !== signature.toLowerCase()) {
        return res.redirect(`${CLIENT_URL}/payment-failed?error=invalid_signature`);
      }

      if (status === '88 - Transferred') {
        res.redirect(`${CLIENT_URL}/payment-success`);
      } else {
        res.redirect(`${CLIENT_URL}/payment-failed?status=${encodeURIComponent(status)}`);
      }
    } catch (error) {
      console.error('Gkash callback error:', error, process.env.CLIENT_URL);
      res.redirect(`${process.env.CLIENT_URL}/payment-failed?status=failed`);
    }
  }
}

module.exports = PaymentController;
