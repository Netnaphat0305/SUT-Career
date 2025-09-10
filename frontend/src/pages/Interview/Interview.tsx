import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  Space,
  Row,
  Col,
  Modal,
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
const { Title, Text } = Typography;

interface TimeSlot {
  time: string;
  available: boolean;
}

type DateStatus = 'available' | 'busy' | 'selected' | 'default';

const Interview: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs('2024-12-01'));
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '13:00', available: false },
    { time: '14:00', available: true },
    { time: '15:00', available: false },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
  ];

  // Mock data for calendar status - simulating employer specified availability
  const getDateStatus = (date: Dayjs): DateStatus => {
    const day = date.date();
    const isCurrentMonth = date.month() === currentMonth.month();
  
    if (!isCurrentMonth) return 'default';
  
    if (selectedDate && date.isSame(selectedDate, 'day')) return 'selected';
  
    // Simulated employer availability (busy dates)
    if ([27, 30].includes(day)) return 'busy';
  
    // Simulated employer availability (available dates)
    if ([1, 2, 5, 8, 9, 12, 15, 16, 19, 22, 23].includes(day)) return 'available';
  
    return 'default'; // Regular dates (not available for booking)
  };

  const handleDateClick = (date: Dayjs) => {
    const status = getDateStatus(date);
    if (status === 'available' || status === 'selected') {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
    // Don't allow clicking on busy or default dates
  };

  const handleTimeSlotClick = (time: string, available: boolean) => {
    if (available) {
      setSelectedTimeSlot(selectedTimeSlot === time ? null : time);
    }
  };

  const dateCellRender = (date: Dayjs) => {
    const status = getDateStatus(date);
    const isCurrentMonth = date.month() === currentMonth.month();
    
    if (!isCurrentMonth) return null;

    let backgroundColor = '';
    let color = '';
    let cursor = 'default';
    
    switch (status) {
      case 'selected':
        backgroundColor = '#a8e6a3';
        color = '#2d5a2d';
        cursor = 'pointer';
        break;
      case 'available':
        backgroundColor = '#c9c9c9';
        color = '#8c8c8c';
        cursor = 'pointer';
        break;
      case 'busy':
        backgroundColor = '#ff7875';
        color = '#ffffff';
        cursor = 'not-allowed';
        break;
      default:
        backgroundColor = 'transparent';
        color = '#000000';
        cursor = 'default';
    }

    return (
      <div
        style={{
          backgroundColor,
          color,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor
        }}
        onClick={() => handleDateClick(date)}
      >
        {date.date()}
      </div>
    );
  };

  const onMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(currentMonth.subtract(1, 'month'));
    } else {
      setCurrentMonth(currentMonth.add(1, 'month'));
    }
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const isScheduleButtonEnabled = selectedDate && selectedTimeSlot;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ padding: '24px' }}>
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              {/* Month Navigation */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <Button 
                  type="text" 
                  icon={<LeftOutlined />}
                  onClick={() => onMonthChange('prev')}
                  style={{ 
                    backgroundColor: '#2c5aa0',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px'
                  }}
                />
                <div style={{
                  backgroundColor: '#2c5aa0',
                  color: 'white',
                  padding: '12px 48px',
                  borderRadius: '24px',
                  margin: '0 16px',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {currentMonth.format('MMMM YYYY')}
                </div>
                <Button 
                  type="text" 
                  icon={<RightOutlined />}
                  onClick={() => onMonthChange('next')}
                  style={{ 
                    backgroundColor: '#2c5aa0',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px'
                  }}
                />
              </div>

              {/* Calendar Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)',
                backgroundColor: '#2c5aa0',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} style={{ padding: '16px' }}>{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)',
                border: '1px solid #d9d9d9'
              }}>
                {Array.from({ length: 42 }, (_, index) => {
                  const startOfMonth = currentMonth.startOf('month');
                  const startOfWeek = startOfMonth.startOf('week');
                  const currentDate = startOfWeek.add(index, 'day');
                  const isCurrentMonth = currentDate.month() === currentMonth.month();
                  
                  return (
                    <div
                      key={index}
                      style={{
                        height: '80px',
                        border: '1px solid #d9d9d9',
                        position: 'relative',
                        backgroundColor: !isCurrentMonth ? '#f5f5f5' : 'white'
                      }}
                    >
                      {isCurrentMonth && dateCellRender(currentDate)}
                      {!isCurrentMonth && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#bfbfbf',
                          fontSize: '16px'
                        }}>
                          {currentDate.date()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Legend */}
              <Card size="small">
                <Space direction="vertical" size="small">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: '#a8e6a3', 
                      borderRadius: '50%' 
                    }} />
                    <Text>วันที่เลือก</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: '#ff7875', 
                      borderRadius: '50%' 
                    }} />
                    <Text>เต็ม</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: '#c9c9c9', 
                      borderRadius: '50%' 
                    }} />
                    <Text>ว่าง</Text>
                  </div>
                </Space>
              </Card>

              {/* Time Slots - Only show when date is selected */}
              {selectedDate && (
                <Card 
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      {selectedDate.date()} {selectedDate.format('ddd').toUpperCase()}
                    </Title>
                  }
                  style={{ backgroundColor: '#e6f4ff' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        <Text strong>{slot.time}</Text>
                        <div
                          style={{
                            width: '60px',
                            height: '20px',
                            backgroundColor: slot.available 
                              ? (selectedTimeSlot === slot.time ? '#0050b3' : '#1890ff')
                              : '#d9d9d9',
                            borderRadius: '10px',
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            border: selectedTimeSlot === slot.time ? '2px solid #003a8c' : 'none'
                          }}
                          onClick={() => handleTimeSlotClick(slot.time, slot.available)}
                        />
                      </div>
                    ))}
                  </Space>
                </Card>
              )}

              {/* Schedule Button */}
              <Button 
                type="primary" 
                size="large" 
                block
                disabled={!isScheduleButtonEnabled}
                style={{ 
                  backgroundColor: isScheduleButtonEnabled ? '#1890ff' : '#d9d9d9',
                  borderColor: isScheduleButtonEnabled ? '#1890ff' : '#d9d9d9',
                  color: isScheduleButtonEnabled ? 'white' : '#8c8c8c',
                  borderRadius: '24px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isScheduleButtonEnabled ? 'pointer' : 'not-allowed'
                }}
                onClick={() => {
                  if (isScheduleButtonEnabled) {
                    setShowConfirmModal(true);
                  }
                }}
              >
                นัดสัมภาษณ์
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        footer={null}
        closable={false}
        centered
        width={400}
        style={{ textAlign: 'center' }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <CloseOutlined 
              style={{ fontSize: '16px', color: '#8c8c8c', cursor: 'pointer' }}
              onClick={() => setShowConfirmModal(false)}
            />
          </div>
          <QuestionCircleOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#1890ff', 
              marginBottom: '16px',
              border: '2px solid #1890ff',
              borderRadius: '50%',
              padding: '8px'
            }} 
          />
          <Title level={4} style={{ marginBottom: '8px' }}>นัดสัมภาษณ์</Title>
          <Text style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
            {selectedDate?.format('dddd')} ที่ {selectedDate?.date()} {selectedDate?.format('MMMM')} {selectedDate?.year()} เวลา {selectedTimeSlot}
          </Text>
          <Text style={{ color: '#ff4d4f', fontSize: '14px', display: 'block', marginBottom: '24px' }}>
            ไม่สามารถยกเลิกในภายหลังได้ !
          </Text>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button 
              size="large"
              style={{ 
                borderRadius: '20px',
                width: '100px',
                border: '1px solid #1890ff',
                color: '#1890ff'
              }}
              onClick={() => setShowConfirmModal(false)}
            >
              ยกเลิก
            </Button>
            <Button 
              type="primary"
              size="large"
              style={{ 
                borderRadius: '20px',
                width: '100px',
                backgroundColor: '#1890ff'
              }}
              onClick={() => {
                setShowConfirmModal(false);
                setShowSuccessModal(true);
              }}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        footer={null}
        closable={false}
        centered
        width={400}
        style={{ textAlign: 'center' }}
      >
        <div style={{ padding: '40px 20px' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <CloseOutlined 
              style={{ fontSize: '16px', color: '#8c8c8c', cursor: 'pointer' }}
              onClick={() => {
                setShowSuccessModal(false);
                // Reset selections after successful booking
                setSelectedDate(null);
                setSelectedTimeSlot(null);
              }}
            />
          </div>
          <CheckCircleOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#1890ff', 
              marginBottom: '24px',
              border: '2px solid #1890ff',
              borderRadius: '50%',
              padding: '8px'
            }} 
          />
          <Title level={4} style={{ margin: 0 }}>นัดสัมภาษณ์สำเร็จ</Title>
        </div>
      </Modal>
    </div>
  );
};

export default Interview;
