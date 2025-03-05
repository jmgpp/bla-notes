export interface Brand {
  name: string;
  category: string;
  translation?: string;
  notes?: string;
  snippets?: string[];
}

export const brands: Brand[] = [
  // Hospitals (Known Internationally)
  { name: 'Mayo Clinic', category: 'Hospitals', translation: 'Clínica Mayo', notes: 'Renowned medical center with locations in Minnesota, Arizona, and Florida', snippets: [
    "Thank you for calling Mayo Clinic, where the needs of the patient come first. How may I assist you today?",
    "For your safety and privacy, I'll need to verify some information before we proceed.",
    "Mayo Clinic is committed to providing you with the highest quality care and service.",
    "Would you like me to connect you with our patient appointment services?"
  ] },
  { name: 'Johns Hopkins Hospital', category: 'Hospitals', translation: 'Hospital Johns Hopkins', notes: 'Leading academic medical center in Baltimore, Maryland' },
  { name: 'Cleveland Clinic', category: 'Hospitals', translation: 'Clínica Cleveland', notes: 'Multispecialty academic hospital in Cleveland, Ohio' },
  { name: 'Massachusetts General Hospital', category: 'Hospitals', translation: 'Hospital General de Massachusetts', notes: 'Harvard Medical School teaching hospital in Boston' },
  { name: 'Mount Sinai Hospital', category: 'Hospitals', translation: 'Hospital Mount Sinai', notes: 'Academic medical center in New York City' },
  { name: 'Stanford Health Care', category: 'Hospitals', translation: 'Stanford Health Care', notes: 'Academic medical center in Stanford, California' },
  { name: 'UCLA Medical Center', category: 'Hospitals', translation: 'Centro Médico UCLA', notes: 'University of California Los Angeles medical facility' },
  { name: 'New York Presbyterian Hospital', category: 'Hospitals', translation: 'Hospital Presbiteriano de Nueva York', notes: 'Academic medical center affiliated with Columbia and Cornell' },
  { name: 'MD Anderson Cancer Center', category: 'Hospitals', translation: 'Centro de Cáncer MD Anderson', notes: 'Cancer treatment and research center in Houston, Texas' },
  { name: 'Cedars-Sinai Medical Center', category: 'Hospitals', translation: 'Centro Médico Cedars-Sinai', notes: 'Nonprofit hospital in Los Angeles, California' },
  
  // Clinics
  { name: 'Kaiser Permanente Clinics', category: 'Clinics', translation: 'Clínicas Kaiser Permanente', notes: 'Integrated managed care consortium' },
  { name: 'MinuteClinic (CVS)', category: 'Clinics', translation: 'MinuteClinic (CVS)', notes: 'Retail health clinic inside CVS Pharmacy locations' },
  { name: 'Urgent Care Centers', category: 'Clinics', translation: 'Centros de Atención Urgente', notes: 'Walk-in clinics for non-emergency medical care' },
  { name: 'Community Health Clinics', category: 'Clinics', translation: 'Clínicas de Salud Comunitaria', notes: 'Nonprofit clinics serving underserved populations' },
  { name: 'Planned Parenthood Clinics', category: 'Clinics', translation: 'Clínicas de Planned Parenthood', notes: 'Reproductive health care provider' },
  { name: 'Veterans Affairs (VA) Clinics', category: 'Clinics', translation: 'Clínicas de Asuntos de Veteranos (VA)', notes: 'Healthcare facilities for military veterans' },
  { name: 'University Health Clinics', category: 'Clinics', translation: 'Clínicas de Salud Universitarias', notes: 'Medical clinics affiliated with universities' },
  { name: 'Wellness Centers', category: 'Clinics', translation: 'Centros de Bienestar', notes: 'Facilities focused on preventive healthcare and wellness' },
  { name: 'Family Practice Clinics', category: 'Clinics', translation: 'Clínicas de Medicina Familiar', notes: 'Primary care clinics for all ages' },
  { name: 'Specialized Medical Centers', category: 'Clinics', translation: 'Centros Médicos Especializados', notes: 'Clinics focused on specific medical specialties' },
  
  // Pharmacies
  { name: 'CVS Pharmacy', category: 'Pharmacies', translation: 'Farmacia CVS', notes: 'Major retail pharmacy chain in the US' },
  { name: 'Walgreens', category: 'Pharmacies', translation: 'Walgreens', notes: 'Second largest pharmacy store chain in the US' },
  { name: 'Rite Aid', category: 'Pharmacies', translation: 'Rite Aid', notes: 'Retail pharmacy chain primarily on the East Coast' },
  { name: 'Walmart Pharmacy', category: 'Pharmacies', translation: 'Farmacia Walmart', notes: 'Pharmacy department within Walmart stores' },
  { name: 'Kroger Pharmacy', category: 'Pharmacies', translation: 'Farmacia Kroger', notes: 'Pharmacy within Kroger grocery stores' },
  { name: 'Target Pharmacy', category: 'Pharmacies', translation: 'Farmacia Target', notes: 'Now operated by CVS within Target stores' },
  { name: 'Costco Pharmacy', category: 'Pharmacies', translation: 'Farmacia Costco', notes: 'Pharmacy within Costco wholesale clubs' },
  { name: "Sam's Club Pharmacy", category: 'Pharmacies', translation: "Farmacia Sam's Club", notes: "Pharmacy within Sam's Club wholesale clubs" },
  { name: 'Safeway Pharmacy', category: 'Pharmacies', translation: 'Farmacia Safeway', notes: 'Pharmacy within Safeway grocery stores' },
  
  // Health Insurance Companies
  { name: 'Blue Cross Blue Shield', category: 'Health Insurance', translation: 'Blue Cross Blue Shield', notes: 'Federation of 35 independent health insurance organizations', snippets: [
    "Thank you for choosing Blue Cross Blue Shield. How may I assist you with your healthcare needs today?",
    "For your protection, I'll need to verify your member information.",
    "Let me explain your benefits and coverage options.",
    "Would you like me to help you locate an in-network provider?"
  ] },
  { name: 'UnitedHealthcare', category: 'Health Insurance', translation: 'UnitedHealthcare', notes: 'Largest health insurance company in the US' },
  { name: 'Aetna', category: 'Health Insurance', translation: 'Aetna', notes: 'Major health insurance provider, now part of CVS Health' },
  { name: 'Cigna', category: 'Health Insurance', translation: 'Cigna', notes: 'Global health service company' },
  { name: 'Humana', category: 'Health Insurance', translation: 'Humana', notes: 'Health insurance company focused on Medicare plans' },
  { name: 'Kaiser Permanente', category: 'Health Insurance', translation: 'Kaiser Permanente', notes: 'Integrated managed care consortium' },
  { name: 'Anthem', category: 'Health Insurance', translation: 'Anthem', notes: 'Largest for-profit managed health care company in the Blue Cross Blue Shield Association' },
  { name: 'Medicare', category: 'Health Insurance', translation: 'Medicare', notes: 'Federal health insurance program for people 65+ or with certain disabilities' },
  { name: 'Medicaid', category: 'Health Insurance', translation: 'Medicaid', notes: 'Federal and state program that helps with medical costs for people with limited income' },
  { name: 'Tricare', category: 'Health Insurance', translation: 'Tricare', notes: 'Health care program for uniformed service members and their families' },
  
  // Debt Collector Companies - National Debt Collectors
  { name: 'Encore Capital Group', category: 'Debt', translation: 'Encore Capital Group', notes: 'Major debt collection company (National)' },
  { name: 'Portfolio Recovery Associates', category: 'Debt', translation: 'Portfolio Recovery Associates', notes: 'Debt collection and purchasing company (National)' },
  { name: 'Midland Credit Management', category: 'Debt', translation: 'Midland Credit Management', notes: 'Subsidiary of Encore Capital Group (National)' },
  { name: 'LVNV Funding', category: 'Debt', translation: 'LVNV Funding', notes: 'Debt buyer and collector (National)' },
  { name: 'CBE Group', category: 'Debt', translation: 'CBE Group', notes: 'Collections agency (National)' },
  { name: 'Allied Interstate', category: 'Debt', translation: 'Allied Interstate', notes: 'Collections agency (National)' },
  { name: 'IC System', category: 'Debt', translation: 'IC System', notes: 'Third-party collections agency (National)' },
  { name: 'Credit Management LP', category: 'Debt', translation: 'Credit Management LP', notes: 'Collections agency (National)' },
  { name: 'Transworld Systems', category: 'Debt', translation: 'Transworld Systems', notes: 'Collections agency (National)' },
  { name: 'GC Services', category: 'Debt', translation: 'GC Services', notes: 'Collections agency (National)' },
  { name: 'Revenue ARB', category: 'Debt', translation: 'Revenue ARB', notes: 'Collections agency (National)' },
  { name: 'Convergent Resource Group', category: 'Debt', translation: 'Convergent Resource Group', notes: 'Collections agency (National)' },
  { name: 'Harris & Harris', category: 'Debt', translation: 'Harris & Harris', notes: 'Collections agency (National)' },
  { name: 'Professional Collection Consultants', category: 'Debt', translation: 'Professional Collection Consultants', notes: 'Collections agency (National)' },
  { name: 'Northwest Collection Bureau', category: 'Debt', translation: 'Northwest Collection Bureau', notes: 'Collections agency (National)' },
  
  // Debt Collector Companies - Medical Debt
  { name: 'Medical Recovery Services', category: 'Debt', translation: 'Medical Recovery Services', notes: 'Medical debt collection agency (Specialized)' },
  { name: 'Transworld Systems Medical Collections', category: 'Debt', translation: 'Transworld Systems Medical Collections', notes: 'Medical debt collection agency (Specialized)' },
  { name: 'Healthcare Revenue Group', category: 'Debt', translation: 'Healthcare Revenue Group', notes: 'Medical debt collection agency (Specialized)' },
  { name: 'Medical Receivables Solutions', category: 'Debt', translation: 'Medical Receivables Solutions', notes: 'Medical debt collection agency (Specialized)' },
  
  // Debt Collector Companies - Credit Card Debt
  { name: 'Synchrony Bank Collections', category: 'Debt', translation: 'Synchrony Bank Collections', notes: 'Credit card debt collection (Specialized)' },
  { name: 'Citibank Collections', category: 'Debt', translation: 'Citibank Collections', notes: 'Credit card debt collection (Specialized)' },
  { name: 'Capital One Collections', category: 'Debt', translation: 'Capital One Collections', notes: 'Credit card debt collection (Specialized)', snippets: [
    "This is an attempt to collect a debt and any information obtained will be used for that purpose.",
    "This communication is from a debt collector.",
    "You have the right to dispute the validity of this debt within 30 days.",
    "Please be advised that this call may be monitored or recorded for quality assurance."
  ] },
  { name: 'Chase Credit Card Collections', category: 'Debt', translation: 'Chase Credit Card Collections', notes: 'Credit card debt collection (Specialized)' },
  { name: 'Bank of America Collections', category: 'Debt', translation: 'Bank of America Collections', notes: 'Credit card debt collection (Specialized)' },
  
  // Debt Collector Companies - Student Loan Debt
  { name: 'Navient', category: 'Debt', translation: 'Navient', notes: 'Student loan servicer and collector (Specialized)' },
  { name: 'American Education Services', category: 'Debt', translation: 'American Education Services', notes: 'Student loan servicer (Specialized)' },
  { name: 'Great Lakes Educational Loan Services', category: 'Debt', translation: 'Great Lakes Educational Loan Services', notes: 'Student loan servicer (Specialized)' },
  { name: 'Nelnet', category: 'Debt', translation: 'Nelnet', notes: 'Student loan servicer (Specialized)' },
  
  // Debt Collector Companies - Large Collection Corporations
  { name: 'Sherman Financial Group', category: 'Debt', translation: 'Sherman Financial Group', notes: 'Debt collection corporation (Large Corporation)' },
  { name: 'Resurgent Capital Services', category: 'Debt', translation: 'Resurgent Capital Services', notes: 'Debt collection corporation (Large Corporation)' },
  { name: 'Radius Global Solutions', category: 'Debt', translation: 'Radius Global Solutions', notes: 'Debt collection corporation (Large Corporation)' },
  { name: 'Atlantic Credit & Finance', category: 'Debt', translation: 'Atlantic Credit & Finance', notes: 'Debt collection corporation (Large Corporation)' },
  { name: 'PRA Group', category: 'Debt', translation: 'PRA Group', notes: 'Debt collection corporation (Large Corporation)' },
  
  // Debt Collector Companies - Additional Notable Agencies
  { name: 'Enhanced Recovery Company (ERC)', category: 'Debt', translation: 'Enhanced Recovery Company (ERC)', notes: 'Collections agency (Notable)' },
  { name: 'Financial Collection Agencies', category: 'Debt', translation: 'Financial Collection Agencies', notes: 'Collections agency (Notable)' },
  { name: 'National Credit Systems', category: 'Debt', translation: 'National Credit Systems', notes: 'Collections agency (Notable)' },
  { name: 'American Profit Recovery', category: 'Debt', translation: 'American Profit Recovery', notes: 'Collections agency (Notable)' },
  { name: 'Collect Med', category: 'Debt', translation: 'Collect Med', notes: 'Medical collections agency (Notable)' },
  { name: 'Windham Professionals', category: 'Debt', translation: 'Windham Professionals', notes: 'Collections agency (Notable)' },
  { name: 'State Collection Service', category: 'Debt', translation: 'State Collection Service', notes: 'Collections agency (Notable)' },
  { name: 'The Bureaus Collection', category: 'Debt', translation: 'The Bureaus Collection', notes: 'Collections agency (Notable)' },
  { name: 'First Collection Services', category: 'Debt', translation: 'First Collection Services', notes: 'Collections agency (Notable)' },
  { name: 'Olympic Collection Agency', category: 'Debt', translation: 'Olympic Collection Agency', notes: 'Collections agency (Notable)' },
  
  // Banks
  { name: 'JPMorgan Chase', category: 'Banks', translation: 'JPMorgan Chase', notes: 'Largest bank in the US by assets' },
  { name: 'Bank of America', category: 'Banks', translation: 'Bank of America', notes: 'Second largest bank in the US' },
  { name: 'Wells Fargo', category: 'Banks', translation: 'Wells Fargo', notes: 'American multinational financial services company' },
  { name: 'Citibank', category: 'Banks', translation: 'Citibank', notes: 'Consumer division of financial services multinational Citigroup' },
  { name: 'US Bank', category: 'Banks', translation: 'US Bank', notes: 'Fifth largest banking institution in the US' },
  { name: 'Capital One', category: 'Banks', translation: 'Capital One', notes: 'Bank holding company specializing in credit cards and loans' },
  { name: 'PNC Bank', category: 'Banks', translation: 'PNC Bank', notes: 'Bank operating in 21 states and Washington, D.C.' },
  { name: 'Regions Bank', category: 'Banks', translation: 'Regions Bank', notes: 'Bank operating throughout the Southern US' },
  { name: 'SunTrust Bank', category: 'Banks', translation: 'SunTrust Bank', notes: 'Now part of Truist Financial after merging with BB&T' },
  { name: 'TD Bank', category: 'Banks', translation: 'TD Bank', notes: 'US subsidiary of Canadian Toronto-Dominion Bank' },
  
  // Credit Unions
  { name: 'Navy Federal Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito Navy Federal', notes: 'Largest credit union in the US, serving military members' },
  { name: 'Pentagon Federal Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito Federal Pentagon', notes: 'Credit union for military and defense community' },
  { name: 'State Employees Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito de Empleados Estatales', notes: 'Credit union for state employees' },
  { name: 'Teachers Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito para Maestros', notes: 'Credit union for educators' },
  { name: 'Boeing Employees Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito de Empleados de Boeing', notes: 'Credit union originally for Boeing employees' },
  
  // Investment Firms
  { name: 'Fidelity Investments', category: 'Investment Firms', translation: 'Fidelity Investments', notes: 'Financial services corporation managing retirement plans and funds' },
  { name: 'Charles Schwab', category: 'Investment Firms', translation: 'Charles Schwab', notes: 'Banking and brokerage firm' },
  { name: 'Vanguard', category: 'Investment Firms', translation: 'Vanguard', notes: 'Investment management company known for low-cost index funds' },
  { name: 'BlackRock', category: 'Investment Firms', translation: 'BlackRock', notes: "World's largest asset manager" },
  { name: 'Morgan Stanley', category: 'Investment Firms', translation: 'Morgan Stanley', notes: 'Investment bank and financial services company' },
  
  // Pain Relievers
  { name: 'Ibuprofen (Advil)', category: 'Pain Relievers', translation: 'Ibuprofeno (Advil)', notes: 'NSAID used to reduce fever and treat pain or inflammation' },
  { name: 'Acetaminophen (Tylenol)', category: 'Pain Relievers', translation: 'Acetaminofén (Tylenol)', notes: 'Pain reliever and fever reducer' },
  { name: 'Naproxen (Aleve)', category: 'Pain Relievers', translation: 'Naproxeno (Aleve)', notes: 'NSAID used to treat pain, inflammation, and fever' },
  { name: 'Aspirin', category: 'Pain Relievers', translation: 'Aspirina', notes: 'Pain reliever, fever reducer, and anti-inflammatory' },
  
  // Chronic Condition Medications
  { name: 'Metformin', category: 'Chronic Medications', translation: 'Metformina', notes: 'First-line medication for type 2 diabetes' },
  { name: 'Lisinopril', category: 'Chronic Medications', translation: 'Lisinopril', notes: 'ACE inhibitor used to treat high blood pressure and heart failure' },
  { name: 'Levothyroxine', category: 'Chronic Medications', translation: 'Levotiroxina', notes: 'Synthetic thyroid hormone for hypothyroidism' },
  { name: 'Atorvastatin', category: 'Chronic Medications', translation: 'Atorvastatina', notes: 'Statin medication used to prevent cardiovascular disease' },
  { name: 'Amlodipine', category: 'Chronic Medications', translation: 'Amlodipina', notes: 'Calcium channel blocker used to treat high blood pressure' },
  
  // Antibiotics
  { name: 'Amoxicillin', category: 'Antibiotics', translation: 'Amoxicilina', notes: 'Penicillin antibiotic used to treat bacterial infections' },
  { name: 'Azithromycin', category: 'Antibiotics', translation: 'Azitromicina', notes: 'Macrolide antibiotic used to treat bacterial infections' },
  { name: 'Ciprofloxacin', category: 'Antibiotics', translation: 'Ciprofloxacina', notes: 'Fluoroquinolone antibiotic used to treat bacterial infections' },
  { name: 'Doxycycline', category: 'Antibiotics', translation: 'Doxiciclina', notes: 'Tetracycline antibiotic used to treat bacterial infections' },
  
  // Mental Health Medications
  { name: 'Sertraline (Zoloft)', category: 'Mental Health Medications', translation: 'Sertralina (Zoloft)', notes: 'SSRI antidepressant' },
  { name: 'Fluoxetine (Prozac)', category: 'Mental Health Medications', translation: 'Fluoxetina (Prozac)', notes: 'SSRI antidepressant' },
  { name: 'Escitalopram (Lexapro)', category: 'Mental Health Medications', translation: 'Escitalopram (Lexapro)', notes: 'SSRI antidepressant' },
  { name: 'Alprazolam (Xanax)', category: 'Mental Health Medications', translation: 'Alprazolam (Xanax)', notes: 'Benzodiazepine used to treat anxiety and panic disorders' },
];

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
    'Pain Relievers': 'Medication',
    'Chronic Medications': 'Medication',
    'Antibiotics': 'Medication',
    'Mental Health Medications': 'Medication',
    
    // Keep these as their own categories
    'Pharmacies': 'Pharmacies',
    'Health Insurance': 'Health Insurance',
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
      'Pain Relievers': '#dc3545', // Bright red
      'Chronic Medications': '#bd2130', // Dark red
      'Antibiotics': '#e83e8c', // Pink
      'Mental Health Medications': '#d63384', // Raspberry
    },
  };
}; 