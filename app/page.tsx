'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllRecipes, searchRecipes } from '@/lib/storage';
import { Recipe } from '@/lib/types';
import RecipeCard from '@/components/RecipeCard';
import AddRecipeModal from '@/components/AddRecipeModal';

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadRecipes = () => {
    setRecipes(getAllRecipes());
  };

  useEffect(() => {
    loadRecipes();
    setMounted(true);
  }, []);

  // リアルタイム絞り込み（title・tags・材料名・手順・メモ）
  const filtered = useMemo(
    () => searchRecipes(recipes, searchQuery),
    [recipes, searchQuery]
  );

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-[#f5ede0]/95 backdrop-blur-sm border-b border-[#e8d5b7]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-[#7a5c3a] whitespace-nowrap">
            🍳 レシピ帳
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-[#9b6845] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#7a5c3a] transition-colors active:scale-95 shadow-sm"
          >
            ＋ 追加
          </button>
        </div>
      </header>

      {/* 検索バー */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8977a] pointer-events-none select-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="料理名・材料・タグで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#e8d5b7] bg-[#f5ede0] focus:outline-none focus:ring-2 focus:ring-[#9b6845]/40 focus:border-[#9b6845] text-[#3d2b1f] placeholder-[#c4a882] text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8977a] hover:text-[#9b6845] w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e8d5b7] transition-colors"
              aria-label="クリア"
            >
              ×
            </button>
          )}
        </div>
        {hasQuery && (
          <p className="text-xs text-[#b8977a] mt-1.5 px-1">
            「{searchQuery}」で絞り込み中
          </p>
        )}
      </div>

      {/* コンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-20">
        {!mounted && (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#e8d5b7] border-t-[#9b6845] rounded-full animate-spin" />
          </div>
        )}

        {mounted && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 select-none">🍽️</div>
            {hasQuery ? (
              <>
                <p className="text-[#9b6845] font-medium mb-1">
                  見つかりませんでした
                </p>
                <p className="text-[#c4a882] text-sm">
                  「{searchQuery}」を含むレシピはありません
                </p>
              </>
            ) : (
              <>
                <p className="text-[#9b6845] font-medium mb-2">
                  レシピがまだありません
                </p>
                <p className="text-[#c4a882] text-sm">
                  「＋ 追加」からレシピを追加してみましょう
                </p>
              </>
            )}
          </div>
        )}

        {mounted && filtered.length > 0 && (
          <>
            <p className="text-xs text-[#b8977a] mb-3">
              {hasQuery
                ? `${filtered.length} 件ヒット（全 ${recipes.length} 件）`
                : `${recipes.length} 件のレシピ`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* 追加モーダル */}
      {isModalOpen && (
        <AddRecipeModal
          onClose={() => setIsModalOpen(false)}
          onAdded={() => {
            setIsModalOpen(false);
            loadRecipes();
          }}
        />
      )}
    </div>
  );
}
