import React from 'react';
import { Result, Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const PaymentFailed = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get('error');
  const status = params.get('status');

  let subTitle = 'An unexpected error occurred. Please try again.';
  if (error === 'invalid_signature') {
    subTitle = 'There was an error verifying your payment. Please contact support.';
  } else if (status) {
    subTitle = `Payment failed with status: ${status}`;
  }

  return (
    <Result
      status="error"
      title="Payment Failed"
      subTitle={subTitle}
      extra={[
        <Link to="/dashboard/credits" key="credits">
          <Button type="primary">Try Again</Button>
        </Link>,
      ]}
    />
  );
};

export default PaymentFailed;
