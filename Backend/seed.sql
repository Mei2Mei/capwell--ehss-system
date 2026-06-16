-- =========================================================
-- Capwell EHSS System - Seed Data
-- =========================================================

-- ROLES
INSERT INTO roles (role_name) VALUES
('ehss_officer'),
('storekeeper'),
('supervisor'),
('production_manager'),
('qa'),
('it_admin');

-- PERMISSIONS (based on stated matrix)
-- EHSS Officer (Linda) - full access + delete everywhere
INSERT INTO permissions (role_id, module_name, access_level, can_delete)
SELECT id, module, 'full', TRUE FROM roles, 
  unnest(ARRAY['ppe_inventory','compliance','safety','costs','sustainability','calendar','action_tracker','equipment','reports']) AS module
WHERE role_name = 'ehss_officer';

-- Storekeeper - PPE fulfill (edit access on ppe_inventory)
INSERT INTO permissions (role_id, module_name, access_level, can_delete)
SELECT id, 'ppe_inventory', 'edit', FALSE FROM roles WHERE role_name = 'storekeeper';

-- Supervisor - PPE request (edit access, no delete)
INSERT INTO permissions (role_id, module_name, access_level, can_delete)
SELECT id, 'ppe_inventory', 'edit', FALSE FROM roles WHERE role_name = 'supervisor';

-- Production Manager - PPE view only
INSERT INTO permissions (role_id, module_name, access_level, can_delete)
SELECT id, 'ppe_inventory', 'view', FALSE FROM roles WHERE role_name = 'production_manager';

-- QA - Compliance add/edit/view (no delete)
INSERT INTO permissions (role_id, module_name, access_level, can_delete)
SELECT id, 'compliance', 'edit', FALSE FROM roles WHERE role_name = 'qa';

-- IT Admin - delete rights on sensitive modules
INSERT INTO permissions (role_id, module_name, access_level, can_delete)
SELECT id, module, 'full', TRUE FROM roles,
  unnest(ARRAY['ppe_inventory','compliance','safety','costs']) AS module
WHERE role_name = 'it_admin';


-- PPE ITEMS
INSERT INTO ppe_items (item_name, size_spec, unit_of_measure, reorder_level, current_stock, reserved_stock) VALUES
('N/Blue Reflectors Overall', 'XXXL', 'pcs', 10, 3, 0),
('N/Blue Reflectors Overall', 'XXL', 'pcs', 10, 18, 0),
('N/Blue Reflectors Overall', 'XL', 'pcs', 10, 12, 0),
('N/Blue Reflectors Overall', 'L', 'pcs', 10, 8, 0),
('N/Blue Reflectors Overall', 'M', 'pcs', 10, 0, 0),
('Farmer''s Hats', 'One size', 'pcs', 20, 5, 0),
('PVC Gloves', 'L', 'pcs', 15, 22, 0),
('PVC Gloves', 'M', 'pcs', 15, 14, 0),
('Leather Gloves', 'L', 'pcs', 10, 9, 0),
('Safety Helmets', 'One size', 'pcs', 20, 35, 0),
('Beige Scrub', 'XL', 'pcs', 8, 0, 0),
('Beige Scrub', 'L', 'pcs', 8, 11, 0);


-- COMPLIANCE ITEMS
INSERT INTO compliance_items (requirement, expert_organisation, reference_number, requirement_reference, date_of_issuance, validity_period, date_of_expiry, remarks) VALUES
('Business licence — Unit 1', 'Kiambu County', '2026/SD/B9957554', 'County laws', '2026-01-27', 'Annual', '2026-12-31', ''),
('Business licence — Unit 2', 'Kiambu County', '2026/SD/B9957674', 'County laws', '2026-01-27', 'Annual', '2026-12-31', ''),
('Business licence — Unit 3', 'Kiambu County', '2026/SD/B9957587', 'County laws', '2026-01-27', 'Annual', '2026-12-31', ''),
('Business licence — Unit Mwea', 'Kirinyaga County', NULL, 'County laws', NULL, 'Annual', NULL, 'Pending renewal'),
('Business licence — Baba Dogo', 'Nairobi City County', NULL, 'County laws', NULL, 'Annual', NULL, 'Pending'),
('Public health certificate — Unit 1', 'Nairobi City County', 'PH2026/SD/B9957674', 'Public Health Act', '2026-01-07', 'Annual', '2026-12-31', ''),
('NEMA EIA licence', 'NEMA', 'NEMA/EIA/2026/0041', 'EMCA 1999', '2026-01-15', 'Annual', '2026-06-28', 'Renewal in progress'),
('Fire safety certificate', 'Nairobi Fire Dept', 'FSC/2025/0892', 'Fire Risk Reduction 2007', '2025-04-01', 'Annual', '2026-04-01', 'Expired — renewal pending'),
('Statutory inspection — lifts', 'DOSH', 'DOSH/INS/2026/0112', 'OSHA 2007', '2026-01-12', 'Annual', '2026-12-31', ''),
('Statutory inspection — LPG', 'DOSH', 'DOSH/LPG/2026/0045', 'OSHA 2007', '2026-01-12', 'Annual', '2026-06-15', '');


-- SAFETY RECORDS
INSERT INTO safety_records (period, staff_numbers, worked_hours, fatalities, medical_treatment_incidents, lost_time_incidents, days_away_from_work, hse_training_hours, first_aid_cases, near_misses, accident_investigations, hse_meetings, hse_inspections) VALUES
('2026-01-01', 569, 109248, 0, 0, 0, 0, 2, 0, 0, 0, 1, 3),
('2026-02-01', 576, 110592, 0, 1, 1, 14, 7, 3, 0, 3, 0, 5),
('2026-03-01', 586, 112512, 0, 0, 0, 0, 64, 0, 0, 0, 1, 7),
('2026-04-01', 563, 108096, 0, 0, 0, 0, 2, 0, 0, 0, 1, 4);


-- COST RECORDS
INSERT INTO cost_records (year, item_description, date, po_number, cost_excl_vat, cost_type, refundable, budget_status) VALUES
(2026, 'Disposal of hazardous waste', '2026-01-12', 'PO18983', 125000, 'statutory_requirement', 'non_refundable', 'in_budget'),
(2026, 'Whitewash multi purpose soap', '2026-01-12', 'PO18984', 314136, 'staff_welfare', 'non_refundable', 'in_budget'),
(2026, 'Statutory inspections — lifts, LPG, compressors', '2026-01-12', 'PO18986', 220000, 'statutory_requirement', 'non_refundable', 'in_budget'),
(2026, 'Statutory inspection — 2nd retort plant', '2026-01-12', 'PO18985', 10000, 'statutory_requirement', 'non_refundable', 'in_budget'),
(2026, 'PVC gloves, leather gloves, helmets', '2026-01-29', 'PO19363', 47500, 'staff_welfare', 'non_refundable', 'in_budget'),
(2026, 'Farmer''s hats', '2026-01-29', 'PO19362', 45259, 'staff_welfare', 'non_refundable', 'in_budget'),
(2026, 'NEMA renewal — EIA licence', '2026-01-31', 'PO19364', 355000, 'statutory_requirement', 'non_refundable', 'in_budget'),
(2025, 'Dust masks KN95', '2025-02-10', 'PO15021', 38500, 'staff_welfare', 'non_refundable', 'in_budget'),
(2025, 'Safety harnesses', '2025-03-05', 'PO15244', 92000, 'staff_welfare', 'non_refundable', 'in_budget'),
(2025, 'Safety signages', '2025-04-18', 'PO15890', 55000, 'improvement_initiative', 'non_refundable', 'in_budget'),
(2025, 'Fire extinguisher servicing', '2025-05-22', 'PO16102', 28000, 'statutory_requirement', 'non_refundable', 'in_budget'),
(2025, 'First aid kit restocking', '2025-06-14', 'PO16388', 15000, 'staff_welfare', 'non_refundable', 'in_budget');


-- EMISSION FACTORS
INSERT INTO emission_factors (factor_name, value, unit_description) VALUES
('petrol', 2.3, 'kg CO2 per litre'),
('diesel', 2.7, 'kg CO2 per litre'),
('firewood', 61.81, 'kg CO2 per tonne'),
('lpg', 1.51, 'kg CO2 per kg'),
('electricity', 0.5, 'kg CO2 per kWh (EPRA 2023)');


-- SUSTAINABILITY RECORDS
INSERT INTO sustainability_records (period, water_consumption_m3, water_recycled_m3, electricity_kwh, solar_kwh, firewood_tonnes, diesel_litres, petrol_litres, lpg_kg, paper_waste_kg, plastic_packaging_kg, hazardous_waste_kg, recyclable_plastic_kg) VALUES
('2026-01-01', 450, 120, 314150, 2000, 0, 15744.09, 8670.15, 0, 5860, 410.73, 120, 85),
('2026-02-01', 430, 100, 82000, 1800, 11.8, 3100, 750, 240, 5930, 406.58, 110, 90),
('2026-03-01', 460, 130, 88000, 2200, 13.1, 3400, 820, 260, 5646, 327.19, 130, 78),
('2026-04-01', 480, 140, 85000, 2100, 12.9, 3250, 790, 255, 7960, 414.84, 115, 92);


-- CALENDAR ACTIVITIES
INSERT INTO calendar_activities (activity_name, category, target_audience, internal_external, scheduled_month, status, notes) VALUES
('OSH Committee meeting', 'statutory_requirement', 'EHSS Committee members', 'external', '2026-01-01', 'completed', ''),
('Fire drill', 'statutory_requirement', 'All staff', 'internal', '2026-02-01', 'completed', ''),
('First aid training', 'industry_best_practice', 'All staff', 'internal', '2026-02-01', 'not_conducted', 'Rescheduled'),
('HSE induction — new staff', 'statutory_requirement', 'New employees', 'internal', '2026-03-01', 'completed', ''),
('Chemical handling refresher', 'statutory_requirement', 'Lab staff', 'internal', '2026-04-01', 'not_conducted', ''),
('Forklift safety training', 'industry_best_practice', 'Warehouse staff', 'external', '2026-05-01', 'scheduled', ''),
('Environmental awareness', 'behaviour_based_safety', 'All staff', 'internal', '2026-05-01', 'scheduled', ''),
('OSH Committee meeting', 'statutory_requirement', 'EHSS Committee members', 'external', '2026-06-01', 'scheduled', ''),
('PPE awareness session', 'behaviour_based_safety', 'Production staff', 'internal', '2026-07-01', 'scheduled', ''),
('Emergency evacuation drill', 'statutory_requirement', 'All staff', 'internal', '2026-08-01', 'scheduled', '');


-- ACTION TRACKER
INSERT INTO action_tracker (concern, action, responsible, date_raised, target_date, progress, status) VALUES
('Loose wiring in warehouse', 'Repair and insulate electrical wiring', 'John Kamau', '2026-06-01', '2026-06-10', 50, 'In Progress'),
('Blocked emergency exit', 'Clear exit route and install signage', 'Safety Officer', '2026-06-03', '2026-06-07', 100, 'Completed'),
('Oil spill in loading bay', 'Clean spill and place warning signs', 'Maintenance Team', '2026-06-05', '2026-06-06', 75, 'In Progress'),
('Fire extinguisher missing', 'Replace and restock fire extinguisher', 'HSE Officer', '2026-06-04', '2026-06-08', 25, 'Pending'),
('Broken PPE storage rack', 'Repair storage rack and reorganize PPE', 'Storekeeper', '2026-06-02', '2026-06-09', 60, 'In Progress');


-- EQUIPMENT
INSERT INTO equipment (name, category, capacity, status, location, last_inspection, next_inspection) VALUES
('Track mounted chain hoist', 'Hoist', 'SWL: 3 TON', 'Available', 'Wheat Mill', '2026-01-12', '2026-12-31'),
('Pallet truck', 'Truck', 'SWL: 2 TON', 'Available', 'Warehouse', '2026-01-12', '2026-06-15'),
('Wire rope sling', 'Lifting Gear', 'SWL: 1 TON', 'Available', 'Boiler room', '2025-04-01', '2026-04-01'),
('Chain block', 'Hoist', 'SWL: 5 TON', 'Available', 'Engineering', '2026-01-12', '2026-12-31'),
('Forklift', 'Truck', 'SWL: 3 TON', 'In Use', 'Warehouse', '2025-06-01', '2026-06-01'),
('Electric hoist', 'Hoist', 'SWL: 2 TON', 'In Use', 'Production', '2026-01-12', '2026-12-31'),
('Overhead crane', 'Crane', 'SWL: 10 TON', 'Available', 'Mill', '2026-01-12', '2026-12-31'),
('Hand pallet truck', 'Truck', 'SWL: 1 TON', 'Available', 'Store', '2025-12-01', '2026-12-01'),
('Lifting beam', 'Lifting Gear', 'SWL: 5 TON', 'Maintenance', 'Engineering', '2025-03-01', '2026-03-01'),
('Rope sling set', 'Lifting Gear', 'SWL: 2 TON', 'Available', 'Warehouse', '2026-01-12', '2026-12-31');