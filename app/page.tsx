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
import type { Application, Resume, FilterOptions } from "@/lib/types"

const STORAGE_KEYS = {
  applications: "job-tracker-applications",
  resumes: "job-tracker-resumes",
}

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
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const savedApps = localStorage.getItem(STORAGE_KEYS.applications)
    const savedResumes = localStorage.getItem(STORAGE_KEYS.resumes)
    
    if (savedApps) {
      // Migrate old data to include new fields
      const parsed = JSON.parse(savedApps) as Application[]
      const migrated = parsed.map(app => ({
        ...app,
        channel: app.channel || "其他",
        timeline: app.timeline || [],
        reviewDocs: app.reviewDocs || [],
      }))
      setApplications(migrated)
    }
    if (savedResumes) {
      setResumes(JSON.parse(savedResumes))
    }
    setIsLoaded(true)
  }, [])

  // Save applications to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications))
    }
  }, [applications, isLoaded])

  // Save resumes to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(resumes))
    }
  }, [resumes, isLoaded])

  const handleAddApplication = useCallback((app: Omit<Application, "id" | "createdAt">) => {
    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      timeline: app.timeline || [],
      reviewDocs: app.reviewDocs || [],
    }
    setApplications((prev) => [newApp, ...prev])
    setShowForm(false)
    setScannedData(null)
  }, [])

  const handleUpdateApplication = useCallback((updatedApp: Application) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    )
    setSelectedApp(updatedApp)
    setEditingApp(null)
    setShowForm(false)
  }, [])

  const handleDeleteApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
    setSelectedApp(null)
  }, [])

  const handleAddResume = useCallback((resume: Omit<Resume, "id" | "uploadedAt">) => {
    const newResume: Resume = {
      ...resume,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
    }
    setResumes((prev) => [newResume, ...prev])
  }, [])

  const handleDeleteResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id))
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

  if (!isLoaded) {
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
