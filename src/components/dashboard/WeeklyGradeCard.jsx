import React from 'react';
import Icon from '../common/Icon';

// One letter verdict for the week, from the average Daily Power.
export default function WeeklyGradeCard({ grade, avg }) {
  return (
    <section className="dash-card dash-card--grade">
      <div className="dash-card__head">
        <span className="dash-card__label">
          <Icon name="trophy" size={14} /> Weekly Grade
        </span>
      </div>

      <div className="dash-grade__value">{grade}</div>
      <div className="dash-card__sub">
        {avg > 0
          ? `${avg}% average power this week`
          : 'Complete tasks to earn a grade'}
      </div>
    </section>
  );
}
