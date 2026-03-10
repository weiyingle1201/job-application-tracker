"use client"

import { Plus, FileText, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onAddClick: () => void
  onResumeClick: () => void
  onScanClick: () => void
}

export function Header({ onAddClick, onResumeClick, onScanClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            简历投递管理系统
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onScanClick}
            className="gap-2"
          >
            <ScanLine className="w-4 h-4" />
            截图识别
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResumeClick}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            简历库
          </Button>
          <Button
            size="sm"
            onClick={onAddClick}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            新增投递
          </Button>
        </div>
      </div>
    </header>
  )
}
