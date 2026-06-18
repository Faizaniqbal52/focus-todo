import React, { useEffect, useMemo, useRef } from 'react';
import { dateKey, habitsForDay } from '../../utils/score';

const WEEKS = 26; // half a year of consistency at a glance
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']; // sparse, GitHub-style
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Maps a day's completion ratio to one of five intensity levels.
//  -1 = no habits existed yet (faint), 0 = missed, 1..4 = increasing green.
function levelFor(stat) {
  if (stat.active === 0) return -1;
  if (stat.done === 0) return 0;
  if (stat.ratio <= 0.25) return 1;
  if (stat.ratio <= 0.5) return 2;
  if (stat.ratio <= 0.75) return 3;
  return 4;
}

// Builds the week columns (each a Sun..Sat array of day objects or null).
function buildWeeks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      if (cursor > today) {
        col.push(null);
      } else {
        col.push({ key: dateKey(cursor), date: new Date(cursor) });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(col);
  }
  return weeks;
}

export default function HabitHeatmap({ habits, habitLog }) {
  const weeks = useMemo(buildWeeks, []);
  const scrollRef = useRef(null);

  // Start scrolled to the most recent weeks on narrow screens.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // Month label sits above the first column whose month differs from the
  // previous column's first day.
  const monthLabels = weeks.map((col, i) => {
    const first = col.find(Boolean);
    if (!first) return '';
    const prevFirst = i > 0 ? weeks[i - 1].find(Boolean) : null;
    const m = first.date.getMonth();
    if (!prevFirst || prevFirst.date.getMonth() !== m) return MONTHS[m];
    return '';
  });

  return (
    <div className="heatmap" ref={scrollRef}>
      <div className="heatmap-inner">
        <div className="heatmap-months">
          {monthLabels.map((label, i) => (
            <span className="heatmap-month" key={i}>
              {label}
            </span>
          ))}
        </div>

        <div className="heatmap-body">
          <div className="heatmap-weekdays" aria-hidden="true">
            {WEEKDAYS.map((d, i) => (
              <span className="heatmap-weekday" key={i}>
                {d}
              </span>
            ))}
          </div>

          <div className="heatmap-grid" role="img" aria-label="Habit consistency over the last 26 weeks">
            {weeks.map((col, wi) => (
              <div className="heatmap-col" key={wi}>
                {col.map((day, di) => {
                  if (!day) {
                    return <span className="heatmap-cell is-empty" key={di} />;
                  }
                  const stat = habitsForDay(day.key, habits, habitLog);
                  const lvl = levelFor(stat);
                  const title =
                    stat.active === 0
                      ? `${day.key} · no habits yet`
                      : `${day.key} · ${stat.done}/${stat.active} habits`;
                  return (
                    <span
                      className={`heatmap-cell lvl-${lvl}`}
                      key={di}
                      title={title}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="heatmap-legend">
          <span>Less</span>
          <span className="heatmap-cell lvl-0" />
          <span className="heatmap-cell lvl-1" />
          <span className="heatmap-cell lvl-2" />
          <span className="heatmap-cell lvl-3" />
          <span className="heatmap-cell lvl-4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
