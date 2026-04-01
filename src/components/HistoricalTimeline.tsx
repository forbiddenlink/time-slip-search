"use client";

import { Chrono } from "react-chrono";

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  summary: string;
  imageUrl?: string;
  url?: string;
  decade?: string;
  tags?: string[];
}

interface HistoricalTimelineProps {
  events: TimelineEvent[];
  mode?: "VERTICAL" | "VERTICAL_ALTERNATING" | "HORIZONTAL";
}

export function HistoricalTimeline({
  events,
  mode = "VERTICAL_ALTERNATING",
}: HistoricalTimelineProps) {
  const items = events.map((e) => ({
    title: e.date.getFullYear().toString(),
    cardTitle: e.title,
    cardSubtitle:
      e.decade ??
      e.date.toLocaleDateString("en-US", { year: "numeric", month: "long" }),
    cardDetailedText: e.summary,
    media: e.imageUrl
      ? { type: "IMAGE" as const, source: { url: e.imageUrl } }
      : undefined,
    url: e.url,
  }));

  return (
    <div
      className="w-full"
      style={{ height: mode === "HORIZONTAL" ? "500px" : "auto" }}
    >
      <Chrono
        items={items}
        mode={mode}
        theme={{
          primary: "hsl(var(--primary))",
          secondary: "hsl(var(--muted))",
          cardBgColor: "hsl(var(--card))",
          cardForeColor: "hsl(var(--card-foreground))",
          titleColor: "hsl(var(--foreground))",
          titleColorActive: "hsl(var(--primary))",
        }}
        fontSizes={{
          cardSubtitle: "0.75rem",
          cardText: "0.875rem",
          title: "0.875rem",
        }}
        showAllCardsHorizontal
        useReadMore={false}
        enableOutline
      />
    </div>
  );
}
