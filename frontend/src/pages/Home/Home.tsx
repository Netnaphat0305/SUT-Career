import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div style={{ background: '#fff', padding: 24, minHeight: '85vh' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        ยินดีต้อนรับ
      </Title>
      <div style={{ maxWidth: 'auto', margin: '0 auto', textAlign: 'center' }}>
        <Paragraph>
          หน้าหลักนี้เป็นจุดเริ่มต้นสำหรับแอปพลิเคชันของคุณ
        </Paragraph>
        <Paragraph>
          คุณสามารถใช้พื้นที่นี้เพื่อประกาศงาน หรือหางานที่คุณสนใจ
        </Paragraph>
      </div>
    </div>
  );
};

export default HomePage;