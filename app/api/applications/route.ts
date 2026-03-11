import { NextRequest, NextResponse } from 'next/server'
import { getDb, readApplications, writeApplications, isUsingFallback } from '@/lib/db'
import { ObjectId } from 'mongodb'
import type { Application } from '@/lib/types'

// GET - 获取所有岗位申请
export async function GET() {
  try {
    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const applications = await readApplications<Application>()
      return NextResponse.json({ applications })
    }

    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    const applications = await db
      .collection<Application>('applications')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // 转换 _id 为 id
    const result = applications.map((app) => ({
      ...app,
      id: app._id?.toString() || app.id,
      _id: undefined,
    }))

    return NextResponse.json({ applications: result })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST - 创建新的岗位申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const applications = await readApplications<Application>()
      const newApplication: Application = {
        ...body,
        id: new ObjectId().toString(),
        createdAt: new Date().toISOString(),
        timeline: body.timeline || [],
        reviewDocs: body.reviewDocs || [],
      }
      applications.unshift(newApplication)
      await writeApplications(applications)
      return NextResponse.json({ application: newApplication })
    }

    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    const newApplication: Omit<Application, 'id'> = {
      ...body,
      id: new ObjectId().toString(),
      createdAt: new Date().toISOString(),
      timeline: body.timeline || [],
      reviewDocs: body.reviewDocs || [],
    }

    const result = await db
      .collection<Omit<Application, 'id'>>('applications')
      .insertOne(newApplication)

    return NextResponse.json({
      application: {
        ...newApplication,
        id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
