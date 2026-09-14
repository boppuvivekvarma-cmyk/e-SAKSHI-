'use client';

interface MP {
  mp_id: string;
  mp_name: string;
  constituency: string;
}

interface Props {
  MPs: MP[];
  currentMpId: string;
}

export function MPRoleSwitcher({ MPs, currentMpId }: Props) {
  return (
    <form method="GET">
      <select
        name="mp_id"
        defaultValue={currentMpId}
        onChange={(e) => (e.target.form as HTMLFormElement)?.submit()}
        style={{ minWidth: 220 }}
      >
        {MPs.map(m => (
          <option key={m.mp_id} value={m.mp_id}>
            {m.mp_name} — {m.constituency}
          </option>
        ))}
      </select>
    </form>
  );
}
