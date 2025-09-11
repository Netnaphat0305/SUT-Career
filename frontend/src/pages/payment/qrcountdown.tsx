import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface Props {
  startAt?: number;
  durationMinutes?: number;
  onExpired: () => void;
}

const QRCountdown: React.FC<Props> = ({ 
  startAt, 
  durationMinutes = 15, 
  onExpired 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!startAt) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startAt;
      const totalDuration = durationMinutes * 60 * 1000; // convert to milliseconds
      const remaining = totalDuration - elapsed;

      if (remaining <= 0) {
        setTimeLeft('หมดเวลา');
        onExpired();
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(remaining / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startAt, durationMinutes, onExpired]);

  if (!startAt || !timeLeft) return null;

  return (
    <Text type={timeLeft === 'หมดเวลา' ? 'danger' : 'secondary'}>
      กรุณาชำระเงินภายใน: {timeLeft}
    </Text>
  );
};

export default QRCountdown;