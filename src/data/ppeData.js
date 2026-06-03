// ─────────────────────────────────────────────────────────────
// ppeData.js
// This file holds sample PPE data that mimics what will eventually
// come from the PostgreSQL database via the backend API.
// Once the backend is built, this file gets replaced by real
// API calls. For now it lets us build and test the UI.
// ─────────────────────────────────────────────────────────────

// Each object in this array represents one PPE item + size combination.
// This matches the ppe_items table in our database design.
export const ppeItems = [
  {
    id: 1,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "XXXL",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 3,
  },
  {
    id: 2,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "XXL",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 18,
  },
  {
    id: 3,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "XL",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 12,
  },
  {
    id: 4,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 8,
  },
  {
    id: 5,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "M",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 0,
  },
  {
    id: 6,
    item_name: "Farmer's Hats",
    size_spec: "One size",
    unit_of_measure: "pcs",
    reorder_level: 20,
    current_stock: 5,
  },
  {
    id: 7,
    item_name: "PVC Gloves",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 15,
    current_stock: 22,
  },
  {
    id: 8,
    item_name: "PVC Gloves",
    size_spec: "M",
    unit_of_measure: "pcs",
    reorder_level: 15,
    current_stock: 14,
  },
  {
    id: 9,
    item_name: "Leather Gloves",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 9,
  },
  {
    id: 10,
    item_name: "Safety Helmets",
    size_spec: "One size",
    unit_of_measure: "pcs",
    reorder_level: 20,
    current_stock: 35,
  },
  {
    id: 11,
    item_name: "Beige Scrub",
    size_spec: "XL",
    unit_of_measure: "pcs",
    reorder_level: 8,
    current_stock: 0,
  },
  {
    id: 12,
    item_name: "Beige Scrub",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 8,
    current_stock: 11,
  },
];
