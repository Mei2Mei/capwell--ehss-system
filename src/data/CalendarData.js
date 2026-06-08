// CalendarData.js

export const initialActivities = [
  {
    id: 1,
    activity_name: "OSH Committee Training",
    category: "statutory_requirement",
    target_audience: "EHSS Committee members",
    internal_external: "external",
    scheduled_month: "2026-03-01",
    status: "scheduled",
    notes: ""
  },
  {
    id: 2,
    activity_name: "Fire Safety Drill",
    category: "industry_best_practice",
    target_audience: "All staff",
    internal_external: "internal",
    scheduled_month: "2026-01-01",
    status: "scheduled",
    notes: ""
  }
];

export const statusColors = {
  scheduled: "#0d47a1",
  completed: "#2ecc71",
  rescheduled: "#5dade2",
  not_conducted: "#e74c3c",
  overdue: "#f39c12"
};