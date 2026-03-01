import { Recipe } from './types';

const STORAGE_KEY = 'recipe_app_data';

/* ---- CRUD ---- */

export function getAllRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

export function getRecipeById(id: string): Recipe | null {
  return getAllRecipes().find((r) => r.id === id) ?? null;
}

export function saveRecipe(
  data: Omit<Recipe, 'id' | 'created_at'>
): Recipe {
  const all = getAllRecipes();
  const newRecipe: Recipe = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  all.unshift(newRecipe); // 新しい順
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newRecipe;
}

export function deleteRecipe(id: string): void {
  const updated = getAllRecipes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/* ---- 横断検索 ---- */

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  const q = query.trim().toLowerCase();
  if (!q) return recipes;

  return recipes.filter(
    (r) =>
      r.title?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q)) ||
      r.ingredients?.some((i) => i.name.toLowerCase().includes(q)) ||
      r.steps?.some((s) => s.toLowerCase().includes(q))
  );
}

/* ---- 画像圧縮（base64） ---- */

export async function compressImage(
  file: File,
  maxWidth = 900,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas context error'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
