import React from 'react';
import { Card, Statistic } from 'antd';
import { CheckCircleOutlined, FileTextOutlined, RiseOutlined } from '@ant-design/icons';
import { getScoreColor } from './performanceUtils';

interface Props {
  totalAttempts: number;
  avgPercentage: number;
  completedAttempts: number;
}

/**
 * Top-line summary of the currently filtered result set: how many attempts
 * happened, how well users scored, and how many ran to completion.
 */
const PerformanceStats: React.FC<Props> = ({ totalAttempts, avgPercentage, completedAttempts }) => {
  const cards = [
    {
      key: 'total',
      title: 'Total Attempts',
      value: totalAttempts,
      icon: <FileTextOutlined style={{ color: '#22C55E' }} />,
      accent: '#22C55E',
    },
    {
      key: 'avg',
      title: 'Avg. Score',
      value: avgPercentage,
      suffix: '%',
      precision: 1,
      icon: <RiseOutlined style={{ color: '#3B82F6' }} />,
      accent: getScoreColor(avgPercentage),
    },
    {
      key: 'completed',
      title: 'Completed',
      value: completedAttempts,
      icon: <CheckCircleOutlined style={{ color: '#A855F7' }} />,
      accent: '#A855F7',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${card.accent}`,
            background: '#0B0B0B',
          }}
          className="!shadow-[0_0_0_1px_#1A1A1A]"
          styles={{ body: { padding: '16px 20px' } }}
        >
          <Statistic
            title={<span style={{ color: '#9BA8A0', fontSize: 13 }}>{card.title}</span>}
            value={card.value}
            suffix={card.suffix}
            precision={card.precision}
            prefix={card.icon}
            valueStyle={{ color: '#E8F5EC', fontWeight: 700 }}
          />
        </Card>
      ))}
    </div>
  );
};

export default PerformanceStats;
