import { Brand } from '../data/types';
import { Term } from '../data/types';
import { brands as defaultBrands } from '../data/brands';
import { dictionaryData as defaultDictionary } from '../data/dictionaryData';

// Types for storing user data
export interface UserData {
  userBrands: Brand[];
  userTerms: Term[];
  userSnippets: Record<string, string[]>;
}

// Keys for localStorage
const USER_DATA_KEY = 'bla_notes_user_data';

class UserDataService {
  private userData: UserData;

  constructor() {
    this.userData = this.loadUserData();
  }

  // Load user data from localStorage
  private loadUserData(): UserData {
    const storedData = localStorage.getItem(USER_DATA_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Default empty user data
    return {
      userBrands: [],
      userTerms: [],
      userSnippets: {}
    };
  }

  // Save user data to localStorage
  private saveUserData(): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.userData));
  }

  // Get combined brands (default + user)
  getAllBrands(): Brand[] {
    // User brands take precedence for duplicates
    const userBrandIds = new Set(this.userData.userBrands.map(b => b.name));
    const filteredDefault = defaultBrands.filter(b => !userBrandIds.has(b.name));
    return [...filteredDefault, ...this.userData.userBrands];
  }

  // Get combined terms (default + user)
  getAllTerms(): Term[] {
    // User terms take precedence for duplicates
    const userTermIds = new Set(this.userData.userTerms.map(t => t.id));
    const filteredDefault = defaultDictionary.terms.filter(t => !userTermIds.has(t.id));
    return [...filteredDefault, ...this.userData.userTerms];
  }

  // Get user-added brands
  getUserBrands(): Brand[] {
    return this.userData.userBrands;
  }

  // Get user-added terms
  getUserTerms(): Term[] {
    return this.userData.userTerms;
  }

  // Get user-added snippets for a specific brand
  getUserSnippets(brandName: string): string[] {
    return this.userData.userSnippets[brandName] || [];
  }

  // Add or update a brand
  addOrUpdateBrand(brand: Brand): void {
    const index = this.userData.userBrands.findIndex(b => b.name === brand.name);
    if (index >= 0) {
      this.userData.userBrands[index] = brand;
    } else {
      this.userData.userBrands.push(brand);
    }
    this.saveUserData();
  }

  // Add or update a term
  addOrUpdateTerm(term: Term): void {
    const index = this.userData.userTerms.findIndex(t => t.id === term.id);
    if (index >= 0) {
      this.userData.userTerms[index] = term;
    } else {
      // Generate a new ID if not set
      if (!term.id) {
        term.id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      this.userData.userTerms.push(term);
    }
    this.saveUserData();
  }

  // Add a snippet to a brand
  addSnippet(brandName: string, snippet: string): void {
    if (!this.userData.userSnippets[brandName]) {
      this.userData.userSnippets[brandName] = [];
    }
    this.userData.userSnippets[brandName].push(snippet);
    this.saveUserData();
  }

  // Remove a snippet from a brand
  removeSnippet(brandName: string, index: number): void {
    if (this.userData.userSnippets[brandName] && index >= 0 && index < this.userData.userSnippets[brandName].length) {
      this.userData.userSnippets[brandName].splice(index, 1);
      this.saveUserData();
    }
  }

  // Delete a brand
  deleteBrand(brandName: string): void {
    this.userData.userBrands = this.userData.userBrands.filter(b => b.name !== brandName);
    this.saveUserData();
  }

  // Delete a term
  deleteTerm(termId: string): void {
    this.userData.userTerms = this.userData.userTerms.filter(t => t.id !== termId);
    this.saveUserData();
  }

  // Check if a term is user-added
  isUserTerm(termId: string): boolean {
    return this.userData.userTerms.some(t => t.id === termId);
  }

  // Check if a brand is user-added
  isUserBrand(brandName: string): boolean {
    return this.userData.userBrands.some(b => b.name === brandName);
  }

  // Import data with options (replace or merge)
  importData(data: Partial<UserData>, replace: boolean): void {
    if (replace) {
      // Replace entire data sets if provided
      if (data.userBrands) this.userData.userBrands = data.userBrands;
      if (data.userTerms) this.userData.userTerms = data.userTerms;
      if (data.userSnippets) this.userData.userSnippets = data.userSnippets;
    } else {
      // Merge data, avoiding duplicates
      if (data.userBrands) {
        const existingBrandNames = new Set(this.userData.userBrands.map(b => b.name));
        const newBrands = data.userBrands.filter(b => !existingBrandNames.has(b.name));
        this.userData.userBrands = [...this.userData.userBrands, ...newBrands];
      }
      
      if (data.userTerms) {
        const existingTermIds = new Set(this.userData.userTerms.map(t => t.id));
        const newTerms = data.userTerms.filter(t => !existingTermIds.has(t.id));
        this.userData.userTerms = [...this.userData.userTerms, ...newTerms];
      }
      
      if (data.userSnippets) {
        for (const brandName in data.userSnippets) {
          if (!this.userData.userSnippets[brandName]) {
            this.userData.userSnippets[brandName] = [];
          }
          const existingSnippets = new Set(this.userData.userSnippets[brandName]);
          const newSnippets = data.userSnippets[brandName].filter(s => !existingSnippets.has(s));
          this.userData.userSnippets[brandName].push(...newSnippets);
        }
      }
    }
    
    this.saveUserData();
  }

  // Export all user data
  exportData(): UserData {
    return this.userData;
  }
}

// Create a singleton instance
export const userDataService = new UserDataService(); 