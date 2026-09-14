'use client';

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-primary">
      🖨️ Print / Save as PDF
    </button>
  );
}
