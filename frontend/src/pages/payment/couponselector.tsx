// src/components/payment/CouponSelector.tsx
import React from "react";
import { Card, Radio, Typography, Flex, Space, theme, Button } from "antd";
import { TagOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import type { Discount } from "../../interfaces/discount";

const { Text, Title } = Typography;

type Props = {
  coupons: Discount[];
  usedCouponIds: Set<number>;
  now: Date;
  grossAmount: number;
  couponId: number;
  setCouponId: (id: number) => void;
  isWithin: (now: Date, from?: any, to?: any) => boolean;
  calcDiscount: (c: Discount, base: number) => number;
  toTHDate: (d?: Date | null) => string;
};

const CouponSelector: React.FC<Props> = ({
  coupons,
  usedCouponIds,
  now,
  grossAmount,
  couponId,
  setCouponId,
  isWithin,
  calcDiscount,
  toTHDate,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const { token } = theme.useToken();

  const selected =
    couponId === 0 ? undefined : coupons.find((c) => c.ID === couponId);

  const labelOf = (c?: Discount) => {
    if (!c) return "ไม่ใช้ส่วนลด";
    const t = (c.discount_type || "").toLowerCase();
    const isPercent = t === "percent" || t === "percentage";
    const typed = isPercent
      ? `ส่วนลด ${Number(c.discount_value)}%`
      : `ส่วนลด ${Number(c.discount_value).toLocaleString()} บาท`;
    const off = calcDiscount(c, Number(grossAmount || 0));
    return `${typed}${off > 0 ? ` • ลดไป ${off.toLocaleString()} บาท` : ""}`;
  };

  return (
    <Card style={{ borderRadius: 12, marginBottom: 12 }}>
      {/* Header */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>
          คูปองส่วนลด
        </Title>
        <Button type="link" onClick={() => setExpanded((v) => !v)}>
          <Space>
            <Text type="secondary">{expanded ? "ย่อลง" : "ดูทั้งหมด"}</Text>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </Space>
        </Button>
      </Flex>

      {!expanded ? (
        <Card style={{ borderRadius: 10 }} bodyStyle={{ padding: 12 }}>
          <Flex align="left" gap={12} justify="space-between">
            <Space>
              <TagOutlined style={{ fontSize: 20 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text style={{ textAlign: "left" }}>
                  {couponId === 0 ? "ไม่ใช้ส่วนลด" : selected?.discount_name}
                </Text>
                {couponId !== 0 && (
                  <Text type="secondary" style={{ lineHeight: 1.1 }}>
                    {labelOf(selected)}
                  </Text>
                )}
              </div>
            </Space>
            <Radio checked />
          </Flex>
        </Card>
      ) : (
        // Expanded list
        <Radio.Group
          value={couponId}
          onChange={(e) => {
            setCouponId(e.target.value);
            setExpanded(false);
          }}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {/* ไม่ใช้ส่วนลด */}
            <Card
              style={{
                borderRadius: 10,
                borderColor: couponId === 0 ? token.colorPrimary : undefined,
              }}
              hoverable
              bodyStyle={{ padding: 12 }}
              onClick={() => {
                setCouponId(0);
                setExpanded(false);
              }}
            >
              <Flex align="center" gap={12} justify="space-between">
                <Space>
                  <TagOutlined style={{ fontSize: 20 }} />
                  <Text>ไม่ใช้ส่วนลด</Text>
                </Space>
                <Radio value={0} />
              </Flex>
            </Card>

            {coupons.length === 0 && (
              <Text type="secondary">ยังไม่มีส่วนลดที่ใช้ได้ในขณะนี้</Text>
            )}

            {/* รายการคูปอง */}
            {coupons.map((c) => {
              const timeOk = isWithin(now, c.valid_from, c.valid_until);
              const alreadyUsed = usedCouponIds.has(c.ID);
              const valid = timeOk && !alreadyUsed;

              const startAt = c.valid_from ? new Date(c.valid_from) : null;
              const endAt = c.valid_until ? new Date(c.valid_until) : null;

              const row = (
                <div
                  style={{
                    display: "flex",
                    alignItems: "left",
                    justifyContent: "space-between",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <TagOutlined style={{ fontSize: 20 }} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Text strong>{c.discount_name}</Text>
                        <Text type="secondary">{labelOf(c)}</Text>
                      </div>

                      {!valid && (
                        <>
                          {alreadyUsed ? (
                            <Text type="danger" style={{ marginTop: 2 }}>
                              คูปองนี้ถูกใช้งานแล้ว โดยผู้ใช้นี้
                            </Text>
                          ) : (
                            <Text type="danger" style={{ marginTop: 2 }}>
                              ใช้ได้ระหว่าง {toTHDate(startAt)} -{" "}
                              {toTHDate(endAt)}
                            </Text>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <Radio
                    value={c.ID}
                    disabled={!valid}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );

              return (
                <Card
                  key={c.ID}
                  style={{
                    borderRadius: 10,
                    borderColor:
                      couponId === c.ID ? token.colorPrimary : undefined,
                    opacity: valid ? 1 : 0.55,
                    cursor: valid ? "pointer" : "not-allowed",
                  }}
                  hoverable={valid}
                  bodyStyle={{ padding: 12 }}
                  onClick={() => {
                    if (!valid) return;
                    setCouponId(c.ID);
                    setExpanded(false);
                  }}
                >
                  {row}
                </Card>
              );
            })}
          </Space>
        </Radio.Group>
      )}
    </Card>
  );
};

export default CouponSelector;
