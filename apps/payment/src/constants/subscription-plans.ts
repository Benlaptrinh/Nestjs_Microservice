export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    duration: 0, // unlimited
    features: ['Basic quiz access', 'Limited attempts'],
  },
  BASIC: {
    name: 'Basic',
    price: 9.99,
    duration: 30, // days
    features: ['Unlimited quiz attempts', 'Basic statistics', 'Remove ads'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 19.99,
    duration: 30, // days
    features: [
      'All Basic features',
      'Advanced statistics',
      'Custom quizzes',
      'Priority support',
    ],
  },
  VIP: {
    name: 'VIP',
    price: 49.99,
    duration: 30, // days
    features: [
      'All Premium features',
      'Exclusive content',
      'Personal tutor',
      '1-on-1 support',
      'Certificate of completion',
    ],
  },
};
