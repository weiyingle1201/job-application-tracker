"use client"

import { ExternalLink, MapPin, Calendar, Edit2, Building2, Tag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Application, ApplicationStatus } from "@/lib/types"

interface ApplicationListProps {
  applications: Application[]
  onSelect: (app: Application) => void
  onEdit: (app: Application) => void
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  未投递: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  已投递: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  一面: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  二面: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  三面: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  已拒: "bg-red-100 text-red-700 hover:bg-red-100",
  录用: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
}

export function ApplicationList({
  applications,
  onSelect,
  onEdit,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">暂无投递记录</p>
          <p className="text-sm mt-1">点击右上角「新增投递」或「截图识别」添加第一条记录</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <Card
          key={app.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect(app)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-medium text-foreground truncate">
                  {app.company}
                </h3>
                <Badge className={STATUS_COLORS[app.status]}>{app.status}</Badge>
                {app.tag && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {app.tag}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{app.position}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {app.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {app.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {app.applicationDate}
                </span>
                {app.channel && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {app.channel}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {app.jobDescriptionUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(app.jobDescriptionUrl, "_blank")
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(app)
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
