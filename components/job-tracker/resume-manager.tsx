"use client"

import { useState, useRef } from "react"
import { X, Upload, FileText, Download, Trash2, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Resume } from "@/lib/types"

interface ResumeManagerProps {
  resumes: Resume[]
  onAdd: (resume: Omit<Resume, "id" | "uploadedAt">) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function ResumeManager({
  resumes,
  onAdd,
  onDelete,
  onClose,
}: ResumeManagerProps) {
  const [targetPosition, setTargetPosition] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    const isValidType =
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".docx")

    if (!isValidType) {
      alert("请上传 PDF 或 Word 文档")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      onAdd({
        name: file.name,
        targetPosition: targetPosition || "通用简历",
        fileType: file.name.endsWith(".pdf") ? "pdf" : "docx",
        fileData: base64,
      })
      setTargetPosition("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDownload = (resume: Resume) => {
    const link = document.createElement("a")
    link.href = resume.fileData
    link.download = resume.name
    link.click()
  }

  const handleView = (resume: Resume) => {
    if (resume.fileType === "pdf") {
      // Open PDF in new tab
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${resume.name}</title></head>
            <body style="margin:0;padding:0;">
              <iframe src="${resume.fileData}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
          </html>
        `)
      }
    } else {
      // Download Word files directly
      handleDownload(resume)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">简历库</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetPosition">目标职位（可选）</Label>
              <Input
                id="targetPosition"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                placeholder="例如：字节跳动 AI 产品经理"
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                拖拽文件到此处，或
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                选择文件
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                支持 PDF、Word 格式
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>
          </div>

          {/* Resume List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              已上传简历 ({resumes.length})
            </h3>
            
            {resumes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无简历</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <File className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {resume.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resume.targetPosition} · 上传于{" "}
                          {new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(resume)}
                          className="text-xs"
                        >
                          查看
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(resume)}
                          className="h-8 w-8"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("确定要删除这份简历吗？")) {
                              onDelete(resume.id)
                            }
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
