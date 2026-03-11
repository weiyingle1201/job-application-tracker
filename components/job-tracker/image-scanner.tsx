"use client"

import { useState, useRef } from "react"
import { X, Upload, ImageIcon, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageScannerProps {
  onClose: () => void
  onResult: (data: {
    company: string
    position: string
    location: string
    jobDescription: string
  }) => void
}

export function ImageScanner({ onClose, onResult }: ImageScannerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("图片大小不能超过 10MB")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleScan = async () => {
    if (!image) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        throw new Error("识别失败，请重试")
      }

      const result = await response.json()

      if (result.data) {
        onResult({
          company: result.data.company || "",
          position: result.data.position || "",
          location: result.data.location || "",
          jobDescription: result.data.jobDescription || "",
        })
        onClose()
      } else {
        setError("无法从图片中识别有效信息")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "识别失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setImage(e.target?.result as string)
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-lg"
        onPaste={handlePaste}
      >
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">智能识别招聘截图</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            上传招聘岗位的截图（如 BOSS直聘、官网等），AI 将自动识别公司、职位、地点和 JD 信息
          </p>

          {!image ? (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">点击上传或拖拽图片到此处</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持 PNG、JPG、WEBP 格式，也可直接粘贴截图
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={image}
                  alt="Uploaded screenshot"
                  className="w-full max-h-80 object-contain bg-muted"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImage(null)}
                >
                  重新上传
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              onClick={handleScan}
              disabled={!image || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  识别中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  开始识别
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
