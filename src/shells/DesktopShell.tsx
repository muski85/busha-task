import './DesktopShell.css';
import TopBar from '../layout/TopBar';
import Sidebar from '../layout/SideBar';

export default function DesktopShell() {
  return (
    <div className="shell">
      <TopBar />
      <div className="body">
        <Sidebar />
        {/* Dashboard */}
      </div>
    </div>
  );
}