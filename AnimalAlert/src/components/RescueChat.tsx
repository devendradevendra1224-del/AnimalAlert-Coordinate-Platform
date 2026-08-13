import React, { useState, useEffect } from 'react';
import { RescueMessage, UserProfile } from '../types';
import { fetchRescueMessages, sendRescueMessage } from '../services/rescueService';
import { submitAbuseReport } from '../services/adminService';
import { MessageSquare, Send, ShieldAlert, Flag, CheckCircle2 } from 'lucide-react';

interface RescueChatProps {
  caseId: string;
  currentUser: UserProfile;
}

export const RescueChat: React.FC<RescueChatProps> = ({ caseId, currentUser }) => {
  const [messages, setMessages] = useState<RescueMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [flaggedId, setFlaggedId] = useState<string | null>(null);

  useEffect(() => {
    loadChat();
  }, [caseId]);

  const loadChat = async () => {
    setLoading(true);
    const msgs = await fetchRescueMessages(caseId);
    setMessages(msgs);
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = await sendRescueMessage({
      rescue_case_id: caseId,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      message: inputText.trim(),
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleFlagMessage = async (msg: RescueMessage) => {
    await submitAbuseReport({
      reported_by: currentUser.id,
      reported_by_name: currentUser.full_name,
      rescue_case_id: caseId,
      report_type: 'inappropriate_content',
      description: `Inappropriate message content: "${msg.message}" by ${msg.sender_name}`,
    });
    setFlaggedId(msg.id);
    setTimeout(() => setFlaggedId(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-96">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-800">
            Case Rescuer Communications
          </h4>
        </div>
        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono font-bold px-2 py-0.5 rounded">
          Authorized Team Only
        </span>
      </div>

      {/* MESSAGES FEED */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-slate-400 my-auto">No messages yet. Start conversation with responders.</p>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUser.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 mb-0.5">
                  <span className="font-bold text-slate-700">{m.sender_name}</span>
                  <span>({m.sender_role})</span>
                  <span>• {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="group relative max-w-[80%]">
                  <div
                    className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {m.message}
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => handleFlagMessage(m)}
                      title="Report Inappropriate Message"
                      className="opacity-0 group-hover:opacity-100 absolute -right-6 top-2 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {flaggedId === m.id && (
                  <span className="text-[10px] text-rose-600 font-bold mt-1">
                    Reported to Admin Moderation
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* INPUT BAR */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center space-x-2 bg-slate-50 rounded-b-2xl">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type update message..."
          className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
