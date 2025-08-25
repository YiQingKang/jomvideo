import React, { useState, useEffect } from 'react';
import { Table, Card } from 'antd';
import './ResponsiveTable.css';

const ResponsiveTable = ({ columns, dataSource, ...props }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="responsive-table">
        {dataSource.map((item, index) => (
          <Card key={index} className="responsive-table-card">
            {columns.map(column => {
              if (column.render) {
                return (
                  <div key={column.key} className="responsive-table-row">
                    <div className="responsive-table-label">{column.title}</div>
                    <div className="responsive-table-value">
                      {column.render(item[column.dataIndex], item, index)}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={column.key} className="responsive-table-row">
                    <div className="responsive-table-label">{column.title}</div>
                    <div className="responsive-table-value">{item[column.dataIndex]}</div>
                  </div>
                );
              }
            })}
          </Card>
        ))}
      </div>
    );
  }

  return <Table columns={columns} dataSource={dataSource} {...props} />;
};

export default ResponsiveTable;
