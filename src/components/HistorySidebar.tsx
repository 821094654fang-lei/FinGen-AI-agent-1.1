import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, MessageSquare, Plus, Trash2, ChevronRight } from 'lucide-react';
import { ChatSession, GenerationRecord } from '../types';
import { cn } from '../lib/utils';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onViewRecord: (record: GenerationRecord) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onViewRecord
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-96 bg-grok-bg border-l border-grok-border h-full flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-grok-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tighter">历史记录</h2>
                <p className="text-[10px] text-grok-muted uppercase tracking-widest">Generation History</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-grok-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              <button 
                onClick={() => {
                  onNewSession();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-grok-border rounded-xl text-grok-muted hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
              >
                <Plus size={18} />
                <span className="font-medium text-sm">开启新对话</span>
              </button>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-grok-muted px-2">最近对话</h3>
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    className={cn(
                      "group relative p-3 rounded-xl transition-all cursor-pointer border border-transparent",
                      currentSessionId === session.id ? "bg-white/5 border-grok-border text-white" : "hover:bg-white/5 text-grok-muted"
                    )}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        currentSessionId === session.id ? "bg-white text-black" : "bg-grok-border"
                      )}>
                        <MessageSquare size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-[10px] opacity-40">
                          {new Date(session.createdAt).toLocaleDateString()} · {session.records.length} 条记录
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Mini Gallery for session */}
                    {session.records.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-1">
                        {session.records.slice(0, 4).map((record) => (
                          <div 
                            key={record.id}
                            className="aspect-square rounded-md overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewRecord(record);
                            }}
                          >
                            <img src={record.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
