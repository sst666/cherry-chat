# CherryChat 🌸

一个轻量的 AI 对话应用，支持 Claude、GPT、Gemini、DeepSeek 等主流大模型，自带聊天历史管理、图片/PDF 附件、本地存储。

---

## 功能特性

- 🤖 **多模型支持** — 支持 Claude、GPT-4o、Gemini、DeepSeek 等 200+ 模型
- 📎 **附件支持** — 支持上传图片（自动转 base64）和 PDF（自动渲染为图片）
- ⭐ **常用模型** — 可收藏常用模型，支持最近使用记录快速切换
- 💬 **对话管理** — 本地存储聊天历史，支持搜索、重命名、删除
- 🔄 **编辑与重新生成** — 可编辑已发送消息，重新生成 AI 回复
- 📱 **移动端适配** — 响应式布局，完美适配手机和桌面浏览器
- 🎨 **Markdown 渲染** — AI 回复支持代码高亮、列表、表格等格式

---

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/sst666/cherry-chat.git
cd cherry-chat

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录，直接部署该目录即可。

---

## 部署指南（六种方案）

### 方案一：Vercel（推荐，最简单）

**无需本地打包，零配置上线。**

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 在项目根目录执行，按提示操作：
   ```bash
   vercel
   ```

3. 首次部署后，每次更新执行：
   ```bash
   vercel --prod
   ```

**懒人方式：** 直接访问 [vercel.com/drop](https://vercel.com/drop)，把 `dist` 文件夹拖进去，自动部署完成。

---

### 方案二：Netlify（推荐，适合静态网站）

**免费 CDN 全球加速，适合静态页面部署。**

1. 安装 Netlify CLI：
   ```bash
   npm i -g netlify-cli
   ```

2. 部署：
   ```bash
   netlify deploy --dir=dist --prod
   ```

**懒人方式：** 访问 [app.netlify.com/drop](https://app.netlify.com/drop)，拖入 `dist` 文件夹即可。

---

### 方案三：Cloudflare Pages（免费、全球 CDN）

**Cloudflare 提供免费静态托管，国内访问速度快。**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **创建项目**
3. 连接到 GitHub（自动部署）或手动上传 `dist` 文件夹

---

### 方案四：GitHub Pages（免费，适合开源项目）

**利用 GitHub 免费托管，适合开源项目展示。**

1. 修改 `vite.config.ts`，确保基础路径配置正确：
   ```ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: './',   // 关键：相对路径构建
   })
   ```

2. 构建项目：
   ```bash
   npm run build
   ```

3. 在 GitHub 仓库中：
   - 进入 **Settings** → **Pages**
   - **Source** 选择 `Deploy from a branch`
   - **Branch** 选择 `main`，目录选 `/ (root)`
   - 点击 Save，等待几分钟后访问 `https://sst666.github.io/cherry-chat`

---

### 方案五：自建服务器（Nginx）

**适合有云服务器的用户，数据完全自主可控。**

```bash
# 1. 构建项目
npm run build

# 2. 将构建产物复制到 Nginx 目录
sudo cp -r dist/* /usr/share/nginx/html/

# 3. 重启 Nginx
sudo systemctl restart nginx

# 4. 开放防火墙（可选）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

然后访问 `http://你的服务器IP`

**Docker 方式（更简单）：**
```bash
# 构建
npm run build

# 启动容器
docker run -d -p 8080:80 --name cherry-chat -v ./dist:/usr/share/nginx/html nginx:alpine
```

访问 `http://localhost:8080`

---

### 方案六：Docker 容器部署（适合有 Docker 的环境）

**容器化部署，跨平台运行，环境隔离。**

```bash
# 1. 创建 Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
EOF

# 2. 构建镜像
docker build -t cherry-chat .

# 3. 运行容器
docker run -d -p 8080:80 --name cherry-chat cherry-chat
```

访问 `http://localhost:8080`

---

## 二次开发指南

### 项目结构

```
cherry-chat/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatArea.tsx       # 聊天主区域
│   │   ├── InputArea.tsx      # 输入框组件（模型选择、附件上传）
│   │   ├── MessageBubble.tsx   # 单条消息（复制/编辑/删除/重新生成）
│   │   ├── MessageList.tsx     # 消息列表
│   │   ├── ModelSelector.tsx   # 模型选择下拉框
│   │   ├── SettingsPanel.tsx   # 设置弹窗（API配置）
│   │   └── Sidebar.tsx        # 侧边栏（对话列表）
│   ├── context/
│   │   └── ChatContext.tsx    # 全局状态管理（useReducer）
│   ├── hooks/
│   │   └── usePdf.ts          # PDF 渲染 hook（pdf.js）
│   ├── types.ts               # TypeScript 类型定义
│   ├── App.tsx               # 根组件
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式（TailwindCSS）
├── public/                   # 静态资源
├── dist/                    # 构建产物（部署用）
├── package.json
└── vite.config.ts
```

### 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式 | TailwindCSS |
| 图标 | Lucide React |
| PDF 渲染 | pdf.js（CDN worker）|
| 状态管理 | React useReducer + Context |
| 数据存储 | 浏览器 localStorage |

### 核心状态结构

状态集中在 `ChatContext.tsx`，通过 `useReducer` 管理：

```typescript
interface State {
  settingsOpen: boolean;
  config: ApiConfig;              // API 地址、Key、默认模型
  conversations: Conversation[];  // 所有对话
  currentConvId: string | null;   // 当前对话 ID
  recentModels: string[];         // 最近使用模型（最多8个）
  favoriteModels: string[];       // 收藏的常用模型
  models: string[];               // 模型列表
  isLoading: boolean;             // 是否正在等待回复
  searchQuery: string;            // 侧边栏搜索关键词
  inputText: string;              // 编辑中的消息文本
}
```

### 添加新的 API Provider

编辑 `src/context/ChatContext.tsx` 的 `sendMessage` 函数即可。目前使用 OpenAI 兼容格式：

```typescript
const res = await fetch(`${endpoint}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model,                          // 模型名称
    max_tokens: 4096,              // 最大 token 数
    messages: apiMessages,         // 消息历史
  }),
});

const data = await res.json();
const content = data.choices[0].message.content;
```

### 修改主题颜色

主色定义为 `#4f46e5`（靛蓝），在以下位置修改：

- `src/index.css` 中的 CSS 变量
- `tailwind.config.js` 中的 TailwindCSS 配置
- 各组件内联样式中的十六进制值

### 添加新功能步骤

1. **状态管理** — 在 `State` 接口添加字段，在 reducer 中添加对应 Action
2. **Context** — 将新函数/值添加到 `ChatContextValue` 接口和 `ChatProvider` 的 value
3. **组件** — 在对应组件中使用 `useChatContext()` 获取状态或调用方法

### 添加消息附件类型

编辑 `src/types.ts`：

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];              // 图片 base64 数组
  attachments?: Attachment[];      // 可扩展其他附件类型
  timestamp: number;
}
```

---

## API 配置说明

### 设置步骤

1. 打开应用，点击右上角 **Settings**（设置）按钮
2. 填写 **API 地址**，例如：
   - `https://api.bywlai.cn`（第三方代理）
   - `https://api.openai.com`（OpenAI 官方）
   - `https://api.anthropic.com`（Anthropic 官方）
3. 填写 **API Key**（密钥）
4. 点击「**获取模型列表**」同步可用模型
5. 选择**默认模型**，点击保存

### 关于 API 代理

CherryChat 本身不提供 AI 模型服务，需要自行配置 API 代理。支持：

- ✅ OpenAI 官方 API
- ✅ Anthropic API（Claude 系列）
- ✅ 第三方兼容代理（如 OneAPI、NewAPI 等）
- ✅ 自建代理服务

只要是兼容 OpenAI `v1/chat/completions` 格式的接口均可使用。

---

## 注意事项

- **数据存储** — 所有聊天记录保存在浏览器 `localStorage`，换浏览器或清除缓存会丢失，建议定期备份
- **附件大小** — `localStorage` 有 5-10MB 限制（不同浏览器不同），大量使用图片/PDF 时建议定期点击「清除图片和文件缓存」
- **隐私** — 数据完全存储在本地，不经过任何第三方服务器

---

## License

MIT
