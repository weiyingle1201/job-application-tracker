import { NextRequest, NextResponse } from 'next/server'
import { getDb, readApplications, writeApplications, isUsingFallback } from '@/lib/db'
import { ObjectId } from 'mongodb'
import type { Application } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT - 更新岗位申请
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const applications = await readApplications<Application>()
      const index = applications.findIndex(app => app.id === id)

      if (index === -1) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      const updatedApp = { ...body, id: body.id || id }
      applications[index] = updatedApp
      await writeApplications(applications)

      return NextResponse.json({ application: updatedApp })
    }

    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    // 如果是新的ObjectId格式，尝试转换
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      // 如果转换失败，查找自定义id
      const existing = await db
        .collection<Application>('applications')
        .findOne({ id })
      if (!existing) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }
      objectId = existing._id!
    }

    const updateData: Partial<Application> = {
      ...body,
      id: body.id || id,
    }

    const result = await db
      .collection<Application>('applications')
      .findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    if (!result) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      application: {
        ...result,
        id: result._id?.toString() || result.id,
        _id: undefined,
      },
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE - 删除岗位申请
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // 检查是否使用 fallback 模式
    if (await isUsingFallback()) {
      const applications = await readApplications<Application>()
      const filtered = applications.filter(app => app.id !== id)

      if (filtered.length === applications.length) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      await writeApplications(filtered)
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
      const existing = await db
        .collection<Application>('applications')
        .findOne({ id })
      if (!existing) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }
      objectId = existing._id!
    }

    const result = await db
      .collection<Application>('applications')
      .deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
