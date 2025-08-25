import React from 'react';
import StaticLayout from '../components/layouts/StaticLayout';
import { LockOutlined } from '@ant-design/icons';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      content: [
        "JomVideo respects your privacy and is committed to protecting your personal data.",
        "This Privacy Policy explains how we collect, use, and safeguard information when you use our text-to-video AI generation platform.",
      ],
    },
    {
      title: "Information We Collect",
      content: [
        "Account Information: name, email address, and password you provide during registration.",
        "Usage Data: prompts, text inputs, images you upload, and log data such as IP address and device information.",
        "Payment Information: processed securely by third-party providers. JomVideo does not store your credit card details.",
        "Cookies & Tracking: used to enhance experience, analyze usage, and remember preferences.",
      ],
    },
    {
      title: "How We Use Your Information",
      content: [
        "To provide, maintain, and improve the Service.",
        "To process transactions and manage subscriptions.",
        "To generate and deliver requested videos.",
        "To monitor performance, prevent fraud, and ensure security.",
        "To research and improve AI models (including reviewing anonymized prompts and outputs).",
        "To communicate with you about updates or support.",
      ],
    },
    {
      title: "Sharing of Information",
      content: [
        "We do not sell your personal data.",
        "We may share information with trusted service providers (e.g., hosting, payment processing).",
        "We may disclose information if required by law or in connection with business transfers such as mergers or acquisitions.",
      ],
    },
    {
      title: "Your Content and AI Outputs",
      content: [
        "You retain ownership of your inputs and generated outputs.",
        "By using JomVideo, you grant us a limited license to process and store inputs/outputs to provide and improve the Service.",
        "You are responsible for ensuring generated content complies with applicable laws.",
      ],
    },
    {
      title: "Data Retention",
      content: [
        "Account data is retained as long as your account is active.",
        "Generated content and prompts may be stored temporarily to improve service quality.",
        "You may request deletion of your data at any time.",
      ],
    },
    {
      title: "Security",
      content: [
        "We implement technical and organizational measures to protect your data.",
        "No system is 100% secure; we cannot guarantee absolute protection against unauthorized access.",
      ],
    },
    {
      title: "Your Rights",
      content: [
        "You may request access, correction, or deletion of your personal data.",
        "You may opt-out of marketing communications.",
        "Depending on your jurisdiction, you may request data portability or exercise other legal rights.",
      ],
    },
    {
      title: "Children’s Privacy",
      content: [
        "JomVideo is not intended for individuals under 18 years old.",
        "We do not knowingly collect personal data from minors.",
      ],
    },
    {
      title: "International Users",
      content: [
        "If you access JomVideo from outside our main jurisdiction, your data may be transferred and processed in other countries with different data protection laws.",
      ],
    },
    {
      title: "Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time.",
        "Changes will be posted with a new 'Last Updated' date.",
      ],
    }
  ];  

  return (
    <StaticLayout
      title="Privacy Policy"
      headerIcon={<LockOutlined />}
      lastUpdated="Last updated: August 2025"
      sections={sections}
    />
  );
};

export default PrivacyPolicy;