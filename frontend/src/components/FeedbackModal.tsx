import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { api } from '../services/api';

interface FeedbackModalProps {
  incidentId: string;
  onFeedbackSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  incidentId,
  onFeedbackSubmitted,
}) => {
  const [feedbackType, setFeedbackType] = useState<'confirmed_threat' | 'false_positive'>('confirmed_threat');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitFeedback(incidentId, feedbackType, comment);
      setSuccessMsg('Feedback stored and recurring attack pattern updated.');
      onFeedbackSubmitted();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Feedback error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyber-800">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white tracking-tight">
          SOC Analyst Feedback & Continuous Learning
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Feedback refines historical confidence scores and updates recurring pattern detection algorithms.
      </p>

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Verdict Radio Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFeedbackType('confirmed_threat')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
              feedbackType === 'confirmed_threat'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-900/20'
                : 'bg-cyber-900 border-cyber-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Confirmed Threat</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedbackType('false_positive')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
              feedbackType === 'false_positive'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/20'
                : 'bg-cyber-900 border-cyber-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>False Positive</span>
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Analyst Notes / Rationale
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="e.g., Validated external IP origin and confirmed PowerShell beacon payload..."
            className="w-full bg-cyber-950 border border-cyber-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/70"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Recording Feedback...' : 'Submit Incident Verdict'}</span>
        </button>
      </form>
    </div>
  );
};
