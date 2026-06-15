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
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 2,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "XXL",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 18,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 3,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "XL",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 12,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 4,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 8,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 5,
    item_name: "N/Blue Reflectors Overall",
    size_spec: "M",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 0,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 6,
    item_name: "Farmer's Hats",
    size_spec: "One size",
    unit_of_measure: "pcs",
    reorder_level: 20,
    current_stock: 5,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 7,
    item_name: "PVC Gloves",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 15,
    current_stock: 22,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 8,
    item_name: "PVC Gloves",
    size_spec: "M",
    unit_of_measure: "pcs",
    reorder_level: 15,
    current_stock: 14,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 9,
    item_name: "Leather Gloves",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 10,
    current_stock: 9,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 10,
    item_name: "Safety Helmets",
    size_spec: "One size",
    unit_of_measure: "pcs",
    reorder_level: 20,
    current_stock: 35,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 11,
    item_name: "Beige Scrub",
    size_spec: "XL",
    unit_of_measure: "pcs",
    reorder_level: 8,
    current_stock: 0,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
  {
    id: 12,
    item_name: "Beige Scrub",
    size_spec: "L",
    unit_of_measure: "pcs",
    reorder_level: 8,
    current_stock: 11,
    reserved_stock: 0,   // NEW - reserved stock for pending orders
  },
];
