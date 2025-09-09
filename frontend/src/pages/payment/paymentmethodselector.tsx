// src/components/payment/PaymentMethodSelector.tsx
import React from "react";
import { Card, Space, Radio, Typography, Flex, Button, message } from "antd";
import { QrcodeOutlined, BankOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

type Props = {
  method: number;
  setMethod: (v: number) => void;
};

const PaymentMethodSelector: React.FC<Props> = ({ method, setMethod }) => {
  const [expanded, setExpanded] = React.useState(false);

  const choose = (v: number) => {
    if (v !== 1) {
      message.warning("ช่องทางนี้ยังไม่พร้อมใช้งาน กรุณาใช้ QR PromptPay");
      setMethod(1);
      return;
    }
    setMethod(1);
  };

  return (
    <Card style={{ borderRadius: 12, marginBottom: 12 }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>ช่องทางการชำระเงิน</Title>
        <Button type="link" onClick={() => setExpanded((v) => !v)}>
          <Space>
            <Text type="secondary">{expanded ? "ย่อลง" : "ดูทั้งหมด"}</Text>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </Space>
        </Button>
      </Flex>

      {!expanded ? (
        <Card style={{ borderRadius: 10 }} bodyStyle={{ padding: 12 }}>
          <Flex align="center" gap={12} justify="space-between">
            <Space>
              <QrcodeOutlined style={{ fontSize: 20 }} />
              <Text>QR PromptPay</Text>
            </Space>
            <Radio checked />
          </Flex>
        </Card>
      ) : (
        <Radio.Group value={1} onChange={(e) => choose(e.target.value)} style={{ width: "100%" }}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Card
              style={{ borderRadius: 10, borderColor: method === 1 ? "#1677ff" : undefined }}
              onClick={() => choose(1)}
              hoverable
              bodyStyle={{ padding: 12 }}
            >
              <Flex align="center" gap={12} justify="space-between">
                <Space>
                  <QrcodeOutlined style={{ fontSize: 20 }} />
                  <Text>QR PromptPay</Text>
                </Space>
                <Radio value={1} />
              </Flex>
            </Card>

            <Card style={{ borderRadius: 10, opacity: 0.5, cursor: "not-allowed" }} bodyStyle={{ padding: 12 }} onClick={() => choose(2)}>
              <Flex align="center" gap={12} justify="space-between">
                <Space>
                  <BankOutlined style={{ fontSize: 20 }} />
                  <Text>Mobile Banking (ยังไม่พร้อมใช้งาน)</Text>
                </Space>
                <Radio value={2} disabled />
              </Flex>
            </Card>
          </Space>
        </Radio.Group>
      )}
    </Card>
  );
};

export default PaymentMethodSelector;