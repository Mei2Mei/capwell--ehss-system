import React, { useState } from "react";
import "./CalendarPage.css";
import { initialActivities, statusColors } from "../../data/CalendarData";

const CalendarPage = () => {
  const [activities, setActivities] = useState(initialActivities);
  const [view, setView] = useState("table");

  const getStatus = (item) => {
    const today = new Date();
    const scheduled = new Date(item.scheduled_month);

    if (item.status === "completed") return "completed";
    if (item.status === "rescheduled") return "rescheduled";
    if (item.status === "not_conducted") return "not_conducted";

    if (today > scheduled && item.status === "scheduled") {
      return "overdue";
    }

    return "scheduled";
  };

  const updateStatus = (id, newStatus) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
  };

  return (
    <div className="calendar-page">
      <div className="header">
        <h2>EHSS Calendar 2026</h2>

        <button onClick={() => setView(view === "table" ? "grid" : "table")}>
          Toggle View
        </button>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          Total
          <br />
          <b>{activities.length}</b>
        </div>

        <div className="kpi">
          Scheduled
          <br />
          <b>{activities.filter((a) => a.status === "scheduled").length}</b>
        </div>

        <div className="kpi">
          Completed
          <br />
          <b>{activities.filter((a) => a.status === "completed").length}</b>
        </div>

        <div className="kpi danger">
          Overdue
          <br />
          <b>{activities.filter((a) => getStatus(a) === "overdue").length}</b>
        </div>
      </div>
      <div className="filter-bar">
        <select>
          <option>All Categories</option>
          <option>statutory_requirement</option>
          <option>industry_best_practice</option>
          <option>behaviour_based_safety</option>
        </select>

        <select>
          <option>All Status</option>
          <option>scheduled</option>
          <option>completed</option>
          <option>overdue</option>
        </select>

        <input placeholder="Search audience..." />
      </div>

      {/* TABLE VIEW */}
      {view === "table" && (
        <table className="calendar-table">
          <thead>
            <tr>
              <th>SN</th>
              <th>Activity</th>
              <th>Category</th>
              <th>Audience</th>
              <th>Type</th>
              <th>Month</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((item, index) => {
              const status = getStatus(item);

              return (
                <tr
                  key={item.id}
                  className={status === "overdue" ? "overdue-row" : ""}
                >
                  <td>{index + 1}</td>
                  <td>{item.activity_name}</td>
                  <td>{item.category}</td>
                  <td>{item.target_audience}</td>
                  <td>{item.internal_external}</td>
                  <td>{item.scheduled_month}</td>

                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className={`status-select ${status}`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="rescheduled">Rescheduled</option>
                      <option value="not_conducted">Not conducted</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid">
          {Array.from({ length: 12 }).map((_, i) => {
            const count = activities.filter(
              (a) => new Date(a.scheduled_month).getMonth() === i,
            ).length;

            return (
              <div key={i} className="month-card">
                <h3>Month {i + 1}</h3>
                <p>{count} activities</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
