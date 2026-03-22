# 简历投递管理系统

一个简单易用的求职管理工具，帮你记录和追踪简历投递情况，支持 OCR 智能识别职位信息。

## 📋 功能特点

- ✅ 简历投递记录管理
- ✅ 投递状态追踪（待处理、面试中、已录用、已拒绝等）
- ✅ **OCR 智能识别** - 上传职位截图，自动识别公司、职位、地点
- ✅ 数据可视化统计
- ✅ 响应式设计，支持手机端使用

## 🚀 快速开始（零基础教程）

### 第一步：准备工具

你需要安装以下软件（如果已经安装可以跳过）：

1. **Node.js** (必装) - 下载地址：https://nodejs.org/
   - 下载 LTS 版本，双击安装即可

2. **Git** (可选) - 用于克隆代码

### 第二步：获取项目代码

**方法A：使用 Git 克隆（推荐）**

打开终端（Mac 按 Command+空格，输入"终端"；Windows 按 Win+R，输入 cmd），输入：

```bash
git clone https://github.com/weiyingle1201/job-application-tracker.git
cd job-application-tracker
```

**方法B：直接下载压缩包**

1. 访问 https://github.com/weiyingle1201/job-application-tracker
2. 点击 "Code" → "Download ZIP"
3. 解压到任意文件夹

### 第三步：安装依赖

在项目文件夹内，打开终端，运行：

```bash
npm install
```

*等待安装完成，可能需要几分钟*

### 第四步：配置环境变量

这是最关键的一步！在项目根目录下创建 `.env.local` 文件，填入以下内容：

```env
# MongoDB 数据库连接（免费版）
MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/job-tracker

# 百度 OCR API（免费版）
BAIDU_OCR_API_KEY=你的百度OCR_API_KEY
BAIDU_OCR_SECRET_KEY=你的百度OCR_SECRET_KEY
```

---

## 📖 详细配置指南

### 一、MongoDB 配置（免费）

1. 访问 https://www.mongodb.com/cloud/atlas/register
2. 注册账号并登录
3. 点击 "Build a Database"
4. 选择 "FREE" 免费套餐，点击 "Create"
5. 选择地区（推荐选择离你近的地区），给集群起个名字
6. 创建数据库用户（记下用户名和密码）：
   - Username: 填一个用户名
   - Password: 填一个密码（点击 "Autogenerate Secure Password"）
7. 选择访问 IP：选择 "Allow Access from Anywhere"（0.0.0.0/0），点击 "Finish and Close"
8. 点击 "Connect" → 选择 "Connect your application"
9. 复制连接字符串，格式类似：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/
   ```
10. 替换 `<username>` 和 `<password>` 为你刚才设置的用户名和密码
11. 把这个字符串填入 `.env.local` 的 `MONGODB_URI`

### 二、百度 OCR 配置（免费）

1. 访问 https://cloud.baidu.com/product/ocr
2. 点击 "立即使用"，登录/注册百度账号
3. 进入控制台：https://console.bce.baidu.com/ai/#/ai/ocr/app/list
4. 点击 "创建应用"
5. 填写应用信息（随意填写即可）：
   - 应用名称：随便填，如 "求职助手"
   - 应用类型：选择 "未提供"
   - 应用描述：随便填，如 "个人求职管理"
6. 点击 "立即创建"
7. 创建成功后，查看应用详情，获取：
   - **API Key** (Client ID)
   - **Secret Key** (Client Secret)
8. 将这两个值分别填入 `.env.local` 的对应位置

---

### 第五步：启动项目

配置好 `.env.local` 后，在终端运行：

```bash
npm run dev
```

看到类似以下提示表示启动成功：

```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
  - Environments: .env.local
  Ready in xxx ms
```

### 第六步：开始使用

打开浏览器，访问：http://localhost:3000

---

## 📱 使用说明

### 添加投递记录

1. 点击 "新增申请" 按钮
2. 手动填写或上传职位截图（OCR 自动识别）
3. 填写公司、职位、地点等信息
4. 保存记录

### 查看统计

在首页可以看到：
- 投递总数
- 各状态的数量
- 投递趋势图

---

## ❓ 常见问题

**Q: 启动报错 "MONGODB_URI not found" 怎么办？**

A: 检查 `.env.local` 文件是否在项目根目录，文件名是否正确（注意前面有点）

**Q: MongoDB 连接失败怎么办？**

A: 检查：
1. 连接字符串格式是否正确
2. 用户名和密码是否正确
3. 网络是否通畅
4. 如果连接超时，可以尝试更换连接字符串中的地区

**Q: OCR 识别失败怎么办？**

A: 检查百度 OCR 的 API Key 和 Secret Key 是否正确

**Q: 没有配置 MongoDB/OCR 能用吗？**

A: 可以！项目支持本地文件模式（localStorage），不配置也能正常使用基础功能

**Q: 如何停止项目？**

A: 在终端按 `Ctrl + C` 即可

---

## 🛠️ 技术栈

- Next.js 16
- React 19
- MongoDB
- 百度 OCR
- Tailwind CSS
- shadcn/ui

## 📄 License

MIT

---

**遇到问题？** 欢迎提 Issue：https://github.com/weiyingle1201/job-application-tracker/issues
