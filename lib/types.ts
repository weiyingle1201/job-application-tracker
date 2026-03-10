export type ApplicationStatus =
  | "未投递"
  | "已投递"
  | "一面"
  | "二面"
  | "三面"
  | "已拒"
  | "录用"

export type ApplicationChannel =
  | "官网"
  | "内推"
  | "BOSS直聘"
  | "实习僧"
  | "牛客"
  | "其他"

export interface TimelineEvent {
  id: string
  status: ApplicationStatus
  date: string
  note?: string
}

export interface ReviewDocument {
  id: string
  name: string
  stage: string // e.g., "一面复盘", "二面复盘"
  fileType: "pdf" | "docx"
  fileData: string // base64 encoded
  uploadedAt: string
}

export interface Application {
  id: string
  company: string
  position: string
  location: string
  applicationDate: string
  status: ApplicationStatus
  channel: ApplicationChannel
  tag?: string // e.g., "暑期实习", "秋招", "日常实习"
  jobDescriptionUrl?: string
  jobDescription?: string
  notes?: string
  createdAt: string
  timeline: TimelineEvent[]
  reviewDocs: ReviewDocument[]
}

export interface Resume {
  id: string
  name: string
  targetPosition: string
  fileType: "pdf" | "docx"
  fileData: string // base64 encoded
  uploadedAt: string
}

export interface FilterOptions {
  search: string
  status: ApplicationStatus | "all"
  location: string
}
