"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Shield, EyeOff, Trash2, 
  RefreshCw, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getChatRoomAction, getMessagesAction, moderateMessageAction } from "@/actions/chat-actions";
import { getWaterSourceByIdAction } from "@/actions/water-actions";
import { ChatRoom, ChatMessage } from "@/types/chat";
import { WaterSource } from "@/types/water";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminWaterChatRoomPage() {
  const params = useParams();
  const waterId = params?.waterId as string;

  const [waterSource, setWaterSource] = useState<WaterSource | null>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!waterId) return;
    setLoading(true);
    try {
      const [sourceData, roomData, msgsData] = await Promise.all([
        getWaterSourceByIdAction(waterId),
        getChatRoomAction(waterId),
        getMessagesAction(waterId),
      ]);
      setWaterSource(sourceData);
      setRoom(roomData);
      setMessages(msgsData);
    } catch (err) {
      console.error("Failed to load room chat data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterId]);

  const handleModerate = async (messageId: string, status: "published" | "hidden" | "deleted") => {
    try {
      await moderateMessageAction(messageId, status, `Moderated by admin (${status})`);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status } : m))
      );
    } catch (err) {
      alert("Failed to moderate message: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading room moderation...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/chat">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {waterSource?.name || "Water Source"} Chat
              </h1>
              <Badge variant={room?.is_active ? "default" : "secondary"}>
                {room?.is_active ? "Live" : "Disabled"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {waterSource?.barangay || "Irosin"}, Sorsogon • Room ID: {room?.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/chat/${waterId}`} target="_blank">
              View Public Chat
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-border">
        <div className="p-4 bg-muted/40 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>{messages.length} Total Messages in Room</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-primary" /> Admin Live Oversight
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No messages posted in this conversation yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-4 transition-colors ${
                msg.status === "hidden" 
                  ? "bg-destructive/5 opacity-75" 
                  : msg.status === "deleted" 
                  ? "bg-muted/50 line-through opacity-50" 
                  : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{msg.display_name}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {msg.visitor_id.slice(0, 8)}
                  </span>
                  <Badge 
                    variant={
                      msg.status === "published" 
                        ? "outline" 
                        : msg.status === "hidden" 
                        ? "destructive" 
                        : "secondary"
                    }
                    className="capitalize text-[10px]"
                  >
                    {msg.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</span>
              </div>

              <p className="text-sm text-foreground py-1 whitespace-pre-wrap">{msg.message}</p>

              {msg.moderation_reason && (
                <p className="text-xs text-destructive italic mt-1">
                  Reason: {msg.moderation_reason}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
                {msg.status !== "published" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                    onClick={() => handleModerate(msg.id, "published")}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                  </Button>
                )}
                {msg.status !== "hidden" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs text-amber-600 hover:text-amber-700"
                    onClick={() => handleModerate(msg.id, "hidden")}
                  >
                    <EyeOff className="w-3 h-3 mr-1" /> Hide
                  </Button>
                )}
                {msg.status !== "deleted" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleModerate(msg.id, "deleted")}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
