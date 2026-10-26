"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ShieldAlert, ArrowRight, Search, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllChatRoomsAction, getReportedMessagesAction, moderateMessageAction } from "@/actions/chat-actions";
import { ChatRoom, ChatMessage } from "@/types/chat";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminChatManagementPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [reportedMessages, setReportedMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "flagged">("rooms");

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, flaggedData] = await Promise.all([
        getAllChatRoomsAction(),
        getReportedMessagesAction(),
      ]);
      setRooms(roomsData);
      setReportedMessages(flaggedData);
    } catch (err) {
      console.error("Failed to load chat data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleModerate = async (messageId: string, status: "approved" | "hidden" | "deleted") => {
    try {
      await moderateMessageAction(messageId, status, `Moderated by admin (${status})`);
      setReportedMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      alert("Failed to moderate message: " + (err as Error).message);
    }
  };

  const filteredRooms = rooms.filter((r) => 
    r.water_source?.name.toLowerCase().includes(search.toLowerCase()) ||
    r.water_source?.barangay?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chat & Community Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time discussions for water sources and review flagged or abusive messages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "rooms" ? "default" : "outline"}
            onClick={() => setActiveTab("rooms")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Rooms ({rooms.length})
          </Button>
          <Button
            variant={activeTab === "flagged" ? "default" : "outline"}
            onClick={() => setActiveTab("flagged")}
            className="flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Flagged ({reportedMessages.length})
          </Button>
        </div>
      </div>

      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chat room by water source name..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Loading chat channels...
            </div>
          ) : filteredRooms.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No chat rooms found matching your search.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {room.water_source?.name || "Water Source Room"}
                      </h3>
                      <Badge variant={room.is_active ? "default" : "secondary"}>
                        {room.is_active ? "Active" : "Archived"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {room.water_source?.barangay || "Irosin"}, Sorsogon
                    </p>

                    <div className="text-xs text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
                      <span>Created: {formatDate(room.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-border">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/admin/chat/${room.water_source_id}`} className="flex items-center justify-center gap-1.5">
                        Open Room Moderation
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "flagged" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Checking flagged messages...
            </div>
          ) : reportedMessages.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 opacity-80" />
              <h3 className="text-lg font-medium">No Flagged Messages</h3>
              <p className="text-sm text-muted-foreground">
                All community discussions are clean. No messages are awaiting moderation.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reportedMessages.map((msg) => (
                <Card key={msg.id} className="p-4 border-destructive/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{msg.display_name}</span>
                      <span className="text-xs text-muted-foreground font-mono">({msg.visitor_id.slice(0, 8)}...)</span>
                      <Badge variant="destructive" className="capitalize text-[11px]">
                        {msg.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(msg.created_at)}
                    </span>
                  </div>

                  <div className="p-3 bg-muted/60 rounded-md text-sm border border-border">
                    &ldquo;{msg.message}&rdquo;
                  </div>

                  {msg.moderation_reason && (
                    <p className="text-xs text-destructive">
                      <strong>Flag reason:</strong> {msg.moderation_reason}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleModerate(msg.id, "approved")}
                      className="text-xs"
                    >
                      Dismiss / Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleModerate(msg.id, "hidden")}
                      className="text-xs"
                    >
                      Hide Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleModerate(msg.id, "deleted")}
                      className="text-xs"
                    >
                      Delete Permanently
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
