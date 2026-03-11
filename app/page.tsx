"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/job-tracker/header"
import { StatsPanel } from "@/components/job-tracker/stats-panel"
import { ApplicationList } from "@/components/job-tracker/application-list"
import { ApplicationForm } from "@/components/job-tracker/application-form"
import { ApplicationDetail } from "@/components/job-tracker/application-detail"
import { ResumeManager } from "@/components/job-tracker/resume-manager"
import { FilterBar } from "@/components/job-tracker/filter-bar"
import { ImageScanner } from "@/components/job-tracker/image-scanner"
import { applicationsApi, resumesApi } from "@/lib/api"
import type { Application, Resume, FilterOptions } from "@/lib/types"

export default function JobTrackerPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showImageScanner, setShowImageScanner] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [scannedData, setScannedData] = useState<{
    company: string
    position: string
    location: string
    jobDescription: string
  } | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: "all",
    location: "all",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)
        const [appsData, resumesData] = await Promise.all([
          applicationsApi.getAll(),
          resumesApi.getAll(),
        ])
        setApplications(appsData)
        setResumes(resumesData)
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("加载数据失败，请检查网络连接")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddApplication = useCallback(async (app: Omit<Application, "id" | "createdAt">) => {
    try {
      const newApp = await applicationsApi.create(app)
      setApplications((prev) => [newApp, ...prev])
      setShowForm(false)
      setScannedData(null)
    } catch (err) {
      console.error("Failed to create application:", err)
      setError("创建失败，请重试")
    }
  }, [])

  const handleUpdateApplication = useCallback(async (updatedApp: Application) => {
    try {
      const result = await applicationsApi.update(updatedApp)
      setApplications((prev) =>
        prev.map((app) => (app.id === result.id ? result : app))
      )
      setSelectedApp(result)
      setEditingApp(null)
      setShowForm(false)
    } catch (err) {
      console.error("Failed to update application:", err)
      setError("更新失败，请重试")
    }
  }, [])

  const handleDeleteApplication = useCallback(async (id: string) => {
    try {
      await applicationsApi.delete(id)
      setApplications((prev) => prev.filter((app) => app.id !== id))
      setSelectedApp(null)
    } catch (err) {
      console.error("Failed to delete application:", err)
      setError("删除失败，请重试")
    }
  }, [])

  const handleAddResume = useCallback(async (resume: Omit<Resume, "id" | "uploadedAt">) => {
    try {
      const newResume = await resumesApi.create(resume)
      setResumes((prev) => [newResume, ...prev])
    } catch (err) {
      console.error("Failed to create resume:", err)
      setError("上传简历失败，请重试")
    }
  }, [])

  const handleDeleteResume = useCallback(async (id: string) => {
    try {
      await resumesApi.delete(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error("Failed to delete resume:", err)
      setError("删除简历失败，请重试")
    }
  }, [])

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      filters.search === "" ||
      app.company.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.position.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === "all" || app.status === filters.status
    const matchesLocation = filters.location === "all" || app.location === filters.location

    return matchesSearch && matchesStatus && matchesLocation
  })

  // Get unique locations for filter
  const locations = [...new Set(applications.map((app) => app.location).filter(Boolean))]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddClick={() => {
          setEditingApp(null)
          setScannedData(null)
          setShowForm(true)
        }}
        onResumeClick={() => setShowResumeManager(true)}
        onScanClick={() => setShowImageScanner(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              关闭
            </button>
          </div>
        )}

        <StatsPanel applications={applications} />

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          locations={locations}
        />

        <ApplicationList
          applications={filteredApplications}
          onSelect={setSelectedApp}
          onEdit={(app) => {
            setEditingApp(app)
            setScannedData(null)
            setShowForm(true)
          }}
        />
      </main>

      {/* Add/Edit Application Modal */}
      {showForm && (
        <ApplicationForm
          application={editingApp}
          initialData={scannedData}
          onSubmit={editingApp ? handleUpdateApplication : handleAddApplication}
          onClose={() => {
            setShowForm(false)
            setEditingApp(null)
            setScannedData(null)
          }}
        />
      )}

      {/* Application Detail Drawer */}
      {selectedApp && !showForm && (
        <ApplicationDetail
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdateApplication}
          onDelete={handleDeleteApplication}
          onEdit={() => {
            setEditingApp(selectedApp)
            setScannedData(null)
            setShowForm(true)
          }}
        />
      )}

      {/* Resume Manager Modal */}
      {showResumeManager && (
        <ResumeManager
          resumes={resumes}
          onAdd={handleAddResume}
          onDelete={handleDeleteResume}
          onClose={() => setShowResumeManager(false)}
        />
      )}

      {/* Image Scanner Modal */}
      {showImageScanner && (
        <ImageScanner
          onClose={() => setShowImageScanner(false)}
          onResult={(data) => {
            setScannedData(data)
            setShowImageScanner(false)
            setEditingApp(null)
            setShowForm(true)
          }}
        />
      )}
    </div>
  )
}
