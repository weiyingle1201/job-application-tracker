import { NextRequest, NextResponse } from 'next/server'
import { getDb, readResumes, writeResumes, isUsingFallback } from '@/lib/db'
import { ObjectId } from 'mongodb'
import type { Resume } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// DELETE - 删除简历
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const resumes = await readResumes<Resume>()
      const filtered = resumes.filter(r => r.id !== id)

      if (filtered.length === resumes.length) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      await writeResumes(filtered)
      return NextResponse.json({ success: true })
    }

    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      const existing = await db.collection<Resume>('resumes').findOne({ id })
      if (!existing) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }
      objectId = existing._id!
    }

    const result = await db
      .collection<Resume>('resumes')
      .deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    )
  }
}
