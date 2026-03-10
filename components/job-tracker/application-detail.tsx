"use client"

import { useState, useRef } from "react"
import { 
  X, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  MapPin, 
  Calendar, 
  Building2,
  Upload,
  FileText,
  Download,
  Eye,
  Plus,
  Check,
  Tag,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Application, ApplicationStatus, ReviewDocument, TimelineEvent } from "@/lib/types"

interface ApplicationDetailProps {
  application: Application
  onClose: () => void
  onUpdate: (app: Application) => void
  onDelete: (id: string) => void
  onEdit: () => void
}

// Ordered status flow for timeline display
const TIMELINE_FLOW: ApplicationStatus[] = [
  "已投递",
  "一面",
  "二面",
  "三面",
]

const TERMINAL_STATUSES: ApplicationStatus[] = ["已拒", "录用"]

const STATUS_OPTIONS: ApplicationStatus[] = [
  "未投递",
  "已投递",
  "一面",
  "二面",
  "三面",
  "已拒",
  "录用",
]

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  未投递: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  已投递: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  一面: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  二面: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  三面: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  已拒: "bg-red-100 text-red-700 hover:bg-red-100",
  录用: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
}

const STATUS_DOT_COLORS: Record<ApplicationStatus, string> = {
  未投递: "bg-gray-400",
  已投递: "bg-blue-500",
  一面: "bg-amber-500",
  二面: "bg-orange-500",
  三面: "bg-purple-500",
  已拒: "bg-red-500",
  录用: "bg-emerald-500",
}

const REVIEW_STAGES = ["一面复盘", "二面复盘", "三面复盘", "终面复盘", "其他"]

export function ApplicationDetail({
  application,
  onClose,
  onUpdate,
  onDelete,
  onEdit,
}: ApplicationDetailProps) {
  const [showAddTimeline, setShowAddTimeline] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [newTimelineStatus, setNewTimelineStatus] = useState<ApplicationStatus>("已投递")
  const [newTimelineDate, setNewTimelineDate] = useState(new Date().toISOString().split("T")[0])
  const [newTimelineNote, setNewTimelineNote] = useState("")
  const [selectedReviewStage, setSelectedReviewStage] = useState(REVIEW_STAGES[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStatusChange = (status: ApplicationStatus) => {
    // Add timeline event when status changes
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      status,
      date: new Date().toISOString().split("T")[0],
    }
    onUpdate({ 
      ...application, 
      status,
      timeline: [...(application.timeline || []), newEvent]
    })
  }

  const handleDelete = () => {
    if (window.confirm("确定要删除这条投递记录吗？")) {
      onDelete(application.id)
    }
  }

  const handleAddTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      status: newTimelineStatus,
      date: newTimelineDate,
      note: newTimelineNote || undefined,
    }
    onUpdate({
      ...application,
      timeline: [...(application.timeline || []), newEvent],
      status: newTimelineStatus, // Update current status too
    })
    setShowAddTimeline(false)
    setNewTimelineNote("")
    setNewTimelineDate(new Date().toISOString().split("T")[0])
  }

  const handleEditTimelineEvent = (eventId: string) => {
    const event = (application.timeline || []).find(e => e.id === eventId)
    if (event) {
      setEditingEventId(eventId)
      setNewTimelineStatus(event.status)
      setNewTimelineDate(event.date)
      setNewTimelineNote(event.note || "")
    }
  }

  const handleSaveTimelineEvent = () => {
    if (!editingEventId) return
    
    const updatedTimeline = (application.timeline || []).map(event => {
      if (event.id === editingEventId) {
        return {
          ...event,
          status: newTimelineStatus,
          date: newTimelineDate,
          note: newTimelineNote || undefined,
        }
      }
      return event
    })

    // Update current status to the latest event status
    const sortedEvents = [...updatedTimeline].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const latestStatus = sortedEvents[0]?.status || application.status

    onUpdate({
      ...application,
      timeline: updatedTimeline,
      status: latestStatus,
    })
    
    setEditingEventId(null)
    setNewTimelineNote("")
    setNewTimelineDate(new Date().toISOString().split("T")[0])
  }

  const handleDeleteTimelineEvent = (eventId: string) => {
    const updatedTimeline = (application.timeline || []).filter(e => e.id !== eventId)
    
    // Update current status to the latest remaining event
    const sortedEvents = [...updatedTimeline].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const latestStatus = sortedEvents[0]?.status || "未投递"

    onUpdate({
      ...application,
      timeline: updatedTimeline,
      status: latestStatus,
    })
  }

  const cancelEditing = () => {
    setEditingEventId(null)
    setShowAddTimeline(false)
    setNewTimelineNote("")
    setNewTimelineDate(new Date().toISOString().split("T")[0])
  }

  const handleReviewDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx"
    const reader = new FileReader()
    reader.onload = () => {
      const newDoc: ReviewDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        stage: selectedReviewStage,
        fileType,
        fileData: reader.result as string,
        uploadedAt: new Date().toISOString(),
      }
      onUpdate({
        ...application,
        reviewDocs: [...(application.reviewDocs || []), newDoc],
      })
    }
    reader.readAsDataURL(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeleteReviewDoc = (docId: string) => {
    onUpdate({
      ...application,
      reviewDocs: (application.reviewDocs || []).filter(d => d.id !== docId),
    })
  }

  const handleViewDoc = (doc: ReviewDocument) => {
    const newWindow = window.open()
    if (newWindow) {
      if (doc.fileType === "pdf") {
        newWindow.document.write(
          `<iframe src="${doc.fileData}" style="width:100%;height:100%;border:none;"></iframe>`
        )
      } else {
        newWindow.document.write(
          `<html><body><p>Word 文档：${doc.name}</p><a href="${doc.fileData}" download="${doc.name}">点击下载</a></body></html>`
        )
      }
    }
  }

  const handleDownloadDoc = (doc: ReviewDocument) => {
    const link = document.createElement("a")
    link.href = doc.fileData
    link.download = doc.name
    link.click()
  }

  // Sort timeline by date
  const sortedTimeline = [...(application.timeline || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div 
        className="bg-card w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{application.company}</h2>
            <Badge className={STATUS_COLORS[application.status]}>
              {application.status}
            </Badge>
            {application.tag && (
              <Badge variant="outline" className="text-xs">
                {application.tag}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-xl font-medium text-foreground">
              {application.position}
            </h3>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              {application.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {application.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {application.applicationDate}
              </span>
              {application.channel && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {application.channel}
                </span>
              )}
              {application.tag && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {application.tag}
                </span>
              )}
            </div>
          </div>

          {/* Quick Status Update */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">快速更新状态：</span>
            <Select
              value={application.status}
              onValueChange={(value) =>
                handleStatusChange(value as ApplicationStatus)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">时间节点进度轴</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  cancelEditing()
                  setShowAddTimeline(!showAddTimeline)
                }}
                className="gap-1 h-7 text-xs"
              >
                <Plus className="w-3 h-3" />
                添加节点
              </Button>
            </div>

            {/* Flow indicator */}

            
            {/* Add new event form */}
            {showAddTimeline && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3 border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">状态</Label>
                    <Select
                      value={newTimelineStatus}
                      onValueChange={(v) => setNewTimelineStatus(v as ApplicationStatus)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">日期</Label>
                    <Input
                      type="date"
                      value={newTimelineDate}
                      onChange={(e) => setNewTimelineDate(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">备注（可选）</Label>
                  <Input
                    value={newTimelineNote}
                    onChange={(e) => setNewTimelineNote(e.target.value)}
                    placeholder="例如：HR面，技术面，主管面..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={cancelEditing}
                    className="h-7 text-xs"
                  >
                    取消
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddTimelineEvent}
                    className="h-7 text-xs gap-1"
                  >
                    <Check className="w-3 h-3" />
                    确认添加
                  </Button>
                </div>
              </div>
            )}

            {sortedTimeline.length > 0 ? (
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                
                <div className="space-y-4">
                  {sortedTimeline.map((event) => (
                    <div key={event.id} className="relative">
                      {editingEventId === event.id ? (
                        // Editing mode
                        <div className="ml-2 p-3 bg-muted/30 rounded-lg space-y-3 border border-primary/30">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">状态</Label>
                              <Select
                                value={newTimelineStatus}
                                onValueChange={(v) => setNewTimelineStatus(v as ApplicationStatus)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">日期</Label>
                              <Input
                                type="date"
                                value={newTimelineDate}
                                onChange={(e) => setNewTimelineDate(e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">备注（可选）</Label>
                            <Input
                              value={newTimelineNote}
                              onChange={(e) => setNewTimelineNote(e.target.value)}
                              placeholder="例如：HR面，技术面..."
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={cancelEditing}
                              className="h-7 text-xs"
                            >
                              取消
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveTimelineEvent}
                              className="h-7 text-xs gap-1"
                            >
                              <Check className="w-3 h-3" />
                              保存
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div className="flex items-start gap-3 group">
                          {/* Dot */}
                          <div 
                            className={`absolute -left-6 mt-1.5 w-3.5 h-3.5 rounded-full border-2 border-card ${STATUS_DOT_COLORS[event.status]}`}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-normal">
                                {event.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {event.date}
                              </span>
                              
                              {/* Edit/Delete dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditTimelineEvent(event.id)}>
                                    <Edit2 className="w-3 h-3 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteTimelineEvent(event.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {event.note && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                暂无进度记录，点击「添加节点」开始追踪
              </div>
            )}
          </div>

          {/* Review Documents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">面试复盘文档</h4>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedReviewStage}
                  onValueChange={setSelectedReviewStage}
                >
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1 h-7 text-xs"
                >
                  <Upload className="w-3 h-3" />
                  上传
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleReviewDocUpload}
                />
              </div>
            </div>

            {(application.reviewDocs || []).length > 0 ? (
              <div className="space-y-2">
                {(application.reviewDocs || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.stage} · {doc.fileType.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleViewDoc(doc)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownloadDoc(doc)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteReviewDoc(doc.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                暂无复盘文档，上传 PDF 或 Word 文件记录面试复盘
              </div>
            )}
          </div>

          {/* URL Link */}
          {application.jobDescriptionUrl && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                投递链接
              </h4>
              <a
                href={application.jobDescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                {application.jobDescriptionUrl}
              </a>
            </div>
          )}

          {/* Job Description */}
          {application.jobDescription && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                职位描述 (JD)
              </h4>
              <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {application.jobDescription}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                备注
              </h4>
              <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                {application.notes}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
            <Button size="sm" onClick={onEdit} className="gap-2">
              <Edit2 className="w-4 h-4" />
              编辑
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
