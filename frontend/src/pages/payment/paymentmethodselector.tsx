// // src/components/payment/PaymentMethodSelector.tsx
// import React from "react";
// import { Card, Space, Radio, Typography, Flex, Button, message } from "antd";
// import { QrcodeOutlined, BankOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";

// const { Text, Title } = Typography;

// type Props = {
//   method: number;
//   setMethod: (v: number) => void;
// };

// const PaymentMethodSelector: React.FC<Props> = ({ method, setMethod }) => {
//   const [expanded, setExpanded] = React.useState(false);

//   const choose = (v: number) => {
//     if (v !== 1) {
//       message.warning("ช่องทางนี้ยังไม่พร้อมใช้งาน กรุณาใช้ QR PromptPay");
//       setMethod(1);
//       return;
//     }
//     setMethod(1);
//   };

//   return (
//     <Card style={{ borderRadius: 12, marginBottom: 12 }}>
//       <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
//         <Title level={5} style={{ margin: 0 }}>ช่องทางการชำระเงิน</Title>
//         <Button type="link" onClick={() => setExpanded((v) => !v)}>
//           <Space>
//             <Text type="secondary">{expanded ? "ย่อลง" : "ดูทั้งหมด"}</Text>
//             {expanded ? <UpOutlined /> : <DownOutlined />}
//           </Space>
//         </Button>
//       </Flex>

//       {!expanded ? (
//         <Card style={{ borderRadius: 10 }} bodyStyle={{ padding: 12 }}>
//           <Flex align="center" gap={12} justify="space-between">
//             <Space>
//               <QrcodeOutlined style={{ fontSize: 20 }} />
//               <Text>QR PromptPay</Text>
//             </Space>
//             <Radio checked />
//           </Flex>
//         </Card>
//       ) : (
//         <Radio.Group value={1} onChange={(e) => choose(e.target.value)} style={{ width: "100%" }}>
//           <Space direction="vertical" size={12} style={{ width: "100%" }}>
//             <Card
//               style={{ borderRadius: 10, borderColor: method === 1 ? "#1677ff" : undefined }}
//               onClick={() => choose(1)}
//               hoverable
//               bodyStyle={{ padding: 12 }}
//             >
//               <Flex align="center" gap={12} justify="space-between">
//                 <Space>
//                   <QrcodeOutlined style={{ fontSize: 20 }} />
//                   <Text>QR PromptPay</Text>
//                 </Space>
//                 <Radio value={1} />
//               </Flex>
//             </Card>

//             <Card style={{ borderRadius: 10, opacity: 0.5, cursor: "not-allowed" }} bodyStyle={{ padding: 12 }} onClick={() => choose(2)}>
//               <Flex align="center" gap={12} justify="space-between">
//                 <Space>
//                   <BankOutlined style={{ fontSize: 20 }} />
//                   <Text>Mobile Banking (ยังไม่พร้อมใช้งาน)</Text>
//                 </Space>
//                 <Radio value={2} disabled />
//               </Flex>
//             </Card>
//           </Space>
//         </Radio.Group>
//       )}
//     </Card>
//   );
// };

// export default PaymentMethodSelector;

import React, { useState, useEffect } from "react";
import { Card, Space, Radio, Typography, Flex, Button, message } from "antd";
import {
  QrcodeOutlined,
  BankOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
import type { SelectorPaymentMethod } from "../../interfaces/paymentmethod";
import { PaymentmethodAPI } from "../../services/https";

const iconComponents: { [key: string]: React.ReactNode } = {
  QrcodeOutlined: <QrcodeOutlined style={{ fontSize: 20 }} />,
  BankOutlined: <BankOutlined style={{ fontSize: 20 }} />,
};

type Props = {
  method: number;
  setMethod: (v: number) => void;
};

const PaymentMethodSelector: React.FC<Props> = ({ method, setMethod }) => {
  const [expanded, setExpanded] = useState(false);
  const [methods, setMethods] = useState<SelectorPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const rawApiData = await PaymentmethodAPI.list();
        console.log("Actual data from API:", rawApiData);
        const formattedMethods: SelectorPaymentMethod[] = rawApiData.map(
          (item: any) => {
            let iconName = "DollarOutlined";
            if (item.ID === 1) {
              iconName = "QrcodeOutlined";
            } else {
              iconName = "BankOutlined";
            }

            return {
              id: item.ID,
              method_name: item.method_name,
              is_active: item.ID === 1 || item.ID === 2,
              icon: iconName,
            };
          }
        );

        setMethods(formattedMethods);
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        message.error("ไม่สามารถโหลดช่องทางการชำระเงินได้");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const choose = (selectedMethod: SelectorPaymentMethod) => {
    if (!selectedMethod.is_active) {
      message.warning("ช่องทางนี้ยังไม่พร้อมใช้งาน กรุณาเลือกช่องทางอื่น");
      return;
    }
    setMethod(selectedMethod.id);
    setExpanded(false);
  };

  if (loading) {
  }

  const selectedMethodInfo =
    methods.find((m) => m.id === method) || methods.find((m) => m.is_active);

  return (
    <Card style={{ borderRadius: 12, marginBottom: 12 }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>
          ช่องทางการชำระเงิน
        </Title>
        <Button type="link" onClick={() => setExpanded((v) => !v)}>
          <Space>
            <Text type="secondary">{expanded ? "ย่อลง" : "ดูทั้งหมด"}</Text>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </Space>
        </Button>
      </Flex>

      {!expanded ? (
        selectedMethodInfo && (
          <Card style={{ borderRadius: 10 }} bodyStyle={{ padding: 12 }}>
            <Flex align="center" gap={12} justify="space-between">
              <Space>
                {iconComponents[selectedMethodInfo.icon]}
                <Text>{selectedMethodInfo.method_name}</Text>
              </Space>
              <Radio checked />
            </Flex>
          </Card>
        )
      ) : (
        <Radio.Group value={method} style={{ width: "100%" }}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {methods.map((item) => (
              <Card
                key={item.id}
                hoverable={item.is_active}
                onClick={() => choose(item)}
                style={{
                  borderRadius: 10,
                  borderColor: method === item.id ? "#1677ff" : undefined,
                  opacity: item.is_active ? 1 : 0.5,
                  cursor: item.is_active ? "pointer" : "not-allowed",
                }}
                bodyStyle={{ padding: 12 }}
              >
                <Flex align="center" gap={12} justify="space-between">
                  <Space>
                    {iconComponents[item.icon]}
                    <Text>
                      {item.method_name}{" "}
                      {!item.is_active && "(ยังไม่พร้อมใช้งาน)"}
                    </Text>
                  </Space>
                  <Radio value={item.id} disabled={!item.is_active} />
                </Flex>
              </Card>
            ))}
          </Space>
        </Radio.Group>
      )}
    </Card>
  );
};

export default PaymentMethodSelector;
