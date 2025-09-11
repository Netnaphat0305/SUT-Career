import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Search, RefreshCw } from "lucide-react";
import EditIncidentForm from "./editreport";
import "./reportlist.css";
import { reportAPI } from "../../services/https/index";

interface User {
  name: string;
  department: string;
}

interface ReportStatus {
  id: number;
  name: string;
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

const IncidentReportList: React.FC = () => {
  const [currentView, setCurrentView] = useState<"list" | "edit">("list");
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const userStorage = localStorage.getItem("user");
  const userid = userStorage ? JSON.parse(userStorage).id : null;
  console.log("userId from localStorage:", userid);

 


  const fetchReports = async () => {
    try {
      const res = await reportAPI.getByUserId(userid);
      // console.log("API response:", res);
      // map API response → Incident
      const mappedIncidents: Incident[] = res.data.map((r: any) => ({
        id: r.id,
        title: r.title,
        place: r.place,
        datetime: r.datetime,
        discription: r.discription,
        user: { name: r.username },
        report_status: { id: r.status_id, name: r.status_name }, // color ใส่ default
      }));

      setIncidents(mappedIncidents);
      console.log("รายงานของ user:", mappedIncidents);
    } catch (error) {
      console.error("โหลด report ของ user ไม่สำเร็จ", error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [userid]);

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  const handleEdit = (incident: Incident) => {
    setEditingIncident({ ...incident });
    setCurrentView("edit");
  };

  const handleDelete = async (incidentId: number) => {
    if (window.confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      try {
        await reportAPI.delete(incidentId);
        setIncidents(
          incidents.filter((incident) => incident.id !== incidentId)
        );
        console.log(`ลบ incident ${incidentId} สำเร็จ`);
      } catch (error) {
        console.error("ลบ report ไม่สำเร็จ", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleSave = (updatedIncident: Incident) => {
    setIncidents(
      incidents.map((incident) =>
        incident.id === updatedIncident.id ? updatedIncident : incident
      )
    );
    setCurrentView("list");
    setEditingIncident(null);
  };

  const handleCancel = () => {
    setCurrentView("list");
    setEditingIncident(null);
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString("th-TH"),
      time: date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusColor = (id: number) => {
    switch (id) {
      case 1:
        return "status-yellow";
      case 2:
        return "status-blue";
      case 3:
        return "status-green";
      case 4:
        return "status-red";
      default:
        return "status-default";
    }
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.discription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentView === "edit" && editingIncident) {
    return (
      <EditIncidentForm
        incident={editingIncident}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="incident-container">
      <div className="page-header">
        <h1>จัดการเหตุการณ์</h1>
        <p>ติดตาม ตรวจสอบ และจัดการเหตุการณ์ด้านความปลอดภัยทั้งหมด</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อเหตุการณ์ สถานที่ หรือรายละเอียด..."
            value={searchTerm} // 3. เชื่อม input กับ state
            onChange={(e) => setSearchTerm(e.target.value)} // 3. อัปเดต state เมื่อพิมพ์
          />
        
        </div >
        <div className="refresh-section">
          <button
          className="refresh-btn"
          onClick={fetchReports}
          disabled={loading}
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw size={15} className={loading ? "spinning" : ""} />
        </button>
        <div className="result-count">พบ {filteredIncidents.length} รายการ</div>
        </div>
        
      </div>

      <div className="table-container">
        <table className="incident-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                {/* Checkbox for select all could go here */}
              </th>
              <th>ชื่อเหตุการณ์</th>
              <th>สถานที่</th>
              <th>วันที่และเวลา</th>
              <th>สถานะ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((incident) => {
              const { date, time } = formatDateTime(incident.datetime);
              return (
                <tr key={incident.id}>
                  <td></td>
                  <td>
                    <div className="title-cell">
                      <div className="title">{incident.title}</div>
                      <div className="description">{incident.discription}</div>
                    </div>
                  </td>
                  <td>{incident.place}</td>
                  <td>
                    <div className="datetime-cell">
                      <div className="date">{date}</div>
                      <div className="time">{time}</div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStatusColor(
                        incident.report_status.id
                      )}`}
                    >
                      {incident.report_status.name}
                    </span>
                  </td>
                  <td>
                    {incident.report_status.id == 1 && (
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          title="แก้ไข"
                          onClick={() => handleEdit(incident)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="ลบ"
                          onClick={() => handleDelete(incident.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentReportList;
