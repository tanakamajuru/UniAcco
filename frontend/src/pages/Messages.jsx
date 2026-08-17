import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { useNavigation } from '../App';
import { threadApi } from '../services/api';

const AVATAR_BGS = [
  'linear-gradient(135deg,#F4C430,#E0A800)',
  'linear-gradient(135deg,#4DB6E2,#2F8FB8)',
  'linear-gradient(135deg,#34D399,#059669)',
];

export default function Messages() {
  const { navigate } = useNavigation();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('auth');
      return;
    }
    threadApi
      .list()
      .then((t) => {
        setThreads(t);
        if (t.length) setActiveId(t[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const loadMessages = useCallback((id) => {
    if (!id) return;
    threadApi.messages(id).then(setMessages).catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    // optimistic
    setMessages((m) => [...m, { id: `temp-${Date.now()}`, mine: true, body }]);
    setDraft('');
    try {
      await threadApi.send(activeId, body);
      loadMessages(activeId);
    } catch {
      loadMessages(activeId);
    } finally {
      setSending(false);
    }
  };

  const active = threads.find((t) => t.id === activeId);

  if (loading) {
    return (
      <div className="flex justify-center pt-40 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="ua-fade mx-auto max-w-[1080px] px-6 pb-10 pt-[96px]">
      <h1 className="font-display mb-[18px] text-[25px] font-extrabold text-text-primary">Messages</h1>

      {threads.length === 0 ? (
        <div className="rounded-[20px] border border-border bg-bg-surface px-6 py-16 text-center">
          <p className="mb-1 font-bold text-text-primary">No conversations yet</p>
          <p className="mb-4 text-sm text-text-secondary">
            Message a host from a listing, or apply to one to start chatting.
          </p>
          <button
            onClick={() => navigate('listings')}
            className="rounded-xl bg-brand-primaryDark px-5 py-2.5 text-sm font-bold text-white"
          >
            Browse homes
          </button>
        </div>
      ) : (
        <div className="grid h-[75vh] grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-[20px] border border-border bg-bg-surface shadow-sm md:h-[560px] md:grid-cols-[300px_1fr] md:grid-rows-1">
          {/* thread list */}
          <div className="max-h-[28vh] overflow-y-auto border-b border-border md:max-h-none md:border-b-0 md:border-r">
            {threads.map((t, i) => (
              <div
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`flex cursor-pointer gap-3 border-b border-border px-4 py-3.5 transition-colors ${
                  t.id === activeId ? 'bg-[#EAF6FB]' : 'bg-transparent hover:bg-bg-surface-alt'
                }`}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: AVATAR_BGS[i % AVATAR_BGS.length] }}
                >
                  {t.counterpart.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="truncate text-sm font-bold text-text-primary">
                      {t.counterpart.name}
                    </span>
                    <span className="text-[11px] text-text-muted">{t.time}</span>
                  </div>
                  <div className="truncate text-[12.5px] text-text-secondary">
                    {t.lastMessage || (t.accommodation ? t.accommodation.title : 'New conversation')}
                  </div>
                </div>
                {t.unread > 0 && (
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-primaryDark" />
                )}
              </div>
            ))}
          </div>

          {/* chat */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-extrabold text-[#4A3A00]"
                style={{ background: 'linear-gradient(135deg,#F4C430,#E0A800)' }}
              >
                {active?.counterpart.initials}
              </div>
              <div>
                <div className="text-[15px] font-bold text-text-primary">{active?.counterpart.name}</div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                  {active?.counterpart.verified && <Check className="h-3 w-3" />}
                  {active?.accommodation?.title || 'UniAcco'}
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto bg-bg-page px-5 py-5"
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[74%] px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      m.mine
                        ? 'rounded-[15px] rounded-br-[4px] bg-brand-primaryDark text-white'
                        : 'rounded-[15px] rounded-bl-[4px] border border-border bg-bg-surface text-text-primary'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 border-t border-border px-4 py-3.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Write a message..."
                className="flex-1 rounded-xl border border-input-border bg-bg-surface px-3.5 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
              />
              <button
                onClick={send}
                disabled={sending}
                className="flex items-center gap-1.5 rounded-xl bg-brand-primaryDark px-5 text-sm font-bold text-white disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
