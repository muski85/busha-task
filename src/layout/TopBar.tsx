import './TopBar.css';
import searchIcon from '../assets/search.svg';
import moonIcon from '../assets/moon.svg';
import bellIcon from '../assets/bell.svg';
import arrowDown from '../assets/arrowdown2.svg';
import logo from '../assets/logo.svg'

const TopBar = () => {
  return (
    <header className="topbar">
      <div className="topbar-logo">
         <img src={logo} alt="" className="topbar-logo-mark" />
        <span className='topbar-logo-text'>Business</span>
      </div>
      <div className="topbar-actions">
  <button type="button" className="topbar-icon-btn" aria-label="Search">
    <img src={searchIcon} alt="" />
  </button>
  <button type="button" className="topbar-icon-btn" aria-label="Theme">
    <img src={moonIcon} alt="" />
  </button>
  <button type="button" className="topbar-icon-btn" aria-label="Notifications">
    <img src={bellIcon} alt="" />
  </button>
  <button type="button" className="account-pill">
    <span className="account-avatar">Y</span>
    <span>Yousend Limited</span>
    <img src={arrowDown} alt="" width="14" height="14" />
  </button>
</div>
    </header>
  )
}

export default TopBar