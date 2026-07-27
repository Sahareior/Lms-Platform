interface SharedCardProps {
  title: string;
  description: string;
}

export function SharedCard({ title, description }: SharedCardProps) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
    </div>
  );
}

const styles = {
  card: {
    padding: '20px',
    margin: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontFamily: 'sans-serif',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
};
