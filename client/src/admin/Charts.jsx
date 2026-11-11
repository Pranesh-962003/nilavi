import React, { useState } from 'react';

// Round a maximum up to a tidy axis ceiling (1, 2, 5 x 10^n), never below 4 for counts
function niceMax(value, isCount) {
  if (value <= 0) return isCount ? 4 : 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  const max = step * magnitude;
  // Counts need an even ceiling so the middle gridline is a whole number
  return isCount ? Math.max(4, max % 2 ? max + 1 : max) : max;
}

/**
 * Vertical bar chart, one series, one axis.
 * data: [{ key, label, detail, [valueKey]: number }]
 */
export function BarChart({ data = [], valueKey = 'count', format = (v) => v, isCount = true, height = 200, tooltipRows, emptyText = 'No data for this period yet.', ariaLabel }) {
  const [active, setActive] = useState(null);
  const values = data.map(d => Number(d[valueKey]) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const max = niceMax(Math.max(0, ...values), isCount);
  const ticks = [max, max / 2, 0];
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  if (data.length === 0 || total === 0) {
    return <div className="chart-empty" style={{ height }}>{emptyText}</div>;
  }

  return (
    <div className="chart-bar" role="img" aria-label={ariaLabel}>
      <div className="chart-bar-plot" style={{ height }}>
        <div className="chart-bar-grid" aria-hidden="true">
          {ticks.map((t, i) => (
            <div key={i} className="chart-bar-gridline" style={{ top: `${(1 - t / max) * 100}%` }}>
              <span>{format(t)}</span>
            </div>
          ))}
        </div>
        <div className="chart-bar-cols">
          {data.map((d, i) => {
            const value = values[i];
            const pct = (value / max) * 100;
            return (
              <div
                key={d.key || i}
                className={`chart-bar-col ${active === i ? 'is-active' : ''}`}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <div className="chart-bar-fill" style={{ height: value > 0 ? `max(${pct}%, 3px)` : 0 }} />
                {active === i && (
                  <div className={`chart-tooltip ${i > data.length / 2 ? 'align-right' : ''}`}>
                    <b>{d.detail || d.label}</b>
                    {(tooltipRows ? tooltipRows(d) : [[format(value), '']]).map(([val, name], r) => (
                      <span key={r}><em>{val}</em> {name}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="chart-bar-xaxis" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.key || i}>{i % labelEvery === 0 ? d.label : ''}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal ranked bars with the label and value written out (no legend needed).
 * rows: [{ label, count, value? }]
 */
export function RankedBars({ rows = [], valueKey = 'count', format = (v) => v, secondary, emptyText = 'No data for this period yet.', capitalize = false }) {
  const max = Math.max(0, ...rows.map(r => Number(r[valueKey]) || 0));
  const total = rows.reduce((a, r) => a + (Number(r[valueKey]) || 0), 0);

  if (rows.length === 0 || total === 0) {
    return <div className="chart-empty" style={{ height: 120 }}>{emptyText}</div>;
  }

  return (
    <ul className="chart-ranked">
      {rows.map((row, i) => {
        const value = Number(row[valueKey]) || 0;
        const share = total ? Math.round((value / total) * 100) : 0;
        return (
          <li key={row.label || i}>
            <div className="chart-ranked-head">
              <span className="chart-ranked-label" style={capitalize ? { textTransform: 'capitalize' } : undefined}>
                {String(row.label).replace(/_/g, ' ')}
              </span>
              <span className="chart-ranked-value">
                <b>{format(value)}</b>
                <small>{secondary ? secondary(row, share) : `${share}%`}</small>
              </span>
            </div>
            <div className="chart-ranked-track">
              <div className="chart-ranked-fill" style={{ width: value > 0 ? `max(${(value / max) * 100}%, 4px)` : 0 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
