import myAssetsIcon from '../assets/my-assets.svg';
import exploreIcon from '../assets/explore.svg';
import transactionsIcon from '../assets/transactions.svg';
import transferIcon from '../assets/transfer.svg';
import commerceIcon from '../assets/commerce.svg';
import customersIcon from '../assets/customers.svg';
import indexesIcon from '../assets/indexes.svg';
import savingsIcon from '../assets/savings.svg';
import cardsIcon from '../assets/cards.svg';
import teamIcon from '../assets/team.svg';
import settingsIcon from '../assets/settings.svg';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { id: 'my-assets',    label: 'My assets',    icon: myAssetsIcon },
  { id: 'explore',      label: 'Explore',      icon: exploreIcon },
  { id: 'transactions', label: 'Transactions', icon: transactionsIcon },
  { id: 'transfer',     label: 'Transfer',     icon: transferIcon },
  { id: 'commerce',     label: 'Commerce',     icon: commerceIcon },
  { id: 'customers',    label: 'Customers',    icon: customersIcon },
  { id: 'indexes',      label: 'Indexes',      icon: indexesIcon },
  { id: 'savings',      label: 'Savings',      icon: savingsIcon },
  { id: 'cards',        label: 'Cards',        icon: cardsIcon },
  { id: 'team',         label: 'Team',         icon: teamIcon },
  { id: 'settings',     label: 'Settings',     icon: settingsIcon },
];
