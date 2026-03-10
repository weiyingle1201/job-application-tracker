import { generateText, Output } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { image } = await req.json()

  if (!image) {
    return Response.json({ error: "No image provided" }, { status: 400 })
  }

  const result = await generateText({
    model: "openai/gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: image,
          },
          {
            type: "text",
            text: `这是一张招聘岗位的截图。请仔细分析图片内容，提取以下信息：

1. 公司名称（company）
2. 职位名称（position）
3. 工作地点/base（location）
4. 职位描述/JD（jobDescription）- 尽可能完整提取职位要求、工作职责等内容

请以 JSON 格式返回，如果某项信息无法从图片中识别出，请返回空字符串。

注意：
- 公司名称通常在页面顶部或明显位置
- 职位名称可能包含"实习"、"产品经理"、"产品运营"等关键词
- 工作地点可能标注为"北京"、"上海"、"深圳"等城市
- JD部分请尽可能完整提取，包括任职要求、岗位职责等`,
          },
        ],
      },
    ],
    output: Output.object({
      schema: z.object({
        company: z.string().nullable(),
        position: z.string().nullable(),
        location: z.string().nullable(),
        jobDescription: z.string().nullable(),
      }),
    }),
  })

  return Response.json({
    data: result.output,
  })
}
