import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // ใส่ชื่อคู่กรณีที่ทำให้ระบบค้างเข้าไปตรงนี้ครับ
    exclude: ['@react-pdf/pdfkit', 'fontkit', 'echarts']
  }
})