import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <Result
      status="success"
      title="Payment Successful!"
      subTitle="Your credits have been added to your account."
      extra={[
        <Link to="/dashboard/credits" key="credits">
          <Button type="primary">Go to Credits</Button>
        </Link>,
        <Link to="/dashboard/generate" key="generate">
          <Button>Generate Video</Button>
        </Link>,
      ]}
    />
  );
};

export default PaymentSuccess;
