'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRecipeById, deleteRecipe } from '@/lib/storage';
import { Recipe } from '@/lib/types';

const MULTIPLIERS = [0.5, 1, 1.5, 2, 3, 4] as const;

function multiplyAmount(amount: string, mult: number): string {
  if (!amount) return amount;
  // 分数対応（例: 1/2）
  const frac = amount.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) {
    const val = parseFloat(frac[1]) / parseFloat(frac[2]);
    if (!isNaN(val)) return fmt(val * mult);
  }
  const n = parseFloat(amount);
  if (isNaN(n)) return amount; // "適量" などはそのまま
  return fmt(n * mult);
}

function fmt(n: number): string {
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? String(r) : String(r);
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const r = getRecipeById(id);
    if (r) setRecipe(r);
    else setNotFound(true);
  }, [id]);

  const handleDelete = () => {
    setDeleting(true);
    deleteRecipe(id);
    router.push('/');
  };

  if (!recipe && !notFound) {
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#e8d5b7] border-t-[#9b6845] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-6xl">🍽️</div>
        <p className="text-[#9b6845] font-medium">レシピが見つかりません</p>
        <Link href="/" className="text-sm text-[#9b6845] underline underline-offset-2">
          一覧に戻る
        </Link>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-[#f5ede0]/95 backdrop-blur-sm border-b border-[#e8d5b7]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 flex items-center gap-1 text-[#9b6845] hover:text-[#7a5c3a] text-sm font-medium transition-colors"
          >
            ← 一覧
          </Link>
          <h1 className="flex-1 text-base font-bold text-[#7a5c3a] text-center line-clamp-1">
            {recipe.title}
          </h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="shrink-0 text-[#c4a882] hover:text-red-500 transition-colors p-1"
            aria-label="削除"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* 写真 */}
      {recipe.photo_url && (
        <div className="w-full aspect-video max-h-72 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-7">
        {/* タイトル・メタ */}
        <div>
          <h2 className="text-2xl font-bold text-[#3d2b1f] mb-3 leading-snug">
            {recipe.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {recipe.servings && (
              <span className="flex items-center gap-1.5 bg-[#f5ede0] border border-[#e8d5b7] px-3 py-1.5 rounded-full text-sm text-[#9b6845]">
                👥 {recipe.servings}
              </span>
            )}
            {recipe.time && (
              <span className="flex items-center gap-1.5 bg-[#f5ede0] border border-[#e8d5b7] px-3 py-1.5 rounded-full text-sm text-[#9b6845]">
                ⏱ {recipe.time}
              </span>
            )}
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#e8d5b7] text-[#7a5c3a] text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 倍量スライダー */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-[#f5ede0] rounded-2xl p-4 border border-[#e8d5b7]">
            <p className="text-sm font-semibold text-[#7a5c3a] mb-3">
              📏 倍量調整
            </p>
            <div className="flex flex-wrap gap-2">
              {MULTIPLIERS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                    multiplier === m
                      ? 'bg-[#9b6845] text-white shadow-sm'
                      : 'bg-[#e8d5b7] text-[#7a5c3a] hover:bg-[#d9c5a0]'
                  }`}
                >
                  ×{m}
                </button>
              ))}
            </div>
            {multiplier !== 1 && (
              <p className="text-xs text-[#b8977a] mt-2">
                {multiplier} 倍の分量で表示中
              </p>
            )}
          </div>
        )}

        {/* 材料 */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-[#7a5c3a] mb-3">🥕 材料</h3>
            <div className="bg-[#f5ede0] rounded-2xl border border-[#e8d5b7] overflow-hidden">
              {recipe.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < recipe.ingredients.length - 1
                      ? 'border-b border-[#e8d5b7]'
                      : ''
                  }`}
                >
                  <span className="text-[#3d2b1f] text-sm">{ing.name}</span>
                  <span className="text-[#9b6845] text-sm font-medium ml-4 text-right">
                    {multiplyAmount(ing.amount, multiplier)}
                    {ing.unit && (
                      <span className="text-[#b8977a] ml-0.5 text-xs">
                        {ing.unit}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 手順 */}
        {recipe.steps && recipe.steps.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-[#7a5c3a] mb-3">📋 作り方</h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-4 bg-[#f5ede0] rounded-xl px-4 py-3.5 border border-[#e8d5b7]"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#9b6845] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[#3d2b1f] text-sm leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* メモ */}
        {recipe.notes && (
          <section>
            <h3 className="text-lg font-bold text-[#7a5c3a] mb-3">📝 メモ</h3>
            <div className="bg-[#f5ede0] rounded-2xl border border-[#e8d5b7] px-4 py-4">
              <p className="text-[#3d2b1f] text-sm leading-relaxed whitespace-pre-wrap">
                {recipe.notes}
              </p>
            </div>
          </section>
        )}

        {/* 元URL */}
        {recipe.source_url && (
          <div className="text-center pt-2">
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#9b6845] underline underline-offset-2 hover:text-[#7a5c3a] transition-colors"
            >
              🔗 元のレシピページを見る
            </a>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 bg-[#fdf8f0] rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#3d2b1f] mb-2">
              削除しますか？
            </h3>
            <p className="text-sm text-[#9b6845] mb-6">
              「{recipe.title}」を削除します。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-[#e8d5b7] text-[#9b6845] font-medium text-sm hover:bg-[#e8d5b7] transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
