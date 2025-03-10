export interface Brand {
  name: string;
  category: string;
  translation?: string;
  notes?: string;
  snippets?: string[];
}

export interface Term {
  id: string;
  categoryId: number;
  subcategoryId: number;
  englishTerm: string;
  spanishTerm: string;
  notes: string;
  tags: string[];
} 