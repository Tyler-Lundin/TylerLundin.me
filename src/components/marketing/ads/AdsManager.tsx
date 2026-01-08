'use client';

import { useState } from 'react';
import { Advertisement } from '@/types/marketing';
import { Plus, Pencil, Trash2, X, Save, Megaphone, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { createAdAction, updateAdAction, deleteAdAction } from '@/app/actions/marketing-admin';
import { generateAdContentAction } from '@/app/actions/marketing-ai';

export default function AdsManager({ initialAds }: { initialAds: Advertisement[] }) {
  const [ads, setAds] = useState(initialAds);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState<Partial<Advertisement>>({});

  const handleCreate = () => {
    setCurrentAd({
        placement: 'top_banner',
        is_active: true,
        priority: 0,
        cta_text: 'Get Offer',
        cta_link: '/contact',
        styles: { bg_color: '#1e40af', text_color: '#ffffff' }
    });
    setIsEditing(true);
  };

  const handleEdit = (ad: Advertisement) => {
    setCurrentAd(ad);
    setIsEditing(true);
  };

  const handleSave = async (data: Partial<Advertisement>) => {
    try {
      if (data.id) {
        await updateAdAction(data.id, data);
        setAds(prev => prev.map(a => a.id === data.id ? { ...a, ...data } as Advertisement : a));
      } else {
        await createAdAction(data);
        // Optimistic or refresh? RevalidatePath should handle it on next visit, 
        // but for immediate feedback we might need router.refresh() 
        // For now let's just close. Ideally we refetch or use router.refresh().
        window.location.reload(); 
      }
      setIsEditing(false);
    } catch (e) {
      alert('Failed to save ad: ' + e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteAdAction(id);
      setAds(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Failed to delete ad');
    }
  };

  if (isEditing) {
    return <AdForm ad={currentAd} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
            <Megaphone className="size-5" /> Advertisements
        </h2>
        <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
            <Plus className="size-4" /> New Ad
        </button>
      </div>

      <div className="grid gap-4">
        {ads.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500">
                No advertisements found. Create one to get started.
            </div>
        ) : (
            ads.map(ad => (
                <div key={ad.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${ad.is_active ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'}`}>
                            {ad.is_active ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">{ad.title}</h3>
                            <div className="text-xs text-neutral-500 flex gap-2 mt-1">
                                <span className="uppercase tracking-wider font-semibold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{ad.placement}</span>
                                {ad.promo_code && <span className="text-blue-500">PROMO: {ad.promo_code}</span>}
                                {ad.description && <span className="truncate max-w-[200px] opacity-70">{ad.description}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(ad)} className="p-2 text-neutral-400 hover:text-blue-500 transition-colors">
                            <Pencil className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(ad.id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

function AdForm({ ad, onSave, onCancel }: { ad: Partial<Advertisement>, onSave: (data: Partial<Advertisement>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(ad);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateAdContentAction(aiPrompt);
      setFormData(prev => ({ ...prev, ...generated }));
    } catch (e: any) {
      alert('AI Generation Failed: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (field: keyof Advertisement, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStyleChange = (key: string, value: string) => {
    setFormData(prev => ({ 
        ...prev, 
        styles: { ...(prev.styles || {}), [key]: value } 
    }));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{ad.id ? 'Edit Ad' : 'New Ad'}</h3>
            <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><X className="size-5" /></button>
        </div>

        {/* AI Assistant */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300 text-sm font-bold">
                <Sparkles className="size-4" />
                AI Assistant
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                    placeholder="Describe your ad (e.g. 'Summer sale banner for shoes with 20% off code SUMMER20')"
                    className="flex-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {isGenerating ? <Loader2 className="size-4 animate-spin" /> : 'Generate'}
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Title</label>
                    <input 
                        type="text" 
                        value={formData.title || ''} 
                        onChange={e => handleChange('title', e.target.value)}
                        className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Placement</label>
                    <select 
                        value={formData.placement || 'top_banner'} 
                        onChange={e => handleChange('placement', e.target.value)}
                        className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    >
                        <option value="top_banner">Top Banner</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="toast">Toast</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                <textarea 
                    value={formData.description || ''} 
                    onChange={e => handleChange('description', e.target.value)}
                    className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">CTA Text</label>
                    <input 
                        type="text" 
                        value={formData.cta_text || ''} 
                        onChange={e => handleChange('cta_text', e.target.value)}
                        className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Link</label>
                    <input 
                        type="text" 
                        value={formData.cta_link || ''} 
                        onChange={e => handleChange('cta_link', e.target.value)}
                        className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Promo Code</label>
                    <input 
                        type="text" 
                        value={formData.promo_code || ''} 
                        onChange={e => handleChange('promo_code', e.target.value)}
                        placeholder="e.g. FREE_WEB"
                        className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Priority</label>
                    <input 
                        type="number" 
                        value={formData.priority || 0} 
                        onChange={e => handleChange('priority', parseInt(e.target.value))}
                        className="w-full p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Background Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={formData.styles?.bg_color || '#1e40af'} 
                            onChange={e => handleStyleChange('bg_color', e.target.value)}
                            className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                        />
                        <input 
                            type="text" 
                            value={formData.styles?.bg_color || '#1e40af'} 
                            onChange={e => handleStyleChange('bg_color', e.target.value)}
                            className="flex-1 p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs font-mono text-neutral-900 dark:text-white"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Text Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={formData.styles?.text_color || '#ffffff'} 
                            onChange={e => handleStyleChange('text_color', e.target.value)}
                            className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                        />
                        <input 
                            type="text" 
                            value={formData.styles?.text_color || '#ffffff'} 
                            onChange={e => handleStyleChange('text_color', e.target.value)}
                            className="flex-1 p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs font-mono text-neutral-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
                <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.is_active ?? true} 
                    onChange={e => handleChange('is_active', e.target.checked)}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-neutral-900 dark:text-white">Active</label>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center gap-2">
                <Save className="size-4" /> Save Ad
            </button>
        </div>
    </div>
  );
}
