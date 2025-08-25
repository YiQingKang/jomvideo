import React from 'react';
import { Card, Typography, Divider, Space, List } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import MainLayout from './MainLayout';

const { Title, Paragraph, Text } = Typography;

const StaticLayout = ({ title, headerIcon, lastUpdated, sections }) => {
  return (
    <MainLayout>
      <div className="static-page">
        <Card>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              {headerIcon && React.cloneElement(headerIcon, { style: { fontSize: "48px", color: "#1890ff", marginBottom: "16px" } })}
              <Title level={1}>{title}</Title>
              {lastUpdated && (
                <Paragraph type="secondary">
                  <CalendarOutlined /> {lastUpdated}
                </Paragraph>
              )}
            </div>

            {/* Sections List */}
            <div>
              <List
                itemLayout="vertical"
                dataSource={sections}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <div size="small" style={{ marginBottom: "16px", marginTop: "16px" }} bodyStyle={{ padding: "16px" }}>
                      <Title level={4} style={{ marginBottom: "12px", color: "#1890ff" }}>
                        {item.title}
                      </Title>
                      {Array.isArray(item.content) ? (
                        item.content.map((paragraph, pIndex) => (
                          <Paragraph key={pIndex} style={{ marginBottom: 0 }}>{paragraph}</Paragraph>
                        ))
                      ) : (
                        <Paragraph style={{ marginBottom: 0 }}>{item.content}</Paragraph>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <Text type="secondary">© {new Date().getFullYear()} JomVideo. All rights reserved.</Text>
            </div>
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StaticLayout;