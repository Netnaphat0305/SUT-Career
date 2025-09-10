// src/components/TimeRecordModal.tsx
import React from 'react';
import './Modal.css'; // import CSS ของ Modal
import { useState } from 'react';
import { Calendar, theme } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { Button, InputNumber, Space } from 'antd';





// กำหนด type สำหรับ props
interface TimeRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function saveData() {
  // โค้ดบันทึกข้อมูล...
  
  alert("บันทึกเสร็จสิ้น");
}

// const { TextArea } = Input;

const TimeRecordModal: React.FC<TimeRecordModalProps> = ({ isOpen, onClose }) => {
    // หาก Modal ไม่เปิด ให้ return null เพื่อไม่แสดงผล
    if (!isOpen) return null;

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    const [value, setValue] = useState<string | number | null>('8');

    const { token } = theme.useToken();

    const wrapperStyle: React.CSSProperties = {
        width: 325,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,

    };


    return (
        <>
        <div className="modal-overlay">
            <div className="moda-content">
                <div className="modal-header">
                    <div></div>
                    <h2>บันทึกเวลา</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div style={wrapperStyle}>
                        <Calendar fullscreen={false} onPanelChange={onPanelChange} />
                    </div>
                    <div className="modal-input">


                        <div className="form-group label">
                            <label >จำนวนชั่วโมงทำงาน</label>
                            <Space style={{ marginRight: "150px" }}>
                                <InputNumber min={1} max={8} value={value} onChange={setValue} />
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        setValue(0);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Space>
                        </div>


                        <div className="form-group textarea">
                            <label>รายละเอียดงาน</label>
                            <textarea rows={10} placeholder="กรอกรายละเอียดงาน..."></textarea>
                        </div>
                        <div className='submit-button-index'>
                            <button className="submit-button" onClick={()=>{onClose(); saveData();}} style={{ alignContent: "center" }}>ยืนยันบันทึก</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
        </>
    );
};

export default TimeRecordModal;