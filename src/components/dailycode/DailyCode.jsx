import React, { useMemo } from 'react';
import { getDailyCode } from '../../utils/dailyCode';
import Icon from '../common/Icon';
import './dailycode.css';

// A slim banner under the header: today's rotating mantra to set the tone.
export default function DailyCode() {
  const code = useMemo(() => getDailyCode(), []);

  return (
    <div className="daily-code" role="note" aria-label="Daily Code">
      <span className="daily-code__label">
        <Icon name="spark" size={13} /> Daily Code
      </span>
      <p className="daily-code__text">{code}</p>
    </div>
  );
}
