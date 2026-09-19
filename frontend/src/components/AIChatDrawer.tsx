import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Sparkles, Shield, User, CornerDownLeft,
  HelpCircle, CheckCircle2, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { AIResponse } from '../types';

interface AIChatDrawerProps {
  incidentId: string;
  initialSummary?: string;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  evidence?: string[];
  suggestedFollowUps?: string[];
  modelUsed?: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  incidentId,
  initialSummary,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What happened?',
    'Why is this suspicious?',
    'Which devices are affected?',
    'What happened after the login?',
    'What actions are recommended?',
    'Is this likely one incident or multiple?'
  ];

  // Initialize with incident explanation or history
  useEffect(() => {
    const initChat = async () => {
      try {
        const history = await api.getInvestigationHistory(incidentId);
        if (history && history.length > 0) {
          const loadedMsgs: Message[] = [];
          history.forEach((h: any) => {
            loadedMsgs.push({
              sender: 'user',
              text: h.question,
              timestamp: h.timestamp,
            });
            loadedMsgs.push({
              sender: 'ai',
              text: h.answer,
              timestamp: h.timestamp,
              evidence: h.evidence_referenced,
            });
          });
          setMessages(loadedMsgs);
        } else if (initialSummary) {
          setMessages([
            {
              sender: 'ai',
              text: initialSummary,
              timestamp: new Date().toISOString(),
              suggestedFollowUps: ['Why is this suspicious?', 'Which devices are affected?', 'What actions are recommended?'],
              modelUsed: 'deterministic-evidence-reasoning'
            }
          ]);
        }
      } catch (err) {
        if (initialSummary) {
          setMessages([
            {
              sender: 'ai',
              text: initialSummary,
              timestamp: new Date().toISOString(),
              suggestedFollowUps: ['What happened?', 'What actions are recommended?']
            }
          ]);
        }
      }
    };
    initChat();
  }, [incidentId, initialSummary]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const question = (queryText || inputQuery).trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const resp: AIResponse = await api.investigateAI(incidentId, question);
      const aiMsg: Message = {
        sender: 'ai',
        text: resp.answer,
        timestamp: resp.timestamp,
        evidence: resp.evidence_referenced,
        suggestedFollowUps: resp.suggested_follow_ups,
        modelUsed: resp.model_used,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Investigation error: ${err.message || 'Unable to query AI engine.'}`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[650px] border border-cyber-800 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-800 bg-cyber-900/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                AI Security Investigator
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Evidence-grounded reasoning over incident telemetry</p>
          </div>
        </div>
      </div>

      {/* Suggested Question Chips */}
      <div className="px-4 py-2 bg-cyber-950/70 border-b border-cyber-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 text-[10px] font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Suggestions:
        </span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-cyber-850 hover:bg-cyber-800 text-slate-300 hover:text-cyan-300 border border-cyber-700/60 whitespace-nowrap transition-all active:scale-95"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Bot className="w-12 h-12 text-cyan-500/40 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">AI Security Investigator Ready</h4>
            <p className="text-xs max-w-sm text-slate-400 mb-4">
              Ask questions about the incident timeline, affected devices, attack sequence, or containment actions.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.slice(0, 3).map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sq)}
                  className="px-3 py-1.5 rounded-lg bg-cyber-900 border border-cyan-500/30 text-cyan-300 text-xs hover:bg-cyan-500/10"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 text-slate-100'
                    : 'bg-cyber-900/90 border border-cyber-700/80 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Referenced Evidence Chips */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-400">Cited Evidence:</span>
                    {msg.evidence.map((evId) => (
                      <span
                        key={evId}
                        className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]"
                      >
                        {evId}
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow-up Question Suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400">Suggested Next Inquiries:</span>
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestedFollowUps.map((fu, fidx) => (
                        <button
                          key={fidx}
                          onClick={() => handleSend(fu)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyber-800 hover:bg-cyber-750 text-cyan-300 border border-cyber-700 text-[10px] transition-all"
                        >
                          <ChevronRight className="w-2.5 h-2.5" />
                          <span>{fu}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.modelUsed && (
                  <div className="mt-1 text-[9px] text-slate-500 font-mono text-right">
                    Engine: {msg.modelUsed}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-cyber-800 border border-cyber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3 rounded-xl bg-cyber-900 border border-cyber-700 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Analyzing incident evidence and telemetry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-cyber-800 bg-cyber-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask the AI investigator about this incident..."
            disabled={isLoading}
            className="flex-1 bg-cyber-950 border border-cyber-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/70"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
