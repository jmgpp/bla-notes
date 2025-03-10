import { Brand } from './types';
import { brandsData } from './brandsData';

export type { Brand };
export const brands: Brand[] = brandsData;

// Utility function to get all category to group mappings
export const getCategoryGroupMap = (): Record<string, string> => {
  return {
    // Medical facilities (grouped under "Hospitals")
    'Hospitals': 'Hospitals',
    'Clinics': 'Hospitals',
    
    // Financial institutions
    'Banks': 'Financial',
    'Credit Unions': 'Financial',
    'Investment Firms': 'Financial',
    'Debt': 'Financial',
    
    // Medications
    'Pain': 'Medication',
    'Chronic': 'Medication',
    'Antibiotics': 'Medication',
    'Mental Health': 'Medication',
    'Diabetes': 'Medication',
    'Cholesterol': 'Medication',
    'Blood Thinners': 'Medication',
    'Hypertension': 'Medication',
    'Respiratory': 'Medication',
    'Gastrointestinal': 'Medication',
    
    // New categories
    'Government': 'Government',
    'Healthcare': 'Healthcare',
    
    // Keep these as their own categories
    'Pharmacies': 'Pharmacies',
    'Health Insurance': 'Health Insurance',
    
    // Other category for custom brands
    'Other': 'Other',
  };
};

// Utility function to get color for a group
export const getGroupColorMap = (): Record<string, string> => {
  return {
    'Hospitals': '#0d6efd', // Blue
    'Pharmacies': '#6f42c1', // Purple
    'Health Insurance': '#0dcaf0', // Cyan
    'Financial': '#198754', // Green
    'Medication': '#dc3545', // Red
    'Government': '#fd7e14', // Orange
    'Healthcare': '#20c997', // Teal
    'Other': '#6c757d', // Gray
  };
};

// Utility function to get color for a category based on its parent group
export const getCategoryColorMap = (): Record<string, Record<string, string>> => {
  return {
    // Blues/Cyans for Hospital group
    'Hospitals': {
      'Hospitals': '#0d6efd', // Standard blue
      'Clinics': '#0dcaf0', // Cyan-blue
    },
    
    // Purples for Pharmacies
    'Pharmacies': {
      'Pharmacies': '#6f42c1', // Purple
    },
    
    // Blues/Cyans for Health Insurance
    'Health Insurance': {
      'Health Insurance': '#0dcaf0', // Cyan
    },
    
    // Greens for Financial group
    'Financial': {
      'Banks': '#198754', // Standard green
      'Credit Unions': '#20c997', // Teal
      'Investment Firms': '#00bc8c', // Light teal
      'Debt': '#5a7052', // Olive green
    },
    
    // Reds/Pinks for Medication group
    'Medication': {
      'Pain': '#dc3545', // Bright red
      'Chronic': '#bd2130', // Dark red
      'Antibiotics': '#e83e8c', // Pink
      'Mental Health': '#d63384', // Raspberry
      'Diabetes': '#c71f37', // Crimson
      'Cholesterol': '#ff6b6b', // Coral red
      'Blood Thinners': '#cd5c5c', // Indian red
      'Hypertension': '#a52a2a', // Brown-red
      'Respiratory': '#ff4500', // Orange-red
      'Gastrointestinal': '#b22222', // Firebrick
    },
    
    // Oranges for Government
    'Government': {
      'Government': '#fd7e14', // Orange
    },
    
    // Teals for Healthcare
    'Healthcare': {
      'Healthcare': '#20c997', // Teal
    },
    
    // Gray for Other
    'Other': {
      'Other': '#6c757d', // Gray
    },
  };
}; 