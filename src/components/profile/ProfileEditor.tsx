'use client';

import { useState } from 'react';
import { X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import AvatarUploader from '@/components/ui/AvatarUploader';
import { updateProfileAction } from '@/app/actions/profile';

export default function ProfileEditor({ user, profile, onClose }: any) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await updateProfileAction(formData);
      onClose(); // Close on success
    } catch (e) {
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form action={handleSubmit} className="space-y-8">
            <input type="hidden" name="id" value={user.id} />
            
            {/* Identity */}
            <section className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Identity</h3>
               <div className="flex flex-col sm:flex-row gap-6">
                 <div className="shrink-0 flex flex-col items-center gap-2">
                    <AvatarUploader uid={user.id} defaultUrl={profile.avatar_url} name="avatar_url_hidden" />
                    <span className="text-[10px] text-neutral-400">Tap to change</span>
                 </div>
                 <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Full Name</label>
                        <input name="full_name" defaultValue={user.full_name} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Headline</label>
                        <input name="headline" defaultValue={profile.headline} placeholder="e.g. Creator & Developer" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white" />
                    </div>
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Bio</label>
                  <textarea name="bio" rows={4} defaultValue={profile.bio} placeholder="Tell your story..." className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-neutral-900 dark:text-white" />
               </div>
            </section>

            {/* Socials */}
            <section className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
               <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Links</h3>
               <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-medium mb-1 text-neutral-500">Website</label>
                      <input name="social_website" defaultValue={profile.socials?.website} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                      <label className="block text-xs font-medium mb-1 text-neutral-500">Twitter / X</label>
                      <input name="social_twitter" defaultValue={profile.socials?.twitter} placeholder="https://x.com/..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                      <label className="block text-xs font-medium mb-1 text-neutral-500">GitHub</label>
                      <input name="social_github" defaultValue={profile.socials?.github} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                      <label className="block text-xs font-medium mb-1 text-neutral-500">LinkedIn</label>
                      <input name="social_linkedin" defaultValue={profile.socials?.linkedin} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white" />
                  </div>
               </div>
            </section>

            {/* Visibility */}
            <section className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Settings</h3>
                  <select name="visibility" defaultValue={profile.visibility || 'public'} className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white">
                      <option value="public">Public Profile</option>
                      <option value="private">Private</option>
                  </select>
               </div>
            </section>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
