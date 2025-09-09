import React, { useState } from 'react';
import './editreport.css';
import { message } from 'antd';
import { reportAPI } from "../../services/https/index";


interface User {
  name: string;
  department: string;
}

interface ReportStatus {
  name: string;
  color: string;
}

interface Admin {
  name: string;
}

interface Incident {
  id: number;
  title: string;
  place: string;
  datetime: string;
  discription: string;
  user: User;
  report_status: ReportStatus;
  admin: Admin;
}

interface EditIncidentFormProps {
  incident: Incident;
  onSave: (updatedIncident: Incident) => void;
  onCancel: () => void;
}

const EditIncidentForm: React.FC<EditIncidentFormProps> = ({ incident, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: incident.id,
    title: incident.title,
    place: incident.place,
    datetime: incident.datetime,
    discription: incident.discription
  });

  const [errors, setErrors] = useState({
    title: '',
    place: '',
    datetime: '',
    discription: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      place: '',
      datetime: '',
      discription: ''
    };

    if (!formData.title.trim()) {
      newErrors.title = 'กรุณากรอกชื่อเหตุการณ์';
    }

    if (!formData.place.trim()) {
      newErrors.place = 'กรุณากรอกสถานที่';
    }

    if (!formData.datetime) {
      newErrors.datetime = 'กรุณาเลือกวันที่และเวลา';
    }

    if (!formData.discription.trim()) {
      newErrors.discription = 'กรุณากรอกรายละเอียดเหตุการณ์';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };


  const handleSubmit = async (e: React.FormEvent) => { // 3. ทำให้ handleSubmit เป็น async
    e.preventDefault();
    
    if (validateForm()) {
      // 4. ใส่โค้ดเรียก API ตรงนี้
      try {
        // ใช้ ID จาก formData และส่งข้อมูลที่อัปเดตไป
        const response = await reportAPI.update(formData.id, {
          title: formData.title,
          place: formData.place,
          datetime: new Date(formData.datetime).toISOString(), // แปลงเป็น ISO string format ที่ backend รับได้
          discription: formData.discription,
        });

        // ตรวจสอบ response จาก API
        if (response && response.status >= 200 && response.status < 300) {
          message.success('บันทึกการแก้ไขสำเร็จ!');
          // เรียก onSave เพื่อแจ้ง parent component และส่งข้อมูลที่อัปเดตกลับไป
         
        } else {
          message.error(response?.data?.error || 'บันทึกการแก้ไขไม่สำเร็จ');
        }
      } catch (error) {
        console.error("Failed to save incident:", error);
        message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
       onSave({
            ...incident,
            ...formData,
            datetime: new Date(formData.datetime).toISOString(),
          });
    }
  };

  const formatDateTimeForInput = (datetime: string) => {
    const date = new Date(datetime);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="edit-form-container">
      <div className="breadcrumb">
      </div>

      <div className="page-header">
        <h1>แก้ไขเหตุการณ์</h1>
        <p>แก้ไขข้อมูลเหตุการณ์ ID: {formData.id}</p>
      </div>

      <div className="form-card">
        <div className="form-content">
          <div className="form-group">
            <label className="form-label">
              ชื่อเหตุการณ์rr <span className="required">*</span>
            </label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                สถานที่ <span className="required">*</span>
              </label>
              <input 
                type="text" 
                name="place" 
                value={formData.place} 
                onChange={handleInputChange}
                className={`form-input ${errors.place ? 'error' : ''}`}
              />
              {errors.place && <div className="error-message">{errors.place}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                วันที่และเวลา <span className="required">*</span>
              </label>
              <input 
                type="datetime-local" 
                name="datetime" 
                value={formatDateTimeForInput(formData.datetime)}
                onChange={handleInputChange}
                className={`form-input ${errors.datetime ? 'error' : ''}`}
              />
              {errors.datetime && <div className="error-message">{errors.datetime}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              รายละเอียดเหตุการณ์ <span className="required">*</span>
            </label>
            <textarea 
              name="discription" 
              value={formData.discription} 
              onChange={handleInputChange}
              rows={6}
              className={`form-textarea ${errors.discription ? 'error' : ''}`}
              placeholder="อธิบายรายละเอียดของเหตุการณ์ที่เกิดขึ้น สาเหตุ และความเสียหายที่เกิดขึ้น..."
            />
            {errors.discription && <div className="error-message">{errors.discription}</div>}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-cancel"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSubmit}
              className="btn-save"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditIncidentForm;