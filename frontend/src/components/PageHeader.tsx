// components/PageHeader.tsx
import React from "react";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, className }) => {
  return (
    <div className={`pageHeader ${className || ""}`}>
      <h1>{title}</h1>
      <div className="pageHeader-underline" />
    </div>
  );
};

export default PageHeader;
