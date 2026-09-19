import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, 
  Send, 
  Sparkles, 
  Shield, 
  User, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw,
  Terminal,
  Info,
  ShieldAlert
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
    'Why is this high risk?',
    'What evidence supports this?',
    'What happened first?',
    'What should we do next?',
    'What uncertainty remains?'
  ];

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
              suggestedFollowUps: ['Why is this high risk?', 'What evidence supports this?', 'What should we do next?'],
              modelUsed: 'evidence-grounded-agent'
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
          text: `Investigation service note: ${err.message || 'Evidence reasoning completed via deterministic fallback.'}`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="soc-panel rounded-lg flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-soc-border bg-soc-card">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-soc-blue" />
          <h3 className="text-xs font-semibold text-soc-text uppercase font-mono tracking-wide">
            AI Investigation Assistant
          </h3>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-soc-elevated border border-soc-border text-soc-success">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-success animate-status-pulse" />
          READY
        </span>
      </div>

      {/* Suggested Questions Bar */}
      <div className="px-3 py-2 bg-soc-bg border-b border-soc-border flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-soc-muted text-[10px] font-mono uppercase shrink-0">Prompts:</span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            disabled={isLoading}
            className="px-2 py-0.5 rounded bg-soc-card hover:bg-soc-elevated text-soc-secondary hover:text-soc-text border border-soc-border whitespace-nowrap text-[10px] font-mono transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-soc-muted">
            <Cpu className="w-8 h-8 text-soc-border mb-2" />
            <h4 className="text-xs font-semibold text-soc-text mb-1">Investigation Assistant Ready</h4>
            <p className="text-[11px] max-w-xs text-soc-secondary leading-relaxed">
              Query the evidence graph, assess attack hypotheses, and review containment options for incident <span className="font-mono text-soc-blue">{incidentId}</span>.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded bg-soc-card border border-soc-border flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 text-soc-blue" />
                </div>
              )}

              <div
                className={`max-w-[90%] rounded-md p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-soc-elevated border border-soc-blue/40 text-soc-text'
                    : 'bg-soc-card border border-soc-border text-soc-text'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Cited Evidence Chips */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-soc-border flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-soc-muted uppercase">Evidence:</span>
                    {msg.evidence.map((evId) => (
                      <span
                        key={evId}
                        className="px-1.5 py-0.2 rounded bg-soc-elevated text-soc-cyan border border-soc-border font-mono text-[10px]"
                      >
                        {evId}
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow-up Question Suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-soc-border flex flex-wrap gap-1">
                    {msg.suggestedFollowUps.map((fu, fidx) => (
                      <button
                        key={fidx}
                        onClick={() => handleSend(fu)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-soc-elevated hover:bg-soc-panel text-soc-blue border border-soc-border text-[10px] font-mono transition-colors"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                        <span>{fu}</span>
                      </button>
                    ))}
                  </div>
                )}

                {msg.modelUsed && (
                  <div className="mt-1 text-[9px] text-soc-muted font-mono text-right">
                    Engine: {msg.modelUsed}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded bg-soc-card border border-soc-border flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-soc-secondary" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-6 h-6 rounded bg-soc-card border border-soc-border flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5 text-soc-blue" />
            </div>
            <div className="p-2.5 rounded-md bg-soc-card border border-soc-border text-xs text-soc-secondary flex items-center gap-2 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin text-soc-blue" />
              <span>Analyzing incident evidence and telemetry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-soc-border bg-soc-card">
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
            placeholder="Ask about this incident..."
            disabled={isLoading}
            className="flex-1 bg-soc-panel border border-soc-border rounded-md px-3 py-1.5 text-xs text-soc-text placeholder-soc-muted focus:outline-none focus:border-soc-blue font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-1.5 rounded-md bg-soc-blue text-white hover:bg-soc-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
