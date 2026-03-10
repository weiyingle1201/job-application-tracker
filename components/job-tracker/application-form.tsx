"use client"

import { useState } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Application, ApplicationStatus, ApplicationChannel } from "@/lib/types"

interface ApplicationFormProps {
  application?: Application | null
  initialData?: {
    company: string
    position: string
    location: string
    jobDescription: string
  } | null
  onSubmit: (app: Application | Omit<Application, "id" | "createdAt">) => void
  onClose: () => void
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "未投递",
  "已投递",
  "一面",
  "二面",
  "三面",
  "已拒",
  "录用",
]

const CHANNEL_OPTIONS: ApplicationChannel[] = [
  "官网",
  "内推",
  "BOSS直聘",
  "实习僧",
  "牛客",
  "其他",
]

export function ApplicationForm({
  application,
  initialData,
  onSubmit,
  onClose,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    company: application?.company || initialData?.company || "",
    position: application?.position || initialData?.position || "",
    location: application?.location || initialData?.location || "",
    applicationDate:
      application?.applicationDate || new Date().toISOString().split("T")[0],
    status: application?.status || ("未投递" as ApplicationStatus),
    channel: application?.channel || ("" as ApplicationChannel | ""),
    tag: application?.tag || "暑期实习",
    jobDescriptionUrl: application?.jobDescriptionUrl || "",
    jobDescription: application?.jobDescription || initialData?.jobDescription || "",
    notes: application?.notes || "",
  })

  const [channelError, setChannelError] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!formData.company || !formData.position) return
    
    // Validate channel is selected
    if (!formData.channel) {
      setChannelError(true)
      return
    }

    if (application) {
      // Update existing - add timeline event if status changed
      const updatedTimeline = [...(application.timeline || [])]
      if (application.status !== formData.status) {
        updatedTimeline.push({
          id: crypto.randomUUID(),
          status: formData.status,
          date: new Date().toISOString().split("T")[0],
        })
      }
      
      onSubmit({
        ...application,
        ...formData,
        channel: formData.channel as ApplicationChannel,
        timeline: updatedTimeline,
      })
    } else {
      // Create new with initial timeline
      const initialTimeline = [{
        id: crypto.randomUUID(),
        status: formData.status,
        date: formData.applicationDate,
      }]
      
      onSubmit({
        ...formData,
        channel: formData.channel as ApplicationChannel,
        timeline: initialTimeline,
        reviewDocs: [],
      })
    }
    // Auto close after submit
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {application ? "编辑投递记录" : "新增投递记录"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {initialData && !application && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span>已从截图自动识别信息，请核对并补充</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">公司名称 *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="例如：字节跳动"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">职位名称 *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="例如：AI 产品经理实习生"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">工作地点</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="例如：北京"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">岗位标签</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
                placeholder="暑期实习 / 秋招 / 日常实习"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">投递日期</Label>
              <Input
                id="date"
                type="date"
                value={formData.applicationDate}
                onChange={(e) =>
                  setFormData({ ...formData, applicationDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel" className="flex items-center gap-1">
                投递渠道 *
                {channelError && (
                  <span className="text-destructive text-xs">请选择渠道</span>
                )}
              </Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => {
                  setFormData({ ...formData, channel: value as ApplicationChannel })
                  setChannelError(false)
                }}
              >
                <SelectTrigger 
                  id="channel" 
                  className={channelError ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="选择投递渠道" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">当前状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as ApplicationStatus })
                }
              >
                <SelectTrigger id="status">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">投递链接</Label>
            <Input
              id="url"
              type="url"
              value={formData.jobDescriptionUrl}
              onChange={(e) =>
                setFormData({ ...formData, jobDescriptionUrl: e.target.value })
              }
              placeholder="官网 / BOSS直聘 / 牛客等链接"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd">职位描述 (JD)</Label>
            <Textarea
              id="jd"
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              placeholder="粘贴职位描述全文，方便后续复盘..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="面试反馈、内推人信息等..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {application ? "保存修改" : "确认添加"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
