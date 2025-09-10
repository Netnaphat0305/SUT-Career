"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button, Card, Typography, Space, Row, Col, Modal, TimePicker, Form, message } from "antd"
import { LeftOutlined, RightOutlined, CheckCircleOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import "dayjs/locale/th"

// Import the regular CSS file
import "./InterviewScheduling.css"

const { Title, Text } = Typography
const { RangePicker } = TimePicker

interface InterviewSlot {
  id: string
  startTime: string
  endTime: string
  status: "available" | "booked" | "unavailable"
  intervieweeId?: string
}

type DateStatus = "available" | "booked" | "selected" | "default"

const fetchTimeSlots = async (): Promise<Record<string, InterviewSlot[]>> => {
  return Promise.resolve({
    "2024-12-08": [
      { id: "slot1", startTime: "09:00", endTime: "10:00", status: "available" },
      { id: "slot2", startTime: "10:00", endTime: "11:00", status: "booked", intervieweeId: "std1" },
      { id: "slot3", startTime: "13:00", endTime: "14:00", status: "available" },
      { id: "slot4", startTime: "15:00", endTime: "16:00", status: "booked", intervieweeId: "std2" },
    ],
  })
}

const updateTimeSlots = async (newSlots: Record<string, InterviewSlot[]>) => {
  console.log("Saving to database...", newSlots)
  return Promise.resolve(newSlots)
}

const InterviewScheduling: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs("2024-12-01"))
  const [showAddTimeModal, setShowAddTimeModal] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [form] = Form.useForm()
  const [selectedTimeSlotForDeletion, setSelectedTimeSlotForDeletion] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [timeSlots, setTimeSlots] = useState<Record<string, InterviewSlot[]>>({})

  useEffect(() => {
    const loadSlots = async () => {
      const slots = await fetchTimeSlots()
      setTimeSlots(slots)
    }
    loadSlots()
  }, [])

  const getDateStatus = (date: Dayjs): DateStatus => {
    const dateKey = date.format("YYYY-MM-DD")
    const isCurrentMonth = date.month() === currentMonth.month()

    if (!isCurrentMonth) return "default"
    if (selectedDate && date.isSame(selectedDate, "day")) return "selected"

    const daySlots = timeSlots[dateKey]
    if (daySlots && daySlots.length > 0) {
      const hasBooked = daySlots.some((slot) => slot.status === "booked")
      const hasAvailable = daySlots.some((slot) => slot.status === "available")

      if (hasBooked && !hasAvailable) return "booked"
      if (hasAvailable) return "available"
    }

    return "default"
  }

  const handleDateClick = (date: Dayjs) => {
    if (date.month() === currentMonth.month()) {
      setSelectedDate(date)
    }
  }

  const handleAddTimeSlot = async () => {
    if (selectedDate && selectedTimeRange) {
      const dateKey = selectedDate.format("YYYY-MM-DD")
      const newSlot: InterviewSlot = {
        id: `slot-${Date.now()}`,
        startTime: selectedTimeRange[0].format("HH:mm"),
        endTime: selectedTimeRange[1].format("HH:mm"),
        status: "available",
      }
      const updatedSlots = { ...timeSlots, [dateKey]: [...(timeSlots[dateKey] || []), newSlot] }

      try {
        await updateTimeSlots(updatedSlots)
        setTimeSlots(updatedSlots)
        setShowAddTimeModal(false)
        setShowSuccessModal(true)
        setSelectedTimeRange(null)
        form.resetFields()
      } catch (error) {
        message.error("Failed to add time slot.")
      }
    }
  }

  const handleDeleteTimeSlot = async () => {
    if (selectedDate && selectedTimeSlotForDeletion) {
      const dateKey = selectedDate.format("YYYY-MM-DD")
      const updatedSlotsForDay = timeSlots[dateKey]?.filter((slot) => slot.id !== selectedTimeSlotForDeletion)
      const updatedSlots = { ...timeSlots, [dateKey]: updatedSlotsForDay || [] }

      try {
        await updateTimeSlots(updatedSlots)
        setTimeSlots(updatedSlots)
        setShowDeleteModal(false)
        setSelectedTimeSlotForDeletion(null)
        message.success("ลบช่วงเวลาสำเร็จ")
      } catch (error) {
        message.error("Failed to delete time slot.")
      }
    }
  }

  const getCurrentDateSlots = () => {
    if (!selectedDate) return []
    return timeSlots[selectedDate.format("YYYY-MM-DD")] || []
  }

  const dateCellRender = (date: Dayjs) => {
    if (date.month() !== currentMonth.month()) return null

    let statusClassName = ""
    switch (getDateStatus(date)) {
      case "selected": statusClassName = "date-cell-selected"; break
      case "available": statusClassName = "date-cell-available"; break
      case "booked": statusClassName = "date-cell-booked"; break
      default: statusClassName = "date-cell-default";
    }

    return (
      <div className={`date-cell ${statusClassName}`} onClick={() => handleDateClick(date)}>
        {date.date()}
      </div>
    )
  }

  const onMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth(currentMonth[direction === "prev" ? "subtract" : "add"](1, "month"))
    setSelectedDate(null)
  }

  const handleTimeSlotClick = (slotId: string) => {
    setSelectedTimeSlotForDeletion(slotId === selectedTimeSlotForDeletion ? null : slotId)
  }

  return (
    <div className="employer-schedule-container">
      <div className="employer-schedule-main-content">
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              <div className="month-navigation">
                <Button type="text" icon={<LeftOutlined />} onClick={() => onMonthChange("prev")} className="month-nav-button" />
                <div className="month-display">{currentMonth.format("MMMM YYYY")}</div>
                <Button type="text" icon={<RightOutlined />} onClick={() => onMonthChange("next")} className="month-nav-button" />
              </div>

              <div className="calendar-header">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (<div key={day} className="day-header">{day}</div>))}
              </div>

              <div className="calendar-grid">
                {Array.from({ length: 42 }, (_, index) => {
                  const currentDate = currentMonth.startOf("month").startOf("week").add(index, "day")
                  const isCurrentMonth = currentDate.month() === currentMonth.month()
                  return (
                    <div key={index} className={`date-cell-wrapper ${!isCurrentMonth ? "date-cell-wrapper-inactive" : ""}`}>
                      {isCurrentMonth ? dateCellRender(currentDate) : <div className="inactive-date-number">{currentDate.date()}</div>}
                    </div>
                  )
                })}
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card size="small">
                <Space direction="vertical" size="small">
                  <div className="legend-item"><div className="legend-dot legend-dot-selected" /><Text>วันที่เลือก</Text></div>
                  <div className="legend-item"><div className="legend-dot legend-dot-booked" /><Text>นักศึกษาได้เลือกช่วงเวลาแล้ว</Text></div>
                  <div className="legend-item"><div className="legend-dot legend-dot-available" /><Text>ช่วงเวลาที่คุณได้ใส่แล้ว</Text></div>
                </Space>
              </Card>

              {selectedDate && (
                <Card title={<Title level={4} style={{ margin: 0 }}>{selectedDate.date()} {selectedDate.format("ddd").toUpperCase()}</Title>} className="time-slots-card">
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {getCurrentDateSlots().map((slot) => {
                      const isSelected = selectedTimeSlotForDeletion === slot.id
                      let pillClassName = "time-slot-pill"
                      // ตรรกะของ pillClassName ยังคงเหมือนเดิม เพื่อให้ pill ที่ถูกเลือกเปลี่ยนสีได้
                      if (isSelected) pillClassName += " time-slot-pill-selected"
                      else if (slot.status === "available") pillClassName += " time-slot-pill-available"
                      else pillClassName += " time-slot-pill-booked"

                      return (
                        <div key={slot.id} className="time-slot-item">
                          <Text strong>{slot.startTime} - {slot.endTime}</Text>

                          {/* เพิ่มส่วนนี้เข้ามา: จะแสดงไอคอนและ pill คู่กัน */}
                          <div className="time-slot-actions">
                            {/* เงื่อนไข: จะแสดงไอคอนถังขยะก็ต่อเมื่อ status ไม่ใช่ "booked" */}
                            {slot.status !== "booked" && (
                              <DeleteOutlined
                                className="delete-icon" // เพิ่ม class ไว้สำหรับ styling
                                onClick={() => handleTimeSlotClick(slot.id)} // ย้าย onClick มาไว้ที่นี่
                              />
                            )}

                            {/* Pill จะทำหน้าที่แค่แสดงสถานะ ไม่มี onClick แล้ว */}
                            <div className={pillClassName} />
                          </div>
                        </div>
                      )
                    })}
                    {getCurrentDateSlots().length === 0 && <Text className="no-slots-text">ยังไม่มีช่วงเวลาที่กำหนด</Text>}
                  </Space>
                </Card>
              )}

              <Button type="primary" size="large" block disabled={!selectedDate} className="main-action-button" onClick={() => { if (selectedDate) { selectedTimeSlotForDeletion ? setShowDeleteModal(true) : setShowAddTimeModal(true) } }}>
                {selectedTimeSlotForDeletion ? "ลบช่วงเวลา" : "เพิ่มช่วงเวลา"}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Modal open={showAddTimeModal} footer={null} closable={false} centered width={500} styles={{ body: { padding: 0} }}>
        <div className="modal-centered-content">
          <div className="modal-inner-content">
            <CloseOutlined className="modal-close-button" onClick={() => { setShowAddTimeModal(false); setSelectedTimeRange(null); form.resetFields() }} />
            <Title level={3} className="modal-title">{selectedDate?.format("dddd D MMMM YYYY")}</Title>
            <Form form={form} className="modal-form">
              <Form.Item name="timeRange" className="modal-form-item">
                <RangePicker format="HH:mm" placeholder={["เวลาเริ่ม", "เวลาสิ้นสุด"]} className="modal-time-picker" onChange={(times) => setSelectedTimeRange(times as [Dayjs, Dayjs])} />
              </Form.Item>
            </Form>
            <div className="modal-action-buttons">
              <Button size="large" className="modal-cancel-button" onClick={() => { setShowAddTimeModal(false); setSelectedTimeRange(null); form.resetFields() }}>ยกเลิก</Button>
              <Button type="primary" size="large" disabled={!selectedTimeRange} className="modal-confirm-button" onClick={handleAddTimeSlot}>ยืนยัน</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteModal} footer={null} closable={false} centered width={500} styles={{ body: { padding: 0} }}>
        <div className="modal-centered-content">
          <div className="modal-inner-content">
            <CloseOutlined className="modal-close-button" onClick={() => { setShowDeleteModal(false); setSelectedTimeSlotForDeletion(null) }} />
            <Title level={4} className="modal-title">{selectedDate?.format("dddd ที่ D MMMM YYYY")}</Title>
            <Text className="delete-modal-info-text">เป็นช่วงเวลาที่คุณได้เพิ่มการนัดสัมภาษณ์ไว้แล้ว</Text>
            <Text className="delete-modal-warning-text">คุณต้องการลบช่วงเวลา</Text>
            <Text className="delete-modal-question-text">นัดสัมภาษณ์หรือไม่ ?</Text>
            <div className="modal-action-buttons">
              <Button size="large" className="modal-cancel-button" onClick={() => { setShowDeleteModal(false); setSelectedTimeSlotForDeletion(null) }}>ยกเลิก</Button>
              <Button type="primary" size="large" className="modal-confirm-button" onClick={handleDeleteTimeSlot}>ยืนยัน</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showSuccessModal} footer={null} closable={false} centered width={400} styles={{ body: { padding: 0} }}>
        <div className="modal-centered-content">
          <div className="success-modal-inner-content">
            <CloseOutlined className="modal-close-button" onClick={() => { setShowSuccessModal(false); setSelectedTimeSlotForDeletion(null) }} />
            <CheckCircleOutlined className="success-modal-check-icon" />
            <Title level={4} className="success-modal-title">
              {selectedTimeSlotForDeletion ? "ลบช่วงเวลานัดสัมภาษณ์" : "เพิ่มช่วงเวลานัดสัมภาษณ์"}
            </Title>
            <Text className="success-modal-details-text">
              {selectedDate?.format("ddddที่ D MMMM")} เวลา {/* เติมไรสักอย่าง */}
            </Text>
            <Text className="success-modal-status-text">สำเร็จ</Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InterviewScheduling