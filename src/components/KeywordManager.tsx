import React, { useState } from 'react';
import { Store, KeywordItem } from '../types';
import { INDUSTRY_TEMPLATES } from '../data/initialData';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle2,
  RotateCcw,
  Tag,
  Coffee,
  HeartPulse,
  Car,
  Dumbbell,
  ShoppingBag,
  Info
} from 'lucide-react';

interface KeywordManagerProps {
  store: Store;
  keywords: KeywordItem[];
  onUpdateKeywords: (updated: KeywordItem[]) => void;
}

export const KeywordManager: React.FC<KeywordManagerProps> = ({
  store,
  keywords,
  onUpdateKeywords,
}) => {
  const [newKeywordText, setNewKeywordText] = useState('');
  const [newKeywordCategory, setNewKeywordCategory] = useState<'experience' | 'product' | 'staff'>('product');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(store.industry || 'cafe');
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordText.trim()) return;

    const newItem: KeywordItem = {
      id: 'k_' + Date.now(),
      text: newKeywordText.trim(),
      category: newKeywordCategory,
      isCustom: true,
    };

    onUpdateKeywords([...keywords, newItem]);
    setNewKeywordText('');
  };

  const handleDeleteKeyword = (id: string) => {
    onUpdateKeywords(keywords.filter((k) => k.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= keywords.length) return;

    const updated = [...keywords];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onUpdateKeywords(updated);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = INDUSTRY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const newKeywords: KeywordItem[] = [
      ...template.keywords.product.map((text, i) => ({
        id: `tpl_prod_${Date.now()}_${i}`,
        text,
        category: 'product' as const,
      })),
      ...template.keywords.experience.map((text, i) => ({
        id: `tpl_exp_${Date.now()}_${i}`,
        text,
        category: 'experience' as const,
      })),
      ...template.keywords.staff.map((text, i) => ({
        id: `tpl_staff_${Date.now()}_${i}`,
        text,
        category: 'staff' as const,
      })),
    ];

    onUpdateKeywords(newKeywords);
    setShowTemplateConfirm(false);
  };

  const experienceKeywords = keywords.filter((k) => k.category === 'experience');
  const productKeywords = keywords.filter((k) => k.category === 'product' || k.category === 'general');
  const staffKeywords = keywords.filter((k) => k.category === 'staff');

  return (
    <div className="space-y-6" id="keyword-manager-section">
      {/* Header & Description */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              SEO & Prompt Keywords
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Custom Keyword & Highlight Prompts
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Configure the 1-tap keyword chips that customers see when writing their Google review.
          </p>
        </div>

        {/* Industry Template Quick Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {INDUSTRY_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowTemplateConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-xs active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Load Template
          </button>
        </div>
      </div>

      {/* Add New Keyword Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Add New Keyword or Dish / Service
        </h3>

        <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newKeywordText}
              onChange={(e) => setNewKeywordText(e.target.value)}
              placeholder="e.g. Signature Spanish Latte, Master Stylist Leo, Painless Cleaning..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={newKeywordCategory}
              onChange={(e) => setNewKeywordCategory(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="product">☕ Product / Offering</option>
              <option value="experience">✨ Vibe & Experience</option>
              <option value="staff">👥 Staff & Specialist</option>
            </select>

            <button
              type="submit"
              disabled={!newKeywordText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Keyword
            </button>
          </div>
        </form>
      </div>

      {/* Categorized Keyword Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products & Services */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                Products & Services
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {productKeywords.length}
              </span>
            </div>

            <div className="space-y-2">
              {productKeywords.map((k) => {
                const globalIndex = keywords.findIndex((item) => item.id === k.id);
                return (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 group hover:border-blue-300 transition-all"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {k.text}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMove(globalIndex, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(globalIndex, 'down')}
                        disabled={globalIndex === keywords.length - 1}
                        className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKeyword(k.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {productKeywords.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No products added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Experience & Atmosphere */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></span>
                Vibe & Atmosphere
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {experienceKeywords.length}
              </span>
            </div>

            <div className="space-y-2">
              {experienceKeywords.map((k) => {
                const globalIndex = keywords.findIndex((item) => item.id === k.id);
                return (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 group hover:border-emerald-300 transition-all"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {k.text}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMove(globalIndex, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(globalIndex, 'down')}
                        disabled={globalIndex === keywords.length - 1}
                        className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKeyword(k.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {experienceKeywords.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No vibe keywords added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff & Specialists */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
                Staff & Team Members
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                {staffKeywords.length}
              </span>
            </div>

            <div className="space-y-2">
              {staffKeywords.map((k) => {
                const globalIndex = keywords.findIndex((item) => item.id === k.id);
                return (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 group hover:border-red-300 transition-all"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {k.text}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMove(globalIndex, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(globalIndex, 'down')}
                        disabled={globalIndex === keywords.length - 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKeyword(k.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {staffKeywords.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No staff keywords added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Template overwrite */}
      {showTemplateConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Load Industry Template?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                This will load pre-configured high-converting review keywords for{' '}
                <span className="font-semibold text-blue-600">
                  {INDUSTRY_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}
                </span>.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate(selectedTemplateId)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm & Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
