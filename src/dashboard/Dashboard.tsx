import '../dashboard/Dashboard.css';
import BalanceHeader from './BalanceHeader';
import ActionButtons from './ActionButtons';
import SegmentedControl from '../components/SegmentedControl';
import ChartPlaceholder from './ChartPlaceholder';
import AccountTable from './AccountTable';


const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <div className="dashboard-header">
          <BalanceHeader />
          <ActionButtons />
        </div>
        <SegmentedControl options={['1D', '1W', '1M', '1y', 'All']} />
        <ChartPlaceholder />
      </div>
      <div className="dashboard-assets">
      <SegmentedControl options={['Cash', 'Crypto']} fullWidth />
      <AccountTable />
      </div>
    </div>
  );
};
export default Dashboard;