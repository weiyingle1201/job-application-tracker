"use client"

import { Briefcase, Send, MessageSquare, XCircle, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Application } from "@/lib/types"

interface StatsPanelProps {
  applications: Application[]
}

export function StatsPanel({ applications }: StatsPanelProps) {
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status !== "未投递").length,
    interviewing: applications.filter((a) =>
      ["一面", "二面", "三面"].includes(a.status)
    ).length,
    rejected: applications.filter((a) => a.status === "已拒").length,
    hired: applications.filter((a) => a.status === "录用").length,
  }

  const items = [
    {
      label: "总投递",
      value: stats.total,
      icon: Briefcase,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "已投递",
      value: stats.applied,
      icon: Send,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "面试中",
      value: stats.interviewing,
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "已拒",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "录用",
      value: stats.hired,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ]

  return (
    <Card className="p-4">
      <div className="grid grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
          >
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
