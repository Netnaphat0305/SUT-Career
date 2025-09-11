import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, Row, Col, Modal, message } from 'antd';
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
import './Interview.css';   // ✅ import CSS

const { Title, Text } = Typography;

// สร้าง Interface ให้สอดคล้องกับโครงสร้างจาก Database
interface InterviewSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "unavailable";
}

type DateStatus = 'available' | 'busy' | 'selected' | 'default';

// --- Mock API Functions for Database Interaction ---
// ฟังก์ชันจำลองเพื่อดึงช่วงเวลาที่ว่างจาก Database
const fetchAvailableTimeSlots = async (): Promise<Record<string, InterviewSlot[]>> => {
  // สมมติว่านี่คือข้อมูลช่วงเวลาที่ผู้ว่าจ้างกำหนดไว้
  return Promise.resolve({
    "2024-12-08": [
      { id: "slot-a", startTime: "09:00", endTime: "10:00", status: "available" },
      { id: "slot-b", startTime: "10:00", endTime: "11:00", status: "available" },
      { id: "slot-c", startTime: "11:00", endTime: "12:00", status: "available" },
    ],
    "2024-12-09": [
      { id: "slot-d", startTime: "13:00", endTime: "14:00", status: "available" },
      { id: "slot-e", startTime: "14:00", endTime: "15:00", status: "available" },
    ],
  });
};

// ฟังก์ชันจำลองเพื่อบันทึกการนัดหมายลง Database
const bookTimeSlot = async (slotId: string, date: string, studentId: string) => {
  console.log(`Student ${studentId} is booking slot ${slotId} on ${date}`);
  return Promise.resolve({ success: true });
};

const Interview: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs('2024-12-01'));
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // โหลดข้อมูลช่วงเวลาที่ว่างจาก "ฐานข้อมูล"
  const [availableSlots, setAvailableSlots] = useState<Record<string, InterviewSlot[]>>({});
  useEffect(() => {
    const loadAvailableSlots = async () => {
      const slots = await fetchAvailableTimeSlots();
      setAvailableSlots(slots);
    };
    loadAvailableSlots();
  }, []);

  const getDateStatus = (date: Dayjs): DateStatus => {
    const dateKey = date.format("YYYY-MM-DD");
    const isCurrentMonth = date.month() === currentMonth.month();

    if (!isCurrentMonth) return 'default';
    if (selectedDate && date.isSame(selectedDate, 'day')) return 'selected';

    const daySlots = availableSlots[dateKey];
    if (daySlots && daySlots.length > 0) {
      return 'available';
    }

    return 'default';
  };

  const handleDateClick = (date: Dayjs) => {
    const status = getDateStatus(date);
    if (status === 'available' || status === 'selected') {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
    }
  };

  const handleTimeSlotClick = (slotId: string) => {
    setSelectedTimeSlot(selectedTimeSlot === slotId ? null : slotId);
  };

  const handleScheduleInterview = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    try {
      await bookTimeSlot(selectedTimeSlot, selectedDate.format("YYYY-MM-DD"), "student-id-123");
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      // Optional: Refresh data after booking
      const updatedSlots = await fetchAvailableTimeSlots();
      setAvailableSlots(updatedSlots);
    } catch (error) {
      message.error("Failed to book the interview slot.");
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

  const getCurrentDateSlots = () => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.format("YYYY-MM-DD");
    return availableSlots[dateKey] || [];
  };

  return (
    <div className="interview-container">
      {/* Header */}
      <div className="interview-header">
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              {/* Month Navigation */}
              <div className="month-nav">
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={() => onMonthChange('prev')}
                  className="nav-btn"
                />
                <div className="month-display">
                  {currentMonth.format('MMMM YYYY')}
                </div>
                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={() => onMonthChange('next')}
                  className="nav-btn"
                />
              </div>

              {/* Calendar Header */}
              <div className="calendar-header">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="calendar-header-cell">{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid">
                {Array.from({ length: 42 }, (_, index) => {
                  const startOfMonth = currentMonth.startOf('month');
                  const startOfWeek = startOfMonth.startOf('week');
                  const currentDate = startOfWeek.add(index, 'day');
                  const isCurrentMonth = currentDate.month() === currentMonth.month();

                  return (
                    <div
                      key={index}
                      className={`calendar-cell ${!isCurrentMonth ? 'cell-other-month' : ''}`}
                    >
                      {isCurrentMonth
                        ? dateCellRender(currentDate)
                        : <div className="cell-disabled">{currentDate.date()}</div>
                      }
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
                  <div className="legend-item">
                    <div className="legend-dot selected" /> <Text>วันที่เลือก</Text>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot busy" /> <Text>เต็ม</Text>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot available" /> <Text>ว่าง</Text>
                  </div>
                </Space>
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      {selectedDate.date()} {selectedDate.format('ddd').toUpperCase()}
                    </Title>
                  }
                  className="time-slot-card"
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {getCurrentDateSlots().map((slot) => (
                      <div key={slot.id} className="time-slot-row">
                        <Text strong>{slot.startTime} - {slot.endTime}</Text>
                        <div
                          className={`time-slot-btn ${slot.status} ${selectedTimeSlot === slot.id ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotClick(slot.id)}
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
                className={`schedule-btn ${isScheduleButtonEnabled ? 'enabled' : 'disabled'}`}
                onClick={() => setShowConfirmModal(true)}
              >
                นัดสัมภาษณ์
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Confirmation Modal */}
      <Modal open={showConfirmModal} footer={null} closable={false} centered width={400} className="modal-box">
        <div className="modal-content">
          <div className="modal-close">
            <CloseOutlined onClick={() => setShowConfirmModal(false)} />
          </div>
          <QuestionCircleOutlined className="modal-icon" />
          <Title level={4}>นัดสัมภาษณ์</Title>
          <Text className="modal-text">
            {selectedDate?.format('dddd')} ที่ {selectedDate?.date()} {selectedDate?.format('MMMM')} {selectedDate?.year()} เวลา {getCurrentDateSlots().find(s => s.id === selectedTimeSlot)?.startTime}
          </Text>
          <Text className="modal-warning">ไม่สามารถยกเลิกในภายหลังได้ !</Text>
          <div className="modal-actions">
            <Button className="modal-cancel" onClick={() => setShowConfirmModal(false)}>ยกเลิก</Button>
            <Button type="primary" className="modal-confirm" onClick={handleScheduleInterview}>ยืนยัน</Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal open={showSuccessModal} footer={null} closable={false} centered width={400} className="modal-box">
        <div className="modal-content success">
          <div className="modal-close">
            <CloseOutlined onClick={() => { setShowSuccessModal(false); setSelectedDate(null); setSelectedTimeSlot(null); }} />
          </div>
          <CheckCircleOutlined className="modal-icon" />
          <Title level={4}>นัดสัมภาษณ์สำเร็จ</Title>
        </div>
      </Modal>
    </div>
  );
};
export default Interview;