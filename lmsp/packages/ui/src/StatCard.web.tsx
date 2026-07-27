interface StatCardProps {
  value: number | string;
  label: string;
  icon: string;
  color: string;
}

export function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.iconContainer, backgroundColor: color + '15' }}>
        <span style={{ ...styles.iconText, color }}>{icon}</span>
      </div>
      <span style={styles.value}>{value}</span>
      <span style={styles.label}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #f3f4f6',
    borderLeft: '4px solid var(--accent, #6366f1)',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  iconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  iconText: {
    fontSize: '22px',
    lineHeight: 1,
  },
  value: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  label: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
  },
};
