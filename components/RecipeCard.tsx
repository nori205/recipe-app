'use client';

import Link from 'next/link';
import { Recipe } from '@/lib/types';

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block group">
      <div className="bg-[#f5ede0] rounded-2xl overflow-hidden border border-[#e8d5b7] group-hover:shadow-md group-hover:border-[#c4956a] transition-all duration-200 active:scale-[0.98]">
        {/* 写真 */}
        <div className="relative aspect-video bg-[#e8d5b7] overflow-hidden">
          {recipe.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.photo_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-25 select-none">🍽️</span>
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-4">
          <h2 className="font-semibold text-[#3d2b1f] text-base leading-snug mb-2 line-clamp-2">
            {recipe.title}
          </h2>

          {/* メタ情報 */}
          {(recipe.servings || recipe.time) && (
            <div className="flex items-center gap-3 text-sm text-[#9b6845] mb-3">
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <span aria-hidden>👥</span>
                  {recipe.servings}
                </span>
              )}
              {recipe.time && (
                <span className="flex items-center gap-1">
                  <span aria-hidden>⏱</span>
                  {recipe.time}
                </span>
              )}
            </div>
          )}

          {/* タグ */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-[#e8d5b7] text-[#7a5c3a] text-xs px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-[#b8977a] text-xs py-1">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
