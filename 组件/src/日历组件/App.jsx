import React, { useState } from "react";
import "./index.css";
const Calendar = () => {
  const [date, setDate] = useState(new Date());
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };
  const renderDates = () => {
    const days = [];
    const daysCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }
    for (let i = 1; i < daysCount + 1; i++) {
      days.push(
        <div key={i} className="day">
          {i}
        </div>,
      );
    }
    return days;
  };
  return (
    <div>
      <div className="container">
        <div className="header">
          <button onClick={() => handlePrevMonth()}>&lt;</button>
          <div>
            {date.getFullYear()}年{monthNames[date.getMonth()]}
          </div>
          <button onClick={() => handleNextMonth()}>&gt;</button>
        </div>
        <div className="days">
          <div className="day">日</div>
          <div className="day">一</div>
          <div className="day">二</div>
          <div className="day">三</div>
          <div className="day">四</div>
          <div className="day">五</div>
          <div className="day">六</div>
          {renderDates()}
        </div>
      </div>
    </div>
  );
};
export default Calendar;