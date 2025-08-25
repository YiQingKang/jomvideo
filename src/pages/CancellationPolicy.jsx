import React from 'react';
import StaticLayout from '../components/layouts/StaticLayout';
import { CreditCardOutlined } from '@ant-design/icons';

const CancellationPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      content: [
        "This Cancellation & Refund Policy explains the rules regarding purchases made on JomVideo.",
        "By purchasing coins or subscriptions, you agree to this policy.",
      ],
    },
    {
      title: "Purchases Are Final",
      content: [
        "Once you purchase coins (credits), the transaction is final and non-refundable.",
        "Coins cannot be exchanged, transferred, or converted into cash or other credits.",
      ],
    },
    {
      title: "No Cancellations After Purchase",
      content: [
        "Due to the nature of digital services, we do not accept cancellations once coins have been purchased.",
        "By completing a purchase, you acknowledge and agree that you lose the right to cancel under applicable consumer protection laws regarding digital goods and services.",
      ],
    },
    {
      title: "Service Issues",
      content: [
        "If you experience a technical issue that prevents you from using purchased coins, please contact our support team.",
        "While coins are non-refundable, we may, at our sole discretion, provide replacement coins or account credits to resolve verified service issues.",
      ],
    },
    {
      title: "Subscriptions (If Applicable)",
      content: [
        "If JomVideo offers subscription plans, you may cancel your subscription at any time through your account settings.",
        "Cancellation will stop future billing, but previously charged amounts are non-refundable.",
        "You will retain access to your subscription benefits until the end of the current billing cycle.",
      ],
    },
    {
      title: "Fraudulent or Unauthorized Purchases",
      content: [
        "If we detect fraudulent activity, abuse of payment systems, or unauthorized purchases, we reserve the right to suspend or terminate accounts without refund.",
      ],
    }
  ];
  

  return (
    <StaticLayout
      title="Cancellation Policy"
      headerIcon={<CreditCardOutlined />}
      lastUpdated="Last updated: August 2025"
      sections={sections}
    />
  );
};

export default CancellationPolicy;