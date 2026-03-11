import type { Application, Resume } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

// 通用请求函数
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// ========== Applications API ==========
export const applicationsApi = {
  // 获取所有申请
  async getAll(): Promise<Application[]> {
    const data = await request<{ applications: Application[] }>('/applications')
    return data.applications
  },

  // 创建申请
  async create(
    app: Omit<Application, 'id' | 'createdAt'>
  ): Promise<Application> {
    const data = await request<{ application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    })
    return data.application
  },

  // 更新申请
  async update(app: Application): Promise<Application> {
    const data = await request<{ application: Application }>(
      `/applications/${app.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(app),
      }
    )
    return data.application
  },

  // 删除申请
  async delete(id: string): Promise<void> {
    await request(`/applications/${id}`, { method: 'DELETE' })
  },
}

// ========== Resumes API ==========
export const resumesApi = {
  // 获取所有简历
  async getAll(): Promise<Resume[]> {
    const data = await request<{ resumes: Resume[] }>('/resumes')
    return data.resumes
  },

  // 创建简历
  async create(resume: Omit<Resume, 'id' | 'uploadedAt'>): Promise<Resume> {
    const data = await request<{ resume: Resume }>('/resumes', {
      method: 'POST',
      body: JSON.stringify(resume),
    })
    return data.resume
  },

  // 删除简历
  async delete(id: string): Promise<void> {
    await request(`/resumes/${id}`, { method: 'DELETE' })
  },
}

// ========== OCR API ==========
export const ocrApi = {
  // 识别图片
  async recognize(imageBase64: string): Promise<{
    company: string | null
    position: string | null
    location: string | null
    jobDescription: string | null
  }> {
    const data = await request<{ data: any }>('/ocr', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 }),
    })
    return data.data
  },
}
