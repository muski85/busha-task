import './DesktopShell.css';
import TopBar from '../layout/TopBar';
import Sidebar from '../layout/SideBar';
import Dashboard from '../dashboard/Dashboard';

export default function DesktopShell() {
  return (
    <div className="shell">
      <TopBar />
      <div className="body">
        <Sidebar />
        <main className="content">
            <Dashboard/>
        </main>
      </div>
    </div>
  );
}