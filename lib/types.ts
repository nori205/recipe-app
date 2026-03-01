export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: string;
  time: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  photo_url: string;
  source_url: string;
  created_at: string;
}
