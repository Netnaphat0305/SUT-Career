import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
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
import './Interview.css';
import type { InterviewScheduling } from '../../interfaces/InterviewScheduling';
import { interviewAPI } from '../../services/https';

const { Title, Text } = Typography;

type DateStatus = 'available' | 'busy' | 'selected' | 'default';

const Interview: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<InterviewScheduling[]>([]);
  const navigate = useNavigate();
  // ✅ อ่าน applicationId จาก query string
  const params = new URLSearchParams(window.location.search);
  const jobApplicationId = Number(params.get('applicationId'));

  // โหลดตารางจาก backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await interviewAPI.GetInterviewsTableByApplication(jobApplicationId);
        if (Array.isArray(res)) {
          setSchedules(res);
        } else if (Array.isArray(res.data)) {
          setSchedules(res.data);
        } else {
          setSchedules([]);
        }

      } catch {
        message.error("โหลดตารางสัมภาษณ์ไม่สำเร็จ");
      }
    };
    fetchData();
  }, [jobApplicationId]);

  // ดึง schedules ของ "วัน" ที่เลือกโดยตรง (ไม่สร้าง interface ใหม่)
  const getSchedulesForDate = (date: Dayjs): InterviewScheduling[] => {
    return schedules.filter(s => dayjs(s.DateAndTimeStart).isSame(date, 'day'));
  };

  const getDateStatus = (date: Dayjs): DateStatus => {
    const daySchedules = getSchedulesForDate(date);
    if (selectedDate && date.isSame(selectedDate, 'day')) return 'selected';
    if (daySchedules.length === 0) return 'default';
    if (daySchedules.every(s => s.Status !== 'available')) return 'busy';
    return 'available';
  };

  const handleDateClick = (date: Dayjs) => {
    const status = getDateStatus(date);
    if (status !== 'default') {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedDate || !selectedTimeSlot) return;

    if (!jobApplicationId) {
      message.error('ไม่พบ Application ID');
      return;
    }
    try {
      await interviewAPI.book({
        schedule_id: selectedTimeSlot,
        job_application_id: jobApplicationId,
      });
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (e: any) {
      message.error(e?.response?.data?.error || 'จองสัมภาษณ์ไม่สำเร็จ');
    }
  };

  const dateCellRender = (date: Dayjs) => {
    const status = getDateStatus(date);
    const isCurrentMonth = date.month() === currentMonth.month();

    if (!isCurrentMonth) return null;

    let bg = 'transparent';
    let color = '#000';
    let cursor = 'default';

    if (status === 'selected') {
      bg = '#a8e6a3'; color = '#2d5a2d'; cursor = 'pointer';
    } else if (status === 'available') {
      bg = '#c9c9c9'; color = '#8c8c8c'; cursor = 'pointer';
    } else if (status === 'busy') {
      bg = '#ff7875'; color = '#fff'; cursor = 'not-allowed';
    }

    return (
      <div
        style={{
          backgroundColor: bg, color, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '16px', cursor
        }}
        onClick={() => handleDateClick(date)}
      >
        {date.date()}
      </div>
    );
  };

  const getCurrentDaySchedules = (): InterviewScheduling[] => {
    if (!selectedDate) return [];
    return getSchedulesForDate(selectedDate);
  };

  const selectedSlot = selectedTimeSlot
    ? getCurrentDaySchedules().find(s => s.ID === selectedTimeSlot)
    : undefined;

  return (
    <div className="interview-container">
      <div className="interview-header">
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              {/* Month Navigation */}
              <div className="month-nav">
                <Button type="text" icon={<LeftOutlined />} onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} />
                <div className="month-display">{currentMonth.format('MMMM YYYY')}</div>
                <Button type="text" icon={<RightOutlined />} onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} />
              </div>

              {/* Calendar Header */}
              <div className="calendar-header">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid">
                {Array.from({ length: 42 }, (_, i) => {
                  const startOfMonth = currentMonth.startOf('month').startOf('week');
                  const currentDate = startOfMonth.add(i, 'day');
                  const isCurrentMonth = currentDate.month() === currentMonth.month();
                  return (
                    <div key={i} className={`calendar-cell ${!isCurrentMonth ? 'cell-other-month' : ''}`}>
                      {isCurrentMonth
                        ? dateCellRender(currentDate)
                        : <div className="cell-disabled">{currentDate.date()}</div>}
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
                  <div className="legend-item"><div className="legend-dot selected" /> <Text>วันที่เลือก</Text></div>
                  <div className="legend-item"><div className="legend-dot busy" /> <Text>เต็ม</Text></div>
                  <div className="legend-item"><div className="legend-dot available" /> <Text>ว่าง</Text></div>
                </Space>
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <Card
                  title={<Title level={3} style={{ margin: 0 }}>{selectedDate.date()} {selectedDate.format('ddd').toUpperCase()} {selectedDate?.year()}</Title>}
                  className="time-slot-card"
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {getCurrentDaySchedules().map(s => (
                      <div key={s.ID} className="time-slot-row">
                        <Text strong>
                          {dayjs(s.DateAndTimeStart).format('HH:mm')} - {dayjs(s.DateAndTimeEnd).format('HH:mm')}
                        </Text>
                        <div
                          className={`time-slot-btn ${String(s.Status).toLowerCase()} ${selectedTimeSlot === s.ID ? 'selected' : ''}`}
                          onClick={() => setSelectedTimeSlot(s.ID)}
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
                disabled={!selectedTimeSlot}
                className={`schedule-btn ${selectedTimeSlot ? 'enabled' : 'disabled'}`}
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
            {selectedDate?.format('dddd')} ที่ {selectedDate?.date()} {selectedDate?.format('MMMM')} {selectedDate?.year()} เวลา {selectedSlot ? dayjs(selectedSlot.DateAndTimeStart).format('HH:mm') : ''}
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            รายละเอียดการนัดสัมภาษณ์:
          </Text>
          <div className="date-detail">
            {selectedSlot?.Detail || "ไม่มีรายละเอียด"}
          </div>
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
            <CloseOutlined
              onClick={() => {
                setShowSuccessModal(false),
                  navigate("/my-applications")
              }
              } />
          </div>
          <CheckCircleOutlined className="modal-icon" />
          <Title level={4}>นัดสัมภาษณ์สำเร็จ</Title>
          <div className="Show-success-booked-detail">
            <Text strong style={{fontSize: "20px"}}>
              {selectedDate?.format('dddd')} ที่ {selectedDate?.date()} {selectedDate?.format('MMMM')} {selectedDate?.year()}
            </Text>
            <br />
            <Text>
              เวลา {selectedSlot ? dayjs(selectedSlot.DateAndTimeStart).format('HH:mm') : ""} -
              {selectedSlot ? dayjs(selectedSlot.DateAndTimeEnd).format('HH:mm') : ""}
            </Text>
            <br />
            <Text>
              รายละเอียด: {selectedSlot?.Detail || "ไม่มีรายละเอียด"}
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Interview;
