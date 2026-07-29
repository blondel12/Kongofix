import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { loadSession } from "~/lib/session";
import { getMessages, sendMessage, type Message } from "~/server/messages";
import { getTechnicianRequests, type TechnicianRequest } from "~/server/technician";

export const Route = createFileRoute("/technicien/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — KongoFix" },
      { name: "description", content: "Échangez avec vos clients en direct via la messagerie KongoFix." },
      { property: "og:title", content: "Messages — KongoFix" },
      { property: "og:description", content: "Échangez avec vos clients en direct via la messagerie KongoFix." },
      { property: "og:image", content: "/logo.svg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Messages — KongoFix" },
      { name: "twitter:description", content: "Échangez avec vos clients en direct via la messagerie KongoFix." },
      { name: "twitter:image", content: "/logo.svg" },
    ],
  }),
  component: TechnicianMessagesPage,
});

function TechnicianMessagesPage() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [request, setRequest] = useState<TechnicianRequest | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current technician
  const session = loadSession();
  const techId = session?.userId || "";

  // Load request and messages
  const loadData = useCallback(async () => {
    if (!techId) return;
    try {
      // Fetch request info
      const reqResult = await getTechnicianRequests({ data: { technicianId: techId } });
      const req = reqResult.requests.find((r) => r.id === requestId);
      if (req) {
        setRequest(req);
      } else {
        setError("Demande introuvable.");
        setLoading(false);
        return;
      }

      // Fetch messages
      const msgResult = await getMessages({ data: { requestId } });
      setMessages(msgResult.messages);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [techId, requestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling every 5 seconds
  useEffect(() => {
    if (!techId) return;
    const interval = setInterval(async () => {
      try {
        const msgResult = await getMessages({ data: { requestId } });
        setMessages((prev) => {
          if (prev.length !== msgResult.messages.length) {
            return msgResult.messages;
          }
          const same = prev.every(
            (m, i) => m.id === msgResult.messages[i]?.id
          );
          return same ? prev : msgResult.messages;
        });
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [techId, requestId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect if not logged in
  useEffect(() => {
    if (!session || session.role !== "technicien") {
      navigate({ to: "/technicien/login" });
    }
  }, [session, navigate]);

  async function handleSend() {
    const content = newMsg.trim();
    if (!content || !techId) return;

    setSending(true);
    try {
      await sendMessage({
        data: {
          requestId,
          senderId: techId,
          senderRole: "technician",
          content,
        },
      });
      setNewMsg("");
      const msgResult = await getMessages({ data: { requestId } });
      setMessages(msgResult.messages);
      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.message || "Erreur d'envoi.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Hier";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  }

  if (!session) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate({ to: "/technicien" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au dashboard
        </Button>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
    accepted: { label: "Acceptée", color: "bg-green-100 text-green-800" },
    rejected: { label: "Refusée", color: "bg-red-100 text-red-800" },
    completed: { label: "Terminée", color: "bg-blue-100 text-blue-800" },
    cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-800" },
  };

  const statusInfo = statusLabels[request?.status || "pending"];

  return (
    <div className="flex flex-col h-[calc(100dvh-6.5rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate({ to: "/technicien" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold truncate">
            {request?.clientName || "Client"}
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground truncate">
              {request?.category || "Service"}
            </p>
            {statusInfo && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted-foreground font-medium">Aucun message</p>
            <p className="text-sm text-muted-foreground mt-1">
              Envoyez un message pour communiquer avec le client.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex justify-center mb-3">
                <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  {group.date}
                </span>
              </div>
              {group.messages.map((msg) => {
                const isMe = msg.senderRole === "technician";
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-white dark:bg-gray-800 text-foreground rounded-bl-md shadow-sm border"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        } text-right`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-background px-3 py-2.5 shrink-0">
        {request?.status === "accepted" ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder="Votre message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="flex-1 rounded-full"
              maxLength={2000}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={sending || !newMsg.trim()}
              className="rounded-full shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-2">
            {request?.status === "pending"
              ? "La messagerie sera disponible une fois la demande acceptée."
              : request?.status === "completed"
                ? "Cette intervention est terminée. La messagerie est fermée."
                : "La messagerie n'est pas disponible pour cette demande."}
          </p>
        )}
      </div>
    </div>
  );
}
