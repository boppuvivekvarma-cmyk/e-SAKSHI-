'use client';
import type { CSSProperties } from 'react';

/**
 * Client-side select dropdown for district/state switchers.
 * Submits form on change — requires 'use client'.
 */
interface Props {
  name: string;
  options: string[];
  defaultValue: string;
  style?: CSSProperties;
}

export function AutoSubmitSelect({ name, options, defaultValue, style }: Props) {
  return (
    <form method="GET">
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={(e) => (e.target.form as HTMLFormElement)?.submit()}
        style={style ?? { minWidth: 180 }}
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </form>
  );
}
