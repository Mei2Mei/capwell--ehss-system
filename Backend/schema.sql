-- =========================================================
-- Capwell EHSS System - Database Schema
-- Generated from frontend data files (Phase 4 reverse-engineering)
-- =========================================================

-- ---------------------------------------------------------
-- USERS & PERMISSIONS
-- ---------------------------------------------------------

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL
  -- e.g. ehss_officer, storekeeper, supervisor, production_manager, qa, it_admin
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Module-level permissions per role
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id),
  module_name VARCHAR(50) NOT NULL,
  -- e.g. ppe_inventory, compliance, safety, costs, sustainability, calendar, action_tracker, equipment, reports
  access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('full', 'edit', 'view', 'none')),
  can_delete BOOLEAN DEFAULT FALSE,
  UNIQUE(role_id, module_name)
);

-- ---------------------------------------------------------
-- PPE INVENTORY
-- ---------------------------------------------------------

CREATE TABLE ppe_items (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  size_spec VARCHAR(20),
  unit_of_measure VARCHAR(20) DEFAULT 'pcs',
  reorder_level INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PPE requests (reservation-based workflow)
CREATE TABLE ppe_requests (
  id SERIAL PRIMARY KEY,
  ppe_item_id INTEGER REFERENCES ppe_items(id),
  requested_by INTEGER REFERENCES users(id),   -- supervisor
  quantity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled', 'voided')),
  approved_by INTEGER REFERENCES users(id),    -- EHSS officer (Linda)
  fulfilled_by INTEGER REFERENCES users(id),   -- storekeeper/laundry
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  fulfilled_at TIMESTAMP,
  notes TEXT
);

-- ---------------------------------------------------------
-- COMPLIANCE MATRIX
-- ---------------------------------------------------------

CREATE TABLE compliance_items (
  id SERIAL PRIMARY KEY,
  requirement VARCHAR(150) NOT NULL,
  expert_organisation VARCHAR(100),
  reference_number VARCHAR(50),
  requirement_reference VARCHAR(100),
  date_of_issuance DATE,
  validity_period VARCHAR(20),
  date_of_expiry DATE,
  remarks TEXT,
  status VARCHAR(20), -- auto-calculated: compliant / expiring_soon / expired (60-day threshold)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- SAFETY METRICS (EHS Monthly Report)
-- ---------------------------------------------------------

CREATE TABLE safety_records (
  id SERIAL PRIMARY KEY,
  period DATE NOT NULL,
  staff_numbers INTEGER,
  worked_hours INTEGER,
  fatalities INTEGER DEFAULT 0,
  medical_treatment_incidents INTEGER DEFAULT 0,
  lost_time_incidents INTEGER DEFAULT 0,
  days_away_from_work INTEGER DEFAULT 0,
  hse_training_hours INTEGER DEFAULT 0,
  first_aid_cases INTEGER DEFAULT 0,
  near_misses INTEGER DEFAULT 0,
  accident_investigations INTEGER DEFAULT 0,
  hse_meetings INTEGER DEFAULT 0,
  hse_inspections INTEGER DEFAULT 0,
  -- Calculated fields (TRIFR, LTIFR, Severity Rate use x1,000,000 multiplier)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- DEPARTMENTAL COSTS
-- ---------------------------------------------------------

CREATE TABLE cost_records (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  item_description VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  po_number VARCHAR(20),
  cost_excl_vat NUMERIC(12,2) NOT NULL,
  cost_type VARCHAR(50), -- statutory_requirement, staff_welfare, improvement_initiative
  refundable VARCHAR(20) DEFAULT 'non_refundable',
  budget_status VARCHAR(20) DEFAULT 'in_budget',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- SUSTAINABILITY
-- ---------------------------------------------------------

CREATE TABLE emission_factors (
  id SERIAL PRIMARY KEY,
  factor_name VARCHAR(50) UNIQUE NOT NULL, -- petrol, diesel, firewood, lpg, electricity
  value NUMERIC(10,4) NOT NULL,
  unit_description VARCHAR(50) -- e.g. "kg CO2 per litre"
);

CREATE TABLE sustainability_records (
  id SERIAL PRIMARY KEY,
  period DATE NOT NULL,
  water_consumption_m3 NUMERIC(10,2),
  water_recycled_m3 NUMERIC(10,2),
  electricity_kwh NUMERIC(12,2),
  solar_kwh NUMERIC(12,2),
  firewood_tonnes NUMERIC(10,2),
  diesel_litres NUMERIC(10,2),
  petrol_litres NUMERIC(10,2),
  lpg_kg NUMERIC(10,2),
  paper_waste_kg NUMERIC(10,2),
  plastic_packaging_kg NUMERIC(10,2),
  hazardous_waste_kg NUMERIC(10,2),
  recyclable_plastic_kg NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- CALENDAR / ACTIVITIES
-- ---------------------------------------------------------

CREATE TABLE calendar_activities (
  id SERIAL PRIMARY KEY,
  activity_name VARCHAR(150) NOT NULL,
  category VARCHAR(50), -- statutory_requirement, industry_best_practice, behaviour_based_safety
  target_audience VARCHAR(100),
  internal_external VARCHAR(20) CHECK (internal_external IN ('internal', 'external')),
  scheduled_month DATE,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, not_conducted
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- ACTION TRACKER
-- ---------------------------------------------------------

CREATE TABLE action_tracker (
  id SERIAL PRIMARY KEY,
  concern VARCHAR(200) NOT NULL,
  action VARCHAR(200) NOT NULL,
  responsible VARCHAR(100),
  date_raised DATE,
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status VARCHAR(20) DEFAULT 'Pending', -- Pending, In Progress, Completed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- EQUIPMENT (Lifting Equipment)
-- ---------------------------------------------------------

CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- Hoist, Truck, Lifting Gear, Crane
  capacity VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Available', -- Available, In Use, Maintenance
  location VARCHAR(100),
  last_inspection DATE,
  next_inspection DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------
-- AUDIT LOG (for void-and-replace integrity model)
-- ---------------------------------------------------------

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL, -- create, void, replace
  performed_by INTEGER REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT NOW(),
  details JSONB
);