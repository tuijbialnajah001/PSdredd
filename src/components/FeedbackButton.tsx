import { Bug, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    
    const email = 'bjeclanofficial@gmail.com';
    const subject = encodeURIComponent('Pokemon Collection App Feedback / Bug Report');
    const body = encodeURIComponent(feedback);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    setIsOpen(false);
    setFeedback('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 md:top-8 md:right-8 z-50 p-3 bg-[#1a1a1a] border border-white/10 rounded-full shadow-xl hover:bg-white/10 transition-colors group cursor-pointer"
        title="Report Bug / Request Feature"
      >
        <Bug className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-['Righteous'] tracking-widest text-xl text-white">
                  FEED<span className="text-[var(--gold)]">BACK</span>
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-[var(--muted)] hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 md:p-6">
                <p className="text-sm text-[var(--muted)] mb-5">
                  Found a bug or have an idea to improve the app? Let us know!
                </p>
                
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe your problem or what you want to increment..."
                  className="w-full h-32 md:h-40 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/50 resize-none transition-all"
                  autoFocus
                />
              </div>

              <div className="p-5 md:p-6 pt-0 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!feedback.trim()}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider bg-[var(--gold)] text-black hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  CONFIRM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
