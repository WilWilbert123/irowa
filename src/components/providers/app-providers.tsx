// src/components/providers/app-providers.tsx
"use client";

import React, { useState } from "react";
import { ThemeProvider } from "./theme-provider";
import { VisitorProvider } from "@/contexts/visitor-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ChatProvider } from "@/contexts/chat-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <VisitorProvider>
          <NotificationProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </NotificationProvider>
        </VisitorProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
