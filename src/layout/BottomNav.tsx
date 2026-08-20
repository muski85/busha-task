import './BottomNav.css';
import { navItems } from '../data/nav';
import moreIcon from '../assets/dot.svg';
import myAssetsGreyIcon from '../assets/my-assets2.svg';

const mobileItems = [
  ...navItems
    .filter((i) =>
      ['my-assets', 'explore', 'customers', 'commerce'].includes(i.id)
    )
    .map((i) =>
      i.id === 'my-assets' ? { ...i, icon: myAssetsGreyIcon } : i
    ),
  { id: 'more', label: 'More', icon: moreIcon },
];

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      {mobileItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`bottom-nav-item${
            item.id === 'my-assets' ? ' bottom-nav-item--active' : ''
          }`}
        >
          <img src={item.icon} alt="" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;