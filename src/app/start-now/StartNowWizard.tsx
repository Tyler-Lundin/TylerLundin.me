'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Building2, User, FileText, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Mail } from 'lucide-react';
import { startProjectAction } from '@/app/actions/start-now';
import Link from 'next/link';

type Props = {
  promoCode?: string;
};

type FormData = {
  companyName: string;
  companyWebsite: string;
  contactName: string;
  contactEmail: string;
  projectDescription: string;
  needLogo: boolean;
};

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'company', title: 'Company' },
  { id: 'contact', title: 'Contact' },
  { id: 'details', title: 'Details' },
  { id: 'success', title: 'Success' }
];

export default function StartNowWizard({ promoCode }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<FormData>({
    companyName: '',
    companyWebsite: '',
    contactName: '',
    contactEmail: '',
    projectDescription: '',
    needLogo: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepId = steps[currentStep].id;

  const getEmailProviderUrl = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain === 'gmail.com') return 'https://mail.google.com';
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return 'https://outlook.live.com';
    if (domain === 'yahoo.com') return 'https://mail.yahoo.com';
    if (domain === 'icloud.com') return 'https://www.icloud.com/mail';
    return null;
  };

  const emailUrl = getEmailProviderUrl(data.contactEmail);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('companyName', data.companyName);
    formData.append('companyWebsite', data.companyWebsite);
    formData.append('contactName', data.contactName);
    formData.append('contactEmail', data.contactEmail);
    formData.append('projectDescription', data.projectDescription + (data.needLogo ? '\n\n[User requested Logo Design]' : ''));
    if (promoCode) formData.append('promoCode', promoCode);

    try {
      const res = await startProjectAction(formData);
      if (res.success) {
        setCurrentStep(steps.length - 1); // Go to success
      } else {
        setError(res.message || 'Something went wrong.');
      }
    } catch (e) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="mb-10 relative">
          <div className="flex items-center justify-between relative z-10">
            {steps.filter(s => s.id !== 'success').map((s, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 ${
                    isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' : 
                    isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-400'
                  }`}>
                    {isDone ? <CheckCircle2 className="size-4" /> : i + 1}
                  </div>
                  <span className={`absolute top-10 text-[10px] font-medium whitespace-nowrap transition-colors duration-300 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 
                    isDone ? 'text-emerald-600 dark:text-emerald-400' : 
                    'text-neutral-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Track line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-0">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (currentStep / (steps.length - 2)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Welcome */}
            {stepId === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Rocket className="size-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">Let's Build Something Great</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Tell us about your project and we'll set up your dashboard instantly.
                  </p>
                </div>
                
                {promoCode && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Sparkles className="size-4" />
                    Promo Active: {promoCode}
                  </div>
                )}

                <div className="pt-4 flex justify-center">
                  <button 
                    onClick={handleNext}
                    className="w-full sm:w-auto px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    Start Now <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Company */}
            {stepId === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                  <Building2 className="size-6" />
                  <h3 className="text-xl font-bold">Company Info</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={data.companyName}
                      onChange={e => setData({...data, companyName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Acme Inc."
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Website (Optional)</label>
                    <input 
                      type="url" 
                      value={data.companyWebsite}
                      onChange={e => setData({...data, companyWebsite: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:border-blue-500 transition-colors group">
                      <div className={`size-5 rounded border flex items-center justify-center transition-colors ${data.needLogo ? 'bg-blue-600 border-blue-600 text-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
                        {data.needLogo && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={data.needLogo} 
                        onChange={e => setData({...data, needLogo: e.target.checked})}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                          <ImageIcon className="size-4 text-blue-500" />
                          I need a logo designed
                        </div>
                        <p className="text-xs text-neutral-500">We'll add branding services to your project.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={handleBack} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm font-medium px-4">Back</button>
                  <button 
                    onClick={handleNext}
                    disabled={!data.companyName}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact */}
            {stepId === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                  <User className="size-6" />
                  <h3 className="text-xl font-bold">Contact Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Your Name</label>
                    <input 
                      type="text" 
                      value={data.contactName}
                      onChange={e => setData({...data, contactName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Jane Doe"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={data.contactEmail}
                      onChange={e => setData({...data, contactEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="jane@acme.com"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={handleBack} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm font-medium px-4">Back</button>
                  <button 
                    onClick={handleNext}
                    disabled={!data.contactName || !data.contactEmail}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Details */}
            {stepId === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                  <FileText className="size-6" />
                  <h3 className="text-xl font-bold">Project Brief</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">What are we building?</label>
                  <textarea 
                    value={data.projectDescription}
                    onChange={e => setData({...data, projectDescription: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                    placeholder="Describe your goals, desired features, or inspiration..."
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button onClick={handleBack} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm font-medium px-4">Back</button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
                  >
                    {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Rocket className="size-5" />}
                    Launch Project
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {stepId === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="inline-flex p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
                  <Mail className="size-12" />
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">Check Your Email</h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-md mx-auto mb-8 leading-relaxed">
                  We've sent a magic login link to <strong>{data.contactEmail}</strong>. Click the link in your inbox to access your new project dashboard.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {emailUrl ? (
                    <a 
                      href={emailUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      Open Inbox <ArrowRight className="size-4" />
                    </a>
                  ) : (
                    <div className="text-sm font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-lg">
                      Check your inbox at {data.contactEmail}
                    </div>
                  )}
                  
                  <Link 
                    href="/" 
                    className="w-full sm:w-auto px-8 py-3 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>

                <p className="mt-8 text-xs text-neutral-400">
                  Didn't receive it? Check your spam folder or contact support.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
