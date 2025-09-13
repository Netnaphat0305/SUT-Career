// frontend/src/pages/InterviewScheduling/InterviewScheduling.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { Button, Card, Typography, Space, Row, Col, Modal, TimePicker, Form, message, Input } from "antd"
import { LeftOutlined, RightOutlined, CheckCircleOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import "dayjs/locale/th"

import "./InterviewScheduling.css"

import type { InterviewScheduling } from "../../interfaces/InterviewScheduling"
import { interviewSchedulingAPI } from "../../services/https"

dayjs.locale("th")

const { Title, Text } = Typography
const { RangePicker } = TimePicker
const { TextArea } = Input

type DateStatus = "available" | "booked" | "selected" | "default"

const InterviewSchedulingPage: React.FC = () => {
  const [interviewDetails, setInterviewDetails] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs())
  const [showAddTimeModal, setShowAddTimeModal] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [form] = Form.useForm()
  const [selectedTimeSlotForDeletion, setSelectedTimeSlotForDeletion] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [timeSlots, setTimeSlots] = useState<InterviewScheduling[]>([])
  const [lastActionSlot, setLastActionSlot] = useState<InterviewScheduling | null>(null)

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slots = await interviewSchedulingAPI.getByEmployerId() // ID ในที่นี้ไม่ได้ต้องส่งไป แต่จะให้ backend ดึงเอาจาก middlewares
        setTimeSlots(slots)
      } catch (error) {
        message.error("โหลดข้อมูลไม่สำเร็จ")
      }
    }
    loadSlots()
  }, [])

  // รวม “วันที่จากปฏิทิน” + “เวลา จาก RangePicker”
  const mergeDateAndTime = (date: Dayjs, time: Dayjs) =>
    date
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .millisecond(0)

  const getSlotsByDate = (date: Dayjs): InterviewScheduling[] => {
    // เทียบแบบ isSame('day') เพื่อกันปัญหา timezone/UTC ทำให้วันคลาดเคลื่อน
    return timeSlots.filter((slot) => dayjs(slot.DateAndTimeStart).isSame(date, "day"))
  }

  const getDateStatus = (date: Dayjs): DateStatus => {
    const isCurrentMonth = date.month() === currentMonth.month()
    if (!isCurrentMonth) return "default"
    if (selectedDate && date.isSame(selectedDate, "day")) return "selected"

    const slots = getSlotsByDate(date)
    if (slots.length > 0) {
      const hasBooked = slots.some((slot) => slot.Status === "booked")
      const hasAvailable = slots.some((slot) => slot.Status === "available")

      if (hasBooked && !hasAvailable) return "booked"
      if (hasAvailable) return "available"
    }
    return "default"
  }

  const handleDateClick = (date: Dayjs) => {
    if (date.month() === currentMonth.month()) {
      setSelectedDate(date)
      // เมื่อเลือกวันใหม่ ให้ยกเลิกการเลือกลบ slot เพื่อกันสับสน
      setSelectedTimeSlotForDeletion(null)
    }
  }

  const handleAddTimeSlot = async () => {
    if (selectedDate && selectedTimeRange) {
      // ผูกเวลาเข้ากับ “วันที่ที่เลือกในปฏิทิน”
      const start = mergeDateAndTime(selectedDate, selectedTimeRange[0])
      const end = mergeDateAndTime(selectedDate, selectedTimeRange[1])

      const newSlot = {
        // ส่งเป็น ISO แบบมี timezone offset ชัดเจน (RFC3339) เช่น 2025-09-12T14:30:00+07:00
        DateAndTimeStart: start.format("YYYY-MM-DD[T]HH:mm:ssZ"),
        DateAndTimeEnd: end.format("YYYY-MM-DD[T]HH:mm:ssZ"),
        Status: "available" as const,
        Detail: interviewDetails,
        EmployerID: 1, // TODO: แทนที่ด้วยค่าจริงจาก auth context
      }

      try {
        const created = await interviewSchedulingAPI.create(newSlot)
        setTimeSlots((prev) => [...prev, created])
        setLastActionSlot(created)
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
    if (selectedTimeSlotForDeletion !== null) {
      try {
        await interviewSchedulingAPI.delete(selectedTimeSlotForDeletion)
        const slotToDelete = timeSlots.find((s) => s.ID === selectedTimeSlotForDeletion) || null
        setTimeSlots((prev) => prev.filter((s) => s.ID !== selectedTimeSlotForDeletion))
        setLastActionSlot(slotToDelete)
        setShowDeleteModal(false)
        setShowSuccessModal(true)
        setSelectedTimeSlotForDeletion(null)
      } catch (error) {
        message.error("Failed to delete time slot.")
      }
    }
  }

  const dateCellRender = (date: Dayjs) => {
    if (date.month() !== currentMonth.month()) return null
    let statusClassName = ""
    switch (getDateStatus(date)) {
      case "selected": statusClassName = "date-cell-selected"; break
      case "available": statusClassName = "date-cell-available"; break
      case "booked": statusClassName = "date-cell-booked"; break
      default: statusClassName = "date-cell-default"
    }

    return (
      <div className={`date-cell ${statusClassName}`} onClick={() => handleDateClick(date)}>
        {date.date()}
      </div>
    )
  }

  const onMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => prev[direction === "prev" ? "subtract" : "add"](1, "month"))
    setSelectedDate(null)
    setSelectedTimeSlotForDeletion(null)
  }

  return (
    <div className="employer-schedule-container">
      <div className="employer-schedule-main-content">
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              <div className="month-navigation">
                <Button type="text" icon={<LeftOutlined />} onClick={() => onMonthChange("prev")} />
                <div className="month-display">{currentMonth.format("MMMM YYYY")}</div>
                <Button type="text" icon={<RightOutlined />} onClick={() => onMonthChange("next")} />
              </div>

              <div className="calendar-header">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <div key={day} className="day-header">{day}</div>
                ))}
              </div>

              <div className="calendar-grid">
                {Array.from({ length: 42 }, (_, index) => {
                  const currentDate = currentMonth.startOf("month").startOf("week").add(index, "day")
                  const isCurrentMonth = currentDate.month() === currentMonth.month()
                  return (
                    <div key={index} className={`date-cell-wrapper ${!isCurrentMonth ? "date-cell-wrapper-inactive" : ""}`}>
                      {isCurrentMonth
                        ? dateCellRender(currentDate)
                        : <div className="inactive-date-number">{currentDate.date()}</div>}
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
                <Card
                  title={<Title level={4} style={{ margin: 0 }}>{selectedDate.date()} {selectedDate.format("ddd").toUpperCase()}</Title>}
                  className="time-slots-card"
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {getSlotsByDate(selectedDate).map((slot) => {
                      const isSelected = selectedTimeSlotForDeletion === slot.ID
                      let pillClassName = "time-slot-pill"
                      if (isSelected) pillClassName += " time-slot-pill-selected"
                      else if (slot.Status === "available") pillClassName += " time-slot-pill-available"
                      else pillClassName += " time-slot-pill-booked"

                      return (
                        <div key={slot.ID} className="time-slot-item">
                          <Text strong>
                            {dayjs(slot.DateAndTimeStart).format("HH:mm")} - {dayjs(slot.DateAndTimeEnd).format("HH:mm")}
                          </Text>
                          <div className="time-slot-actions">
                            {slot.Status !== "booked" && (
                              <DeleteOutlined
                                className="delete-icon"
                                onClick={() => setSelectedTimeSlotForDeletion(slot.ID)}
                              />
                            )}
                            <div className={pillClassName} />
                          </div>
                        </div>
                      )
                    })}
                    {getSlotsByDate(selectedDate).length === 0 && <Text className="no-slots-text">ยังไม่มีช่วงเวลาที่กำหนด</Text>}
                  </Space>
                </Card>
              )}

              <Button
                type="primary"
                size="large"
                block
                disabled={!selectedDate}
                onClick={() => {
                  if (selectedDate) {
                    selectedTimeSlotForDeletion !== null
                      ? setShowDeleteModal(true)
                      : setShowAddTimeModal(true)
                  }
                }}
              >
                {selectedTimeSlotForDeletion !== null ? "ลบช่วงเวลา" : "เพิ่มช่วงเวลา"}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Add Modal */}
      <Modal open={showAddTimeModal} footer={null} closable={false} centered width={500}>
        <div className="modal-centered-content">
          <div className="modal-inner-content">
            <CloseOutlined
              className="modal-close-button"
              onClick={() => {
                setShowAddTimeModal(false)
                setSelectedTimeRange(null)
                form.resetFields()
              }}
            />
            <Title level={3}>{selectedDate?.format("dddd D MMMM YYYY")}</Title>
            <Form form={form}>
              <Form.Item name="timeRange">
                <RangePicker
                  format="HH:mm"
                  placeholder={["เวลาเริ่ม", "เวลาสิ้นสุด"]}
                  onChange={(times) => setSelectedTimeRange(times as [Dayjs, Dayjs])}
                  minuteStep={5}
                />
              </Form.Item>
              <Title level={5}>รายละเอียดการนัดสัมภาษณ์</Title>
              <TextArea
                rows={4}
                placeholder="เช่น Online: Zoom"
                value={interviewDetails}
                onChange={(e) => setInterviewDetails(e.target.value)}
              />
            </Form>
            <div className="modal-action-buttons">
              <Button
                onClick={() => {
                  setShowAddTimeModal(false)
                  setSelectedTimeRange(null)
                  form.resetFields()
                }}
              >
                ยกเลิก
              </Button>
              <Button type="primary" disabled={!selectedTimeRange} onClick={handleAddTimeSlot}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} footer={null} closable={false} centered width={500}>
        <div className="modal-centered-content">
          <div className="modal-inner-content">
            <CloseOutlined
              className="modal-close-button"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedTimeSlotForDeletion(null)
              }}
            />
            <Title level={4}>{selectedDate?.format("dddd ที่ D MMMM YYYY")}</Title>
            <Text>คุณต้องการลบช่วงเวลานัดสัมภาษณ์หรือไม่?</Text>
            <div className="modal-action-buttons">
              <Button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedTimeSlotForDeletion(null)
                }}
              >
                ยกเลิก
              </Button>
              <Button type="primary" onClick={handleDeleteTimeSlot}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal open={showSuccessModal} footer={null} closable={false} centered width={400}>
        <div className="modal-centered-content">
          <div className="success-modal-inner-content">
            <CloseOutlined
              className="modal-close-button"
              onClick={() => {
                setShowSuccessModal(false)
                setInterviewDetails("")
                setLastActionSlot(null)
                setSelectedTimeSlotForDeletion(null)
              }}
            />
            <CheckCircleOutlined className="success-modal-check-icon" />
            {lastActionSlot && (
              <>
                <Title level={4}>
                  {selectedTimeSlotForDeletion !== null ? "ลบช่วงเวลานัดสัมภาษณ์" : "เพิ่มช่วงเวลานัดสัมภาษณ์"}
                </Title>
                <Text>
                  {dayjs(lastActionSlot.DateAndTimeStart).format("dddd ที่ D MMMM")} เวลา{" "}
                  {dayjs(lastActionSlot.DateAndTimeStart).format("HH:mm")} - {dayjs(lastActionSlot.DateAndTimeEnd).format("HH:mm")}
                </Text>
                {selectedTimeSlotForDeletion === null && interviewDetails && (
                  <div>
                    <div className="success-modal-details-text">
                      รายละเอียด:
                    </div>
                    <Text>
                      {interviewDetails}
                    </Text>
                  </div>
                )}
              </>
            )}
            <div className="success-modal-status-text">สำเร็จ</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InterviewSchedulingPage
