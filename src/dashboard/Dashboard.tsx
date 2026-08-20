import { useState } from 'react';
import '../dashboard/Dashboard.css';
import BalanceHeader from './BalanceHeader';
import ActionButtons from './ActionButtons';
import SegmentedControl from '../components/SegmentedControl';
import ChartPlaceholder from './ChartPlaceholder';
import AccountTable from './AccountTable';
import { useBalances } from '../hooks/useBalances';

const Dashboard = () => {
  // fetched once here and passed down, so the header and the table always
  // agree and we make a single request
  const { balances, loading, error, refresh } = useBalances();
  const [assetType, setAssetType] = useState<'Cash' | 'Crypto'>('Cash');

  const visible = balances.filter((b) =>
    assetType === 'Cash' ? b.type === 'fiat' : b.type === 'crypto',
  );

  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <div className="dashboard-header">
          <BalanceHeader balances={balances} loading={loading} />
          <ActionButtons />
        </div>
        <SegmentedControl options={['1D', '1W', '1M', '1y', 'All']} />
        <ChartPlaceholder />
      </div>
      <div className="dashboard-assets">
        <SegmentedControl
          options={['Cash', 'Crypto']}
          fullWidth
          onChange={(v) => setAssetType(v as 'Cash' | 'Crypto')}
        />
        <AccountTable
          balances={visible}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>
    </div>
  );
};
export default Dashboard;
