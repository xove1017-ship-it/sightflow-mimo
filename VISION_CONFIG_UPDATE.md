# 视觉模型配置自定义功能

## 概述
本次更新为 SightFlow Desktop Agent 添加了视觉模型（Vision Model）和 Base URL 的自定义配置功能，使用户可以自由选择不同的视觉模型服务商。

## 技术要领

### 1. 架构设计
- **前端 (React)**：在设置界面添加可编辑的模型名称和 Base URL 输入框
- **后端 (Electron Main)**：扩展 `AppSettings.vision` 接口，支持 `baseUrl` 和 `model` 字段
- **核心层 (RPADevice)**：修改 `setApiKey` 方法，透传模型和 URL 参数到 AI Client

### 2. 关键改动

#### 前端 (App.tsx)
- 新增 `visionBaseUrl` 和 `visionModel` 状态
- 设置界面输入框从 `disabled` 改为可编辑
- 保存时将三个字段一起写入配置
- 测试连接时传递完整参数

#### 后端 (main/index.ts)
- `AppSettings.vision` 接口新增 `baseUrl?` 和 `model?`
- `normalizeSettings` 函数解析时包含新字段
- `engine:testConnection` 使用动态配置而非硬编码
- `buildDevice` 调用 `setApiKey` 时透传 model 和 baseURL
- Provider manifest 加载失败时尝试从 URL 重新获取

#### 核心层 (rpa-device.ts)
- `setApiKey(apiKey, model?, baseURL?)` 签名扩展
- 将参数透传给 `AIClient` 构造函数

#### 小米 Mimo Provider
- 新增 `manifest.json` 声明 `model` 和 `baseUrl` 配置字段
- `provider.bundle.js` 使用配置值而非硬编码

### 3. 配置流程
1. 用户在设置界面填写 API Key
2. 输入视觉模型名称（如 `mimo-v2.5`）
3. 输入 Base URL（如 `https://api.xiaomimimo.com/v1`）
4. 点击"保存视觉配置"
5. 点击"测试连接"验证配置

### 4. 兼容性
- 默认值保持原有硬编码（火山方舟 doubao 模型）
- 旧配置文件自动兼容，缺失字段使用默认值
- 内置豆包 Provider 不受影响

## 操作步骤

### 安装小米 Mimo Provider
1. 下载 `resources/providers/xiaomi-mimo/` 目录
2. 在设置界面点击"智能体"标签
3. 点击"从 URL 安装"，输入 manifest.json 的本地路径
4. 填写 API Key、模型名称、Base URL
5. 点击"保存配置"和"启用此智能体"

### 使用自定义视觉模型
1. 打开设置界面
2. 在"基础配置"中填写：
   - API Key：你的模型服务商密钥
   - 视觉模型：模型名称（如 `mimo-v2.5`）
   - 视觉 Base URL：API 地址
3. 点击"保存视觉配置"
4. 点击"测试连接"验证
5. 返回主界面启动引擎
