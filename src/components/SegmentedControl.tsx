import { useState } from 'react';
import './SegmentedControl.css';

interface SegmentedControlProps {
  options: string[];
  defaultValue?: string;
  fullWidth?: boolean;   
}

export default function SegmentedControl({ options, defaultValue, fullWidth }: SegmentedControlProps) {
  const [active, setActive] = useState(defaultValue ?? options[0]);

  return (
    <div className={fullWidth ? 'segmented segmented--full' : 'segmented'}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={opt === active ? 'segment segment--active' : 'segment'}
          onClick={() => setActive(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}