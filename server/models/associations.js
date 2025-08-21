import User from './user.js';
import Video from './video.js';
import CreditTransaction from './credit_transaction.js';
import Payment from './payment.js';

// User associations
User.hasMany(Video, { foreignKey: 'user_id', as: 'videos' });
User.hasMany(CreditTransaction, { foreignKey: 'user_id', as: 'creditTransactions' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });

// Video associations
Video.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Credit Transaction associations
CreditTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export { User, Video, CreditTransaction, Payment };