import "./SideBar.css";
import { navItems } from "../data/nav";

const activeId = "my-assets";

const SideBar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button key={item.id} type="button"
             className={item.id === activeId ? 'nav-item nav-item--active' : 'nav-item'}
          >
            <img className="nav-icon" src={item.icon} alt="" />
            <span className="nav-item-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar;