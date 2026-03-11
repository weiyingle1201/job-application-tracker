import { NextRequest, NextResponse } from 'next/server'
import { getDb, readResumes, writeResumes, isUsingFallback } from '@/lib/db'
import { ObjectId } from 'mongodb'
import type { Resume } from '@/lib/types'

// GET - 获取所有简历
export async function GET() {
  try {
    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const resumes = await readResumes<Resume>()
      return NextResponse.json({ resumes })
    }

    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    const resumes = await db
      .collection<Resume>('resumes')
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray()

    const result = resumes.map((resume) => ({
      ...resume,
      id: resume._id?.toString() || resume.id,
      _id: undefined,
    }))

    return NextResponse.json({ resumes: result })
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}

// POST - 创建新简历
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const resumes = await readResumes<Resume>()
      const newResume: Resume = {
        ...body,
        id: new ObjectId().toString(),
        uploadedAt: new Date().toISOString(),
      }
      resumes.unshift(newResume)
      await writeResumes(resumes)
      return NextResponse.json({ resume: newResume })
    }

    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    const newResume: Omit<Resume, 'id'> = {
      ...body,
      id: new ObjectId().toString(),
      uploadedAt: new Date().toISOString(),
    }

    const result = await db
      .collection<Omit<Resume, 'id'>>('resumes')
      .insertOne(newResume)

    return NextResponse.json({
      resume: {
        ...newResume,
        id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    )
  }
}
