'use client';

import { useState, useRef } from 'react';
import { saveRecipe, compressImage } from '@/lib/storage';
import { Ingredient } from '@/lib/types';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

interface FormState {
  title: string;
  servings: string;
  time: string;
  tags: string;
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  photo_url: string;
  source_url: string;
}

const emptyForm = (): FormState => ({
  title: '',
  servings: '',
  time: '',
  tags: '',
  ingredients: [{ name: '', amount: '', unit: '' }],
  steps: [''],
  notes: '',
  photo_url: '',
  source_url: '',
});

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-[#e8d5b7] bg-[#fdf8f0] focus:outline-none focus:ring-2 focus:ring-[#9b6845]/40 focus:border-[#9b6845] text-[#3d2b1f] placeholder-[#c4a882] text-sm transition-all';

const labelClass = 'block text-sm font-medium text-[#7a5c3a] mb-1.5';

export default function AddRecipeModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- 写真（base64圧縮） ---- */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const base64 = await compressImage(file);
      setForm((f) => ({ ...f, photo_url: base64 }));
    } catch {
      // 圧縮失敗時は元ファイルをそのまま base64 化
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm((f) => ({ ...f, photo_url: ev.target?.result as string }));
      reader.readAsDataURL(file);
    } finally {
      setPhotoLoading(false);
    }
  };

  /* ---- 材料 ---- */
  const updateIngredient = (
    idx: number,
    field: keyof Ingredient,
    value: string
  ) =>
    setForm((f) => {
      const ingredients = [...f.ingredients];
      ingredients[idx] = { ...ingredients[idx], [field]: value };
      return { ...f, ingredients };
    });

  const addIngredient = () =>
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: '', amount: '', unit: '' }],
    }));

  const removeIngredient = (idx: number) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));

  /* ---- 手順 ---- */
  const updateStep = (idx: number, value: string) =>
    setForm((f) => {
      const steps = [...f.steps];
      steps[idx] = value;
      return { ...f, steps };
    });

  const addStep = () =>
    setForm((f) => ({ ...f, steps: [...f.steps, ''] }));

  const removeStep = (idx: number) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));

  /* ---- 保存 ---- */
  const handleSave = () => {
    if (!form.title.trim()) {
      setSaveError('料理名を入力してください');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      saveRecipe({
        title: form.title.trim(),
        servings: form.servings.trim(),
        time: form.time.trim(),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: form.ingredients.filter((i) => i.name.trim()),
        steps: form.steps.filter((s) => s.trim()),
        notes: form.notes.trim(),
        photo_url: form.photo_url,
        source_url: form.source_url.trim(),
      });
      onAdded();
    } catch {
      setSaveError('保存に失敗しました。写真サイズを小さくしてお試しください。');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative z-10 w-full sm:max-w-lg bg-[#fdf8f0] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[86vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d5b7] shrink-0">
          <h2 className="text-lg font-bold text-[#7a5c3a]">レシピを追加</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e8d5b7] transition-colors text-[#9b6845] text-xl"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* スクロール可能エリア */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          <div className="space-y-5">
            {/* 料理名 */}
            <div>
              <label className={labelClass}>
                料理名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="例：肉じゃが"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            {/* 人数・時間 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>人数</label>
                <input
                  type="text"
                  placeholder="例：2人分"
                  value={form.servings}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, servings: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>調理時間</label>
                <input
                  type="text"
                  placeholder="例：30分"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* タグ */}
            <div>
              <label className={labelClass}>タグ（カンマ区切り）</label>
              <input
                type="text"
                placeholder="例：和食, 煮物, 定番"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            {/* 材料 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`${labelClass} mb-0`}>材料</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-xs text-[#9b6845] font-medium px-2.5 py-1 rounded-lg hover:bg-[#e8d5b7] transition-colors"
                >
                  ＋ 追加
                </button>
              </div>
              <div className="space-y-2">
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder="食材名"
                      value={ing.name}
                      onChange={(e) =>
                        updateIngredient(i, 'name', e.target.value)
                      }
                      className={`${inputClass} flex-[2] min-w-0`}
                    />
                    <input
                      type="text"
                      placeholder="量"
                      value={ing.amount}
                      onChange={(e) =>
                        updateIngredient(i, 'amount', e.target.value)
                      }
                      className={`${inputClass} w-14 shrink-0`}
                    />
                    <input
                      type="text"
                      placeholder="単位"
                      value={ing.unit}
                      onChange={(e) =>
                        updateIngredient(i, 'unit', e.target.value)
                      }
                      className={`${inputClass} w-14 shrink-0`}
                    />
                    {form.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(i)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-red-100 text-red-400 text-lg transition-colors"
                        aria-label="削除"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 手順 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`${labelClass} mb-0`}>手順</label>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-xs text-[#9b6845] font-medium px-2.5 py-1 rounded-lg hover:bg-[#e8d5b7] transition-colors"
                >
                  ＋ 追加
                </button>
              </div>
              <div className="space-y-2">
                {form.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="mt-2.5 text-sm font-bold text-[#9b6845] w-5 shrink-0 text-right select-none">
                      {i + 1}.
                    </span>
                    <textarea
                      rows={2}
                      placeholder={`手順 ${i + 1}`}
                      value={step}
                      onChange={(e) => updateStep(i, e.target.value)}
                      className={`${inputClass} flex-1 resize-none`}
                    />
                    {form.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="mt-1.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-red-100 text-red-400 text-lg transition-colors"
                        aria-label="削除"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className={labelClass}>メモ</label>
              <textarea
                rows={3}
                placeholder="ポイント・アレンジなど..."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* 写真 */}
            <div>
              <label className={labelClass}>写真</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {form.photo_url ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.photo_url}
                    alt="プレビュー"
                    className="w-full aspect-video object-cover rounded-xl border border-[#e8d5b7]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, photo_url: '' }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="w-full py-9 border-2 border-dashed border-[#e8d5b7] rounded-xl text-[#b8977a] text-sm hover:border-[#9b6845] hover:text-[#9b6845] transition-colors disabled:opacity-60 flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{photoLoading ? '🔄' : '📷'}</span>
                  <span>
                    {photoLoading ? '圧縮中...' : 'タップして写真を追加'}
                  </span>
                </button>
              )}
              <p className="text-xs text-[#c4a882] mt-1.5">
                ※ 自動で圧縮してlocalStorageに保存します
              </p>
            </div>

            {/* 元URL */}
            <div>
              <label className={labelClass}>元のURL（任意）</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.source_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, source_url: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-[#e8d5b7] bg-[#f5ede0] rounded-b-2xl shrink-0">
          {saveError && (
            <p className="text-red-500 text-sm mb-3">{saveError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#e8d5b7] text-[#9b6845] font-medium text-sm hover:bg-[#e8d5b7] transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving || photoLoading}
              className="flex-[2] py-3 rounded-xl bg-[#9b6845] text-white font-semibold text-sm hover:bg-[#7a5c3a] disabled:opacity-50 transition-colors active:scale-[0.98]"
            >
              {saving ? '保存中...' : '💾 レシピを保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
