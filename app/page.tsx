"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: number;
  confidential: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: number;
  unread: number;
  online: boolean;
  confidentialMode: boolean;
  messages: Message[];
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Alex Rivera",
    avatar: "AR",
    lastMessage: "Can you send the contract details?",
    timestamp: Date.now() - 1000 * 60 * 3,
    unread: 2,
    online: true,
    confidentialMode: false,
    messages: [
      { id: "m1", text: "Hey! Are you free to discuss the project?", sender: "them", timestamp: Date.now() - 1000 * 60 * 20, confidential: false },
      { id: "m2", text: "Sure, what do you need?", sender: "me", timestamp: Date.now() - 1000 * 60 * 18, confidential: false },
      { id: "m3", text: "Can you send the contract details?", sender: "them", timestamp: Date.now() - 1000 * 60 * 3, confidential: false },
    ],
  },
  {
    id: "c2",
    name: "Jordan Chen",
    avatar: "JC",
    lastMessage: "🔒 Confidential message",
    timestamp: Date.now() - 1000 * 60 * 30,
    unread: 0,
    online: true,
    confidentialMode: true,
    messages: [
      { id: "m4", text: "I need to discuss something sensitive with you.", sender: "them", timestamp: Date.now() - 1000 * 60 * 60, confidential: true },
      { id: "m5", text: "Of course, I've enabled confidential mode.", sender: "me", timestamp: Date.now() - 1000 * 60 * 55, confidential: true },
      { id: "m6", text: "The merger details are being finalized this week.", sender: "them", timestamp: Date.now() - 1000 * 60 * 30, confidential: true },
    ],
  },
  {
    id: "c3",
    name: "Sam Patel",
    avatar: "SP",
    lastMessage: "Let's catch up soon!",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    unread: 1,
    online: false,
    confidentialMode: false,
    messages: [
      { id: "m7", text: "How did the meeting go?", sender: "them", timestamp: Date.now() - 1000 * 60 * 60 * 3, confidential: false },
      { id: "m8", text: "Really well! Lots of good progress.", sender: "me", timestamp: Date.now() - 1000 * 60 * 60 * 2.5, confidential: false },
      { id: "m9", text: "Let's catch up soon!", sender: "them", timestamp: Date.now() - 1000 * 60 * 60 * 2, confidential: false },
    ],
  },
  {
    id: "c4",
    name: "Taylor Morgan",
    avatar: "TM",
    lastMessage: "Deal confirmed ✓",
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    unread: 0,
    online: false,
    confidentialMode: false,
    messages: [
      { id: "m10", text: "Did you review the proposal?", sender: "me", timestamp: Date.now() - 1000 * 60 * 60 * 6, confidential: false },
      { id: "m11", text: "Yes, everything looks great!", sender: "them", timestamp: Date.now() - 1000 * 60 * 60 * 5.5, confidential: false },
      { id: "m12", text: "Deal confirmed ✓", sender: "them", timestamp: Date.now() - 1000 * 60 * 60 * 5, confidential: false },
    ],
  },
];

// ─── NDA Modal ────────────────────────────────────────────────────────────────

function NDAModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        background: "#12172b", border: "1px solid #2a3a5c",
        borderRadius: "16px", maxWidth: "560px", width: "100%",
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px 16px",
          borderBottom: "1px solid #1e2a42",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
          }}>🔒</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#f59e0b" }}>
              International Non-Disclosure Agreement
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Effective: {today}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
          <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "16px" }}>
            By enabling <strong style={{ color: "#e2e8f0" }}>Confidential Mode</strong>, you and the recipient
            mutually agree to the following binding terms under international law:
          </p>

          {[
            { title: "1. Obligation of Confidentiality", body: "All information exchanged in this conversation marked as confidential shall be kept strictly private. Neither party may disclose, reproduce, or distribute any such information to third parties without prior written consent." },
            { title: "2. Scope & Jurisdiction", body: "This agreement is governed by international trade secret law and applicable provisions of the UNCITRAL Model Law on Electronic Commerce. It is enforceable in any jurisdiction where either party resides or operates." },
            { title: "3. Permitted Use", body: "Confidential information shared herein may only be used for the purposes explicitly discussed within this conversation. Any use beyond this scope constitutes a material breach." },
            { title: "4. Duration", body: "Confidentiality obligations survive the termination of this conversation and remain in force for a period of five (5) years from the date of disclosure." },
            { title: "5. Remedies", body: "A breach of this agreement entitles the non-breaching party to seek injunctive relief and monetary damages including, but not limited to, lost profits and legal fees." },
            { title: "6. Acknowledgement", body: "By clicking 'I Agree & Enable Confidential Mode', both parties electronically sign and are bound by this NDA. This electronic signature is legally valid under the ESIGN Act and eIDAS Regulation." },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: "14px" }}>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "#cbd5e1", marginBottom: "4px" }}>
                {section.title}
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px 24px",
          borderTop: "1px solid #1e2a42",
          display: "flex", gap: "12px",
        }}>
          <button onClick={onDecline} style={{
            flex: 1, padding: "12px", borderRadius: "10px",
            border: "1px solid #2a3a5c", background: "transparent",
            color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: 600,
          }}>
            Decline
          </button>
          <button onClick={onAccept} style={{
            flex: 2, padding: "12px", borderRadius: "10px",
            border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0e1a", cursor: "pointer", fontSize: "13px", fontWeight: 700,
          }}>
            I Agree & Enable Confidential Mode
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number) {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 1000 * 60) return "just now";
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
  return new Date(ts).toLocaleDateString();
}

function formatMessageTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const avatarColors: Record<string, string> = {
  AR: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  JC: "linear-gradient(135deg, #10b981, #059669)",
  SP: "linear-gradient(135deg, #f59e0b, #d97706)",
  TM: "linear-gradient(135deg, #ef4444, #dc2626)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("c1");
  const [input, setInput] = useState("");
  const [showNDA, setShowNDA] = useState(false);
  const [pendingConfidential, setPendingConfidential] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId)!;

  // Track page visit
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
    }).catch(() => {});
  }, []);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("confi_conversations");
      if (saved) setConversations(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("confi_conversations", JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  // Mark as read when opening
  useEffect(() => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    );
  }, [activeId]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text,
      sender: "me",
      timestamp: Date.now(),
      confidential: active.confidentialMode,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: active.confidentialMode ? "🔒 Confidential message" : text, timestamp: Date.now() }
          : c
      )
    );
    setInput("");

    // Simulate reply
    setTimeout(() => {
      const replies = [
        "Got it, thanks!",
        "Understood. I'll look into that.",
        "Sounds good to me.",
        "Let me check and get back to you.",
        "Perfect, noted!",
      ];
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        text: active.confidentialMode ? "🔒 " + replies[Math.floor(Math.random() * replies.length)] : replies[Math.floor(Math.random() * replies.length)],
        sender: "them",
        timestamp: Date.now() + 1,
        confidential: active.confidentialMode,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, reply], lastMessage: c.confidentialMode ? "🔒 Confidential message" : reply.text, timestamp: Date.now() }
            : c
        )
      );
    }, 1200);
  }

  function handleConfidentialToggle() {
    if (!active.confidentialMode) {
      setPendingConfidential(true);
      setShowNDA(true);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, confidentialMode: false } : c))
      );
    }
  }

  function acceptNDA() {
    setShowNDA(false);
    setPendingConfidential(false);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, confidentialMode: true } : c))
    );
  }

  function declineNDA() {
    setShowNDA(false);
    setPendingConfidential(false);
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0e1a" }}>
      {showNDA && <NDAModal onAccept={acceptNDA} onDecline={declineNDA} />}

      {/* ── Sidebar ── */}
      <div style={{
        width: sidebarOpen ? "320px" : "0",
        minWidth: sidebarOpen ? "320px" : "0",
        transition: "all 0.3s ease",
        overflow: "hidden",
        borderRight: "1px solid #1e2a42",
        display: "flex",
        flexDirection: "column",
        background: "#0d1221",
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: "20px 16px 12px",
          borderBottom: "1px solid #1e2a42",
          background: "#0d1221",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
              }}>🔒</div>
              <span style={{ fontWeight: 700, fontSize: "18px", color: "#e2e8f0" }}>Confi</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{
                width: "32px", height: "32px", borderRadius: "8px",
                border: "none", background: "#1e2a42",
                color: "#64748b", cursor: "pointer", fontSize: "16px",
              }}>✏️</button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "#475569", fontSize: "14px",
            }}>🔍</span>
            <input
              placeholder="Search conversations…"
              style={{
                width: "100%", padding: "10px 12px 10px 36px",
                borderRadius: "10px", border: "1px solid #1e2a42",
                background: "#161d30", color: "#e2e8f0",
                fontSize: "13px", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {conversations
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", cursor: "pointer",
                  background: conv.id === activeId ? "#1e2a42" : "transparent",
                  borderLeft: conv.id === activeId ? "3px solid #3b82f6" : "3px solid transparent",
                  transition: "background 0.2s",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: avatarColors[conv.avatar] || "#2a3a5c",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "14px", color: "#fff",
                  }}>{conv.avatar}</div>
                  {conv.online && (
                    <div style={{
                      position: "absolute", bottom: "1px", right: "1px",
                      width: "12px", height: "12px", borderRadius: "50%",
                      background: "#22c55e", border: "2px solid #0d1221",
                    }} />
                  )}
                  {conv.confidentialMode && (
                    <div style={{
                      position: "absolute", top: "-2px", right: "-2px",
                      width: "16px", height: "16px", borderRadius: "50%",
                      background: "#f59e0b", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "8px",
                    }}>🔒</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>{conv.name}</span>
                    <span style={{ fontSize: "11px", color: "#475569" }}>{formatTime(conv.timestamp)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "12px", color: "#64748b",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: "160px",
                    }}>{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span style={{
                        minWidth: "20px", height: "20px", borderRadius: "10px",
                        background: "#3b82f6", color: "#fff",
                        fontSize: "11px", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "0 5px",
                      }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* User Footer */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #1e2a42",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "13px", color: "#fff",
          }}>ME</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>My Account</div>
            <div style={{ fontSize: "11px", color: "#22c55e" }}>● Online</div>
          </div>
          <button style={{
            width: "30px", height: "30px", borderRadius: "8px",
            border: "none", background: "#1e2a42",
            color: "#64748b", cursor: "pointer", fontSize: "14px",
          }}>⚙️</button>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1e2a42",
          background: "#0d1221",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              width: "36px", height: "36px", borderRadius: "8px",
              border: "none", background: "#1e2a42",
              color: "#94a3b8", cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div style={{ position: "relative" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              background: avatarColors[active.avatar] || "#2a3a5c",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "13px", color: "#fff",
            }}>{active.avatar}</div>
            {active.online && (
              <div style={{
                position: "absolute", bottom: "1px", right: "1px",
                width: "11px", height: "11px", borderRadius: "50%",
                background: "#22c55e", border: "2px solid #0d1221",
              }} />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#e2e8f0" }}>{active.name}</div>
            <div style={{ fontSize: "12px", color: active.online ? "#22c55e" : "#475569" }}>
              {active.online ? "● Online" : "● Last seen recently"}
            </div>
          </div>

          {/* Confidential Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>Confidential Mode</div>
              <div style={{ fontSize: "10px", color: active.confidentialMode ? "#f59e0b" : "#475569" }}>
                {active.confidentialMode ? "NDA Active 🔒" : "Off"}
              </div>
            </div>
            <button
              onClick={handleConfidentialToggle}
              style={{
                width: "52px", height: "28px", borderRadius: "14px",
                border: "none", cursor: "pointer",
                background: active.confidentialMode
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "#1e2a42",
                position: "relative", transition: "background 0.3s",
              }}
            >
              <div style={{
                position: "absolute", top: "3px",
                left: active.confidentialMode ? "27px" : "3px",
                width: "22px", height: "22px", borderRadius: "50%",
                background: "#fff", transition: "left 0.3s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px",
              }}>
                {active.confidentialMode ? "🔒" : "💬"}
              </div>
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            {["📞", "📹"].map((icon) => (
              <button key={icon} style={{
                width: "36px", height: "36px", borderRadius: "8px",
                border: "none", background: "#1e2a42",
                color: "#94a3b8", cursor: "pointer", fontSize: "16px",
              }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* Confidential Banner */}
        {active.confidentialMode && (
          <div style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))",
            borderBottom: "1px solid rgba(245,158,11,0.2)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ fontSize: "14px" }}>🔒</span>
            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 500 }}>
              This conversation is protected by an International NDA. All messages are confidential and legally binding.
            </span>
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px",
          display: "flex", flexDirection: "column", gap: "8px",
          background: active.confidentialMode
            ? "radial-gradient(ellipse at top, rgba(245,158,11,0.04) 0%, #0a0e1a 60%)"
            : "#0a0e1a",
        }}>
          {/* Date separator */}
          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <span style={{
              fontSize: "11px", color: "#475569",
              background: "#161d30", padding: "4px 12px",
              borderRadius: "20px", border: "1px solid #1e2a42",
            }}>Today</span>
          </div>

          {active.messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender === "me" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: msg.sender === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.sender === "me"
                  ? (msg.confidential
                    ? "linear-gradient(135deg, #92400e, #78350f)"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)")
                  : (msg.confidential ? "#1c1509" : "#161d30"),
                border: msg.confidential ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}>
                {msg.confidential && (
                  <div style={{ fontSize: "10px", color: "#f59e0b", marginBottom: "4px", fontWeight: 600 }}>
                    🔒 CONFIDENTIAL
                  </div>
                )}
                <div style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: 1.5 }}>{msg.text}</div>
                <div style={{
                  fontSize: "10px", color: "#64748b",
                  marginTop: "4px", textAlign: "right",
                  display: "flex", alignItems: "center", gap: "4px",
                  justifyContent: "flex-end",
                }}>
                  {formatMessageTime(msg.timestamp)}
                  {msg.sender === "me" && <span style={{ color: "#3b82f6" }}>✓✓</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #1e2a42",
          background: "#0d1221",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          {active.confidentialMode && (
            <div style={{
              padding: "6px 10px", borderRadius: "8px",
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
              fontSize: "11px", color: "#f59e0b", fontWeight: 600, whiteSpace: "nowrap",
            }}>🔒 NDA</div>
          )}

          <button style={{
            width: "40px", height: "40px", borderRadius: "10px",
            border: "none", background: "#1e2a42",
            color: "#64748b", cursor: "pointer", fontSize: "18px", flexShrink: 0,
          }}>😊</button>

          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={active.confidentialMode ? "Send a confidential message…" : "Type a message…"}
              style={{
                width: "100%", padding: "12px 16px",
                borderRadius: "12px",
                border: active.confidentialMode
                  ? "1px solid rgba(245,158,11,0.4)"
                  : "1px solid #1e2a42",
                background: active.confidentialMode ? "rgba(245,158,11,0.05)" : "#161d30",
                color: "#e2e8f0", fontSize: "14px", outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <button style={{
            width: "40px", height: "40px", borderRadius: "10px",
            border: "none", background: "#1e2a42",
            color: "#64748b", cursor: "pointer", fontSize: "18px", flexShrink: 0,
          }}>📎</button>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: "44px", height: "44px", borderRadius: "50%",
              border: "none", cursor: input.trim() ? "pointer" : "default",
              background: input.trim()
                ? (active.confidentialMode
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #3b82f6, #2563eb)")
                : "#1e2a42",
              color: "#fff", fontSize: "18px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
              boxShadow: input.trim() ? "0 4px 12px rgba(59,130,246,0.4)" : "none",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}