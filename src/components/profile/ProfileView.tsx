'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Github, Twitter, Instagram, Youtube, Linkedin, Facebook, Globe, Music2, 
  MapPin, Calendar, Layers, CreditCard, ExternalLink, Mail, Edit, ArrowRight
} from 'lucide-react';
import ProfileEditor from './ProfileEditor';

type Socials = Record<string, string>;

interface ProfileViewProps {
  user: { id: string; full_name: string };
  profile: {
    headline?: string;
    bio?: string;
    avatar_url?: string;
    socials?: Socials;
    created_at?: string;
    visibility?: string;
  };
  isOwner: boolean;
  viewOnly: boolean;
  isClient: boolean;
  posts: any[];
  clientProjects: any[];
  clientInvoices: any[];
}

function formatRole(role: string | null) {
  if (!role) return ''
  if (role === 'admin' || role === 'owner') return 'Administrator'
  if (role === 'head_of_marketing' || role === 'head of marketing') return 'Head of Marketing'
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

const SocialIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  if (p === 'github') return <Github className="size-5" />;
  if (p === 'twitter' || p === 'x') return <Twitter className="size-5" />;
  if (p === 'linkedin') return <Linkedin className="size-5" />;
  if (p === 'instagram') return <Instagram className="size-5" />;
  if (p === 'youtube') return <Youtube className="size-5" />;
  return <Globe className="size-5" />;
};

export default function ProfileView({ 
  user, profile, isOwner, viewOnly, isClient, posts, clientProjects, clientInvoices 
}: ProfileViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('mode') === 'edit';
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleCloseEdit = () => {
    // Remove query param
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mode');
    router.replace(`?${params.toString()}`);
  };

  return (
    <>
      <AnimatePresence>
        {isEditing && isOwner && (
          <ProfileEditor 
            user={user} 
            profile={profile} 
            onClose={handleCloseEdit} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-4 md:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. HERO CARD (2x2) */}
          <motion.div variants={item} className="md:col-span-2 md:row-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group flex flex-col transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {isOwner && !viewOnly && (
                <Link href="?mode=edit" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors inline-block" title="Edit Profile">
                  <Edit className="size-4" />
                </Link>
              )}
            </div>
            
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-xl bg-neutral-100 dark:bg-neutral-800 shrink-0">
                <img 
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} 
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
                    {user.full_name}
                  </h1>
                  {(user as any).role && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                      {formatRole((user as any).role)}
                    </span>
                  )}
                </div>
                {profile.headline && (
                  <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-tight">
                    {profile.headline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1">
              {profile.bio ? (
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-neutral-400 italic">No bio available.</p>
              )}
            </div>

            {/* Socials Row inside Hero */}
            {profile.socials && Object.keys(profile.socials).length > 0 && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                {Object.entries(profile.socials).map(([platform, url]) => (
                  <a 
                    key={platform} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <SocialIcon platform={platform} />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

        {/* 2. STATS / INFO (1x1 or 1x2 depending on content) */}
        <motion.div variants={item} className="md:col-span-1 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-center gap-4">
           {isClient ? (
             <div className="text-center">
               <span className="text-4xl font-black text-blue-600 dark:text-blue-400 block">{clientProjects.length}</span>
               <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Active Projects</span>
             </div>
           ) : (
             <div className="text-center">
               <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 block">{posts.length}</span>
               <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Published Posts</span>
             </div>
           )}
        </motion.div>

        {/* 3. CONTEXTUAL CARD (Map or Contact) */}
        <motion.div variants={item} className="md:col-span-1 bg-blue-600 text-white rounded-3xl p-6 shadow-lg shadow-blue-500/20 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
           <div>
             <Mail className="size-8 mb-4 opacity-80" />
             <h3 className="font-bold text-lg mb-1">Get in Touch</h3>
             <p className="text-blue-100 text-sm">Send a message or inquiry.</p>
           </div>
           <Link href="/contact" className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-xl font-bold text-sm text-center hover:bg-blue-50 transition-colors">
             Contact Me
           </Link>
        </motion.div>

        {/* 4. MAIN CONTENT AREA (Span varies) */}
        
        {isClient ? (
          <>
            {/* PROJECTS LIST */}
            <motion.div variants={item} className="md:col-span-2 md:row-span-2 lg:col-span-3 bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                   <Layers className="size-5 text-blue-500" /> Projects
                 </h2>
                 {isOwner && <Link href="/start-now" className="text-sm font-bold text-blue-600 hover:underline">New Project</Link>}
               </div>
               
               {clientProjects.length > 0 ? (
                 <div className="grid gap-4">
                   {clientProjects.map((p: any) => (
                     <Link key={p.id} href={isOwner ? `/portal/projects/${p.slug}` : '#'} className="group flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.title}</h3>
                          <p className="text-sm text-neutral-500 line-clamp-1">{p.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono uppercase bg-white dark:bg-neutral-900 px-2 py-1 rounded text-neutral-500 border border-neutral-200 dark:border-neutral-700">{p.status?.replace('_', ' ')}</span>
                          <ArrowRight className="size-4 text-neutral-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                     </Link>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 text-neutral-500">No active projects.</div>
               )}
            </motion.div>

            {/* BILLING (Owner Only) */}
            {(isOwner || clientInvoices.length > 0) && (
              <motion.div variants={item} className="md:col-span-1 md:row-span-2 bg-neutral-900 text-white rounded-3xl p-6 shadow-xl flex flex-col">
                 <div className="flex items-center gap-2 mb-6 text-neutral-400">
                   <CreditCard className="size-5" />
                   <span className="text-sm font-bold uppercase tracking-wider">Invoices</span>
                 </div>
                 
                 <div className="flex-1 space-y-4">
                   {clientInvoices.length > 0 ? clientInvoices.map((inv: any) => (
                     <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <div className="text-xs text-neutral-400 font-mono">{inv.number}</div>
                          <div className={`text-[10px] font-bold uppercase mt-1 ${inv.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{inv.status}</div>
                        </div>
                        <div className="font-bold">
                          {(inv.amount_cents / 100).toLocaleString('en-US', { style: 'currency', currency: inv.currency })}
                        </div>
                     </div>
                   )) : (
                     <div className="text-sm text-neutral-500 text-center py-8">No invoices found.</div>
                   )}
                 </div>
              </motion.div>
            )}
          </>
        ) : (
          /* BLOG POSTS FOR CREATORS */
          <>
            {/* Featured Post (Span 2) */}
            {posts[0] && (
              <motion.div variants={item} className="md:col-span-2 min-h-[300px] relative rounded-3xl overflow-hidden group">
                 <img src={posts[0].cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold mb-3">Featured</span>
                    <h3 className="text-2xl font-bold text-white mb-2">{posts[0].title}</h3>
                    <p className="text-white/80 line-clamp-2 mb-4">{posts[0].excerpt}</p>
                    <Link href={`/blog/${posts[0].slug}`} className="inline-flex items-center gap-2 text-white font-semibold hover:underline">
                      Read Article <ArrowRight className="size-4" />
                    </Link>
                 </div>
              </motion.div>
            )}

            {/* Recent Posts List */}
            <motion.div variants={item} className="md:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800">
               <h2 className="text-xl font-bold mb-6">Recent Articles</h2>
               <div className="space-y-6">
                 {posts.slice(1, 4).map((p: any) => (
                   <div key={p.slug} className="group">
                     <Link href={`/blog/${p.slug}`}>
                       <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.title}</h3>
                       <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{p.excerpt}</p>
                       <div className="text-xs text-neutral-400 mt-2">{new Date(p.published_at).toLocaleDateString()}</div>
                     </Link>
                   </div>
                 ))}
                 {posts.length <= 1 && <div className="text-neutral-500 text-sm">No more posts.</div>}
               </div>
            </motion.div>
          </>
        )}

      </div>
    </motion.div>
    </>
  );
}