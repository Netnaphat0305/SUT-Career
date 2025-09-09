// src/components/payment/QRCountdown.tsx
import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

type Props = {
  startAt?: number;      // ms timestamp
  minutes?: number;      // default 15
  onExpire?: () => void;
};

const QRCountdown: React.FC<Props> = ({ startAt, minutes = 15, onExpire }) => {
  const [remain, setRemain] = React.useState<number>(minutes * 60);

  React.useEffect(() => {
    const t0 = Math.floor((startAt ?? Date.now()) / 1000);
    const end = t0 + minutes * 60;

    const id = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const left = Math.max(0, end - now);
      setRemain(left);
      if (left === 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [startAt, minutes, onExpire]);

  const mm = String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = String(remain % 60).padStart(2, "0");

  return <Text type={remain <= 60 ? "danger" : "secondary"}>กรุณาชำระเงินภายใน {mm}:{ss}</Text>;
};

export default QRCountdown;