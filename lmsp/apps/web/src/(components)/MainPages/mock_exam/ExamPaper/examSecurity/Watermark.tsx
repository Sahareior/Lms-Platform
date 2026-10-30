import React from 'react';

interface WatermarkProps {
  userId: string;
  examId: string;
}

const Watermark: React.FC<WatermarkProps> = ({ userId, examId }) => {
  const time = new Date().toLocaleTimeString();
  const text = `User: ${userId} | Exam: ${examId} | Time: ${time}`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.15,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        transform: 'rotate(-15deg)',
        fontSize: '14px',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </div>
      ))}
    </div>
  );
};

export default Watermark;