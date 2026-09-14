interface Props {
  verdict: string;
  score?: number;
  showScore?: boolean;
}

export function RiskBadge({ verdict, score, showScore }: Props) {
  const getBadgeConfig = (v: string) => {
    switch (v) {
      case 'STATUTORY HOLD':
        return {
          label: 'STATUTORY HOLD',
          sub: 'विधिक रोक',
          icon: '⛔',
          className: 'badge-hold',
        };
      case 'COMPLIANCE INQUIRY':
        return {
          label: 'COMPLIANCE INQUIRY',
          sub: 'जांच अधीन',
          icon: '⚠️',
          className: 'badge-inquiry',
        };
      case 'CAPITAL DORMANT':
        return {
          label: 'CAPITAL DORMANT',
          sub: 'निष्क्रिय पूंजी',
          icon: '⏸️',
          className: 'badge-dormant',
        };
      default:
        return {
          label: 'VERIFIED COMPLIANT',
          sub: 'सत्यापित अनुपालित',
          icon: '✓',
          className: 'badge-compliant',
        };
    }
  };

  const config = getBadgeConfig(verdict);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <span className={`badge ${config.className}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {showScore && score != null && (
          <span style={{
            marginLeft: 4, paddingLeft: 4,
            borderLeft: '1px solid currentColor', fontWeight: 800,
          }}>
            {score.toFixed(0)}/100
          </span>
        )}
      </span>
      <span style={{ fontSize: '0.62rem', color: 'var(--text-sub)', paddingLeft: 2 }}>
        {config.sub}
      </span>
    </div>
  );
}
