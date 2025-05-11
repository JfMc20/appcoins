import React from 'react';
import { DashboardLayout } from '../../components/layout';
import ExchangeRateDashboard from '../../components/exchange-rates/ExchangeRateDashboard';

const ExchangeRatePage: React.FC = () => {
  return (
    <DashboardLayout>
      <ExchangeRateDashboard />
    </DashboardLayout>
  );
};

export default ExchangeRatePage; 