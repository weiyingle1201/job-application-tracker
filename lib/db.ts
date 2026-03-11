import { MongoClient, Db } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 30000,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
}

let client: MongoClient
let clientPromise: Promise<MongoClient | null>
let _useFallback = false

// LocalStorage fallback 文件路径
const DATA_DIR = path.join(process.cwd(), 'data')
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json')
const RESUMES_FILE = path.join(DATA_DIR, 'resumes.json')

// 确保 data 目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {
    // 目录已存在，忽略
  }
}

// 初始化连接
async function initConnection(): Promise<MongoClient | null> {
  if (_useFallback) return null

  try {
    const newClient = new MongoClient(uri, options)
    const promise = newClient.connect()

    // 测试连接
    const connectedClient = await Promise.race([
      promise,
      new Promise<MongoClient>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      ),
    ])

    // 验证连接
    await connectedClient.db('admin').command({ ping: 1 })

    console.log('MongoDB 连接成功')
    return connectedClient
  } catch (err) {
    console.warn('MongoDB 连接失败，切换到 localStorage fallback 模式')
    console.warn('错误:', (err as Error).message)
    _useFallback = true
    ensureDataDir()
    return null
  }
}

// 初始化连接 Promise
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient | null>
    _mongoUseFallback?: boolean
  }

  if (!globalWithMongo._mongoClientPromise) {
    clientPromise = initConnection()
    globalWithMongo._mongoClientPromise = clientPromise
  } else {
    clientPromise = globalWithMongo._mongoClientPromise
    _useFallback = globalWithMongo._mongoUseFallback || false
  }
} else {
  clientPromise = initConnection()
}

// 更新全局状态以跟踪 fallback 模式
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoUseFallback?: boolean
  }
  globalWithMongo._mongoUseFallback = _useFallback

  // 异步更新全局状态
  clientPromise.then((client) => {
    globalWithMongo._mongoUseFallback = !client
  })
}

export async function getDb(): Promise<Db | null> {
  const client = await clientPromise
  if (!client) return null
  return client.db('job-tracker')
}

export async function isUsingFallback(): Promise<boolean> {
  const client = await clientPromise
  return !client
}

// LocalStorage fallback 操作
export async function readApplications<T>(): Promise<T[]> {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

export async function writeApplications<T>(data: T[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(data, null, 2))
}

export async function readResumes<T>(): Promise<T[]> {
  try {
    const data = await fs.readFile(RESUMES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

export async function writeResumes<T>(data: T[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(RESUMES_FILE, JSON.stringify(data, null, 2))
}

export async function getClient(): Promise<MongoClient | null> {
  return clientPromise
}

export default clientPromise
