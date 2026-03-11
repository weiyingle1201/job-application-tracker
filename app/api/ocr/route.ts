import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 百度OCR配置
const BAIDU_OCR_API_KEY = process.env.BAIDU_OCR_API_KEY
const BAIDU_OCR_SECRET_KEY = process.env.BAIDU_OCR_SECRET_KEY

// 获取百度OCR访问令牌
async function getAccessToken(): Promise<string> {
  if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
    throw new Error('Baidu OCR credentials not configured')
  }

  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_OCR_API_KEY}&client_secret=${BAIDU_OCR_SECRET_KEY}`
  )

  const data = await response.json()

  if (!data.access_token) {
    throw new Error('Failed to get access token from Baidu OCR')
  }

  return data.access_token
}

// 调用百度通用文字识别API
async function recognizeText(
  accessToken: string,
  imageBase64: string
): Promise<any> {
  const response = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `image=${encodeURIComponent(imageBase64)}`,
    }
  )

  const data = await response.json()
  return data
}

// 从识别的文本中提取职位信息
function extractJobInfo(text: string): {
  company: string
  position: string
  location: string
  jobDescription: string
} {
  const lines = text.split('\n').filter((line) => line.trim())

  // 常见的职位名称模式
  const positionPatterns = [
    /产品经理|产品运营|产品实习生|产品助理|PM/i,
    /前端工程师|后端工程师|全栈工程师|开发工程师|软件工程师/i,
    /数据分析|数据分析师|算法工程师/i,
    /运营|市场|销售|人力资源|HR|行政/i,
    /设计师|UI|UX|设计实习生/i,
  ]

  // 常见的城市模式
  const locationPatterns = [
    /北京|上海|深圳|广州|杭州|成都|武汉|南京|西安|重庆|天津|苏州|长沙|郑州/i,
  ]

  let company = ''
  let position = ''
  let location = ''
  let jobDescription = ''

  // 第一行通常包含公司名称或职位
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // 如果第一行看起来像公司名（不是职位描述的一部分）
    if (firstLine.length < 50 && !positionPatterns.some(p => p.test(firstLine))) {
      company = firstLine
    }
  }

  // 查找职位名称
  for (const line of lines) {
    if (!position) {
      for (const pattern of positionPatterns) {
        const match = line.match(pattern)
        if (match) {
          position = line.trim()
          break
        }
      }
    }
  }

  // 查找地点
  for (const line of lines) {
    if (!location) {
      for (const pattern of locationPatterns) {
        const match = line.match(pattern)
        if (match) {
          location = line.trim()
          break
        }
      }
    }
  }

  // 构建职位描述（排除公司名、职位名和地点后的内容）
  const skipPatterns = [
    company,
    position,
    location,
    '职位描述',
    '岗位职责',
    '任职要求',
    '工作内容',
    '职位信息',
    '我们希望你',
  ].filter(Boolean).map(s => s.toLowerCase())

  jobDescription = lines
    .filter(line => {
      const trimmedLine = line.trim().toLowerCase()
      return trimmedLine.length > 5 &&
        !skipPatterns.some(skip => trimmedLine.includes(skip.toLowerCase()))
    })
    .join('\n')
    .trim()

  return {
    company: company || '',
    position: position || '',
    location: location || '',
    jobDescription: jobDescription || text,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // 获取访问令牌
    const accessToken = await getAccessToken()

    // 调用百度OCR
    const ocrResult = await recognizeText(accessToken, image)

    if (!ocrResult.words_result || ocrResult.error_code) {
      throw new Error(
        ocrResult.error_msg || 'Failed to recognize text from image'
      )
    }

    // 提取文本
    const fullText = ocrResult.words_result
      .map((item: any) => item.words)
      .join('\n')

    // 提取职位信息
    const jobInfo = extractJobInfo(fullText)

    return NextResponse.json({
      data: {
        company: jobInfo.company || null,
        position: jobInfo.position || null,
        location: jobInfo.location || null,
        jobDescription: jobInfo.jobDescription || null,
      },
      rawText: fullText,
    })
  } catch (error) {
    console.error('Error in OCR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OCR failed' },
      { status: 500 }
    )
  }
}
