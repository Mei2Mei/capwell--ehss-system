// sustainabilityData.js
// Real data from Sustainability Report and Indicators Main 2026.xlsx
// Emission factors from Kenyan Emission Factors sheet

export const emissionFactors = {
  petrol:      2.3,   // kg CO2 per litre
  diesel:      2.7,  // kg CO2 per litre
  firewood:    61.81,  // kg CO2 per tonne
  lpg:         1.51,   // kg CO2 per kg
  electricity: 0.5,    // kg CO2 per kWh (EPRA 2023)
};

export const sustainabilityRecords = [
  {
    id: 1,
    period: "2026-01-01",
    // Water
    water_consumption_m3: 450,
    water_recycled_m3: 120,
    // Energy
    electricity_kwh: 314150,
    solar_kwh: 2000,
    firewood_tonnes: 0,
    diesel_litres: 15744.09,
    petrol_litres: 8670.15,
    lpg_kg: 0,
    // Waste
    paper_waste_kg: 5860,
    plastic_packaging_kg: 410.73,
    hazardous_waste_kg: 120,
    recyclable_plastic_kg: 85,
  },
  {
    id: 2,
    period: "2026-02-01",
    water_consumption_m3: 430,
    water_recycled_m3: 100,
    electricity_kwh: 82000,
    solar_kwh: 1800,
    firewood_tonnes: 11.8,
    diesel_litres: 3100,
    petrol_litres: 750,
    lpg_kg: 240,
    paper_waste_kg: 5930,
    plastic_packaging_kg: 406.58,
    hazardous_waste_kg: 110,
    recyclable_plastic_kg: 90,
  },
  {
    id: 3,
    period: "2026-03-01",
    water_consumption_m3: 460,
    water_recycled_m3: 130,
    electricity_kwh: 88000,
    solar_kwh: 2200,
    firewood_tonnes: 13.1,
    diesel_litres: 3400,
    petrol_litres: 820,
    lpg_kg: 260,
    paper_waste_kg: 5646,
    plastic_packaging_kg: 327.19,
    hazardous_waste_kg: 130,
    recyclable_plastic_kg: 78,
  },
  {
    id: 4,
    period: "2026-04-01",
    water_consumption_m3: 480,
    water_recycled_m3: 140,
    electricity_kwh: 85000,
    solar_kwh: 2100,
    firewood_tonnes: 12.9,
    diesel_litres: 3250,
    petrol_litres: 790,
    lpg_kg: 255,
    paper_waste_kg: 7960,
    plastic_packaging_kg: 414.84,
    hazardous_waste_kg: 115,
    recyclable_plastic_kg: 92,
  },
];