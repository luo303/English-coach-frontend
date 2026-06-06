# English Coach API 文档

## 认证模块 (Auth)

### POST /api/v1/auth/login - 匿名登录

**请求体：**
```json
{
  "deviceId": "device-123",
  "nickname": "用户昵称"
}
```

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": { "seconds": 1717689600, "nanos": 0 },
    "user": {
      "userId": "user-123",
      "loginType": "anonymous",
      "nickname": "用户昵称",
      "level": "beginner",
      "createdAt": { "seconds": 1717603200, "nanos": 0 },
      "updatedAt": { "seconds": 1717603200, "nanos": 0 }
    }
  }
}
```

### GET /api/v1/auth/me - 获取当前用户信息

**请求头：** `Authorization: Bearer {accessToken}`

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "userId": "user-123",
    "loginType": "anonymous",
    "nickname": "用户昵称",
    "level": "beginner",
    "createdAt": { "seconds": 1717603200, "nanos": 0 },
    "updatedAt": { "seconds": 1717603200, "nanos": 0 }
  }
}
```

---

## 场景模块 (Scenario)

### GET /api/v1/personas - 获取角色列表

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": [
    {
      "personaId": "persona-1",
      "name": "Shop Assistant",
      "nameZh": "店员",
      "rolePrompt": "You are a friendly shop assistant...",
      "replyStyle": "casual",
      "maxReplyWords": 50
    }
  ]
}
```

### GET /api/v1/scenarios - 获取场景列表

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": [
    {
      "scenarioId": "scenario-1",
      "name": "Shopping",
      "nameZh": "购物",
      "difficulty": "easy",
      "icon": "shopping_cart",
      "description": "Practice shopping conversations",
      "defaultPersonaId": "persona-1",
      "maxReplyWords": 50,
      "maxDurationMinutes": 10,
      "correctionMode": "immediate"
    }
  ]
}
```

### GET /api/v1/scenarios/{scenarioId} - 获取场景详情

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "scenarioId": "scenario-1",
    "name": "Shopping",
    "nameZh": "购物",
    "difficulty": "easy",
    "icon": "shopping_cart",
    "description": "Practice shopping conversations",
    "targetSkills": ["vocabulary", "pronunciation"],
    "defaultPersona": {
      "personaId": "persona-1",
      "name": "Shop Assistant",
      "nameZh": "店员",
      "rolePrompt": "You are a friendly shop assistant...",
      "replyStyle": "casual",
      "maxReplyWords": 50
    },
    "openingPrompt": "Welcome to our store! How can I help you today?",
    "maxReplyWords": 50,
    "maxDurationMinutes": 10,
    "correctionMode": "immediate"
  }
}
```

---

## 练习会话模块 (Practice Session)

### POST /api/v1/practice-sessions - 创建练习会话

**请求体：**
```json
{
  "scenarioId": "scenario-1",
  "personaId": "persona-1",
  "correctionMode": "immediate"
}
```

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "sessionId": "session-123",
    "scenarioId": "scenario-1",
    "personaId": "persona-1",
    "status": "active",
    "correctionMode": "immediate",
    "startedAt": { "seconds": 1717689600, "nanos": 0 },
    "endedAt": null,
    "durationSeconds": 0,
    "turnCount": 0,
    "firstVoiceLatencyMs": null,
    "networkLatencyMs": null,
    "overallScore": null,
    "reportStatus": "pending",
    "createdAt": { "seconds": 1717689600, "nanos": 0 },
    "updatedAt": { "seconds": 1717689600, "nanos": 0 }
  }
}
```

### GET /api/v1/practice-sessions/{sessionId} - 获取会话详情

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "sessionId": "session-123",
    "scenarioId": "scenario-1",
    "personaId": "persona-1",
    "status": "active",
    "correctionMode": "immediate",
    "startedAt": { "seconds": 1717689600, "nanos": 0 },
    "endedAt": null,
    "durationSeconds": 120,
    "turnCount": 5,
    "firstVoiceLatencyMs": 1500,
    "networkLatencyMs": 200,
    "overallScore": null,
    "reportStatus": "pending",
    "createdAt": { "seconds": 1717689600, "nanos": 0 },
    "updatedAt": { "seconds": 1717689720, "nanos": 0 }
  }
}
```

### POST /api/v1/practice-sessions/{sessionId}/end - 结束会话

**响应：** 同获取会话详情

### GET /api/v1/practice-sessions/{sessionId}/turns - 获取对话轮次

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": [
    {
      "turnId": "turn-1",
      "sessionId": "session-123",
      "speaker": "user",
      "transcript": "Hello, I want to buy an apple.",
      "audioUrl": "https://cdn.example.com/audio/turn-1.mp3",
      "startMs": 0,
      "endMs": 3000,
      "seq": 1,
      "createdAt": { "seconds": 1717689600, "nanos": 0 }
    },
    {
      "turnId": "turn-2",
      "sessionId": "session-123",
      "speaker": "assistant",
      "transcript": "Sure! We have red and green apples. Which one do you prefer?",
      "audioUrl": "https://cdn.example.com/audio/turn-2.mp3",
      "startMs": 3500,
      "endMs": 7000,
      "seq": 2,
      "createdAt": { "seconds": 1717689603, "nanos": 0 }
    }
  ]
}
```

### GET /api/v1/practice-sessions - 获取历史会话列表

**查询参数：**
- `status`: 会话状态 (active/completed)
- `page`: 页码 (默认0)
- `size`: 每页数量 (默认20)

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "page": {
      "content": [
        {
          "sessionId": "session-123",
          "scenarioId": "scenario-1",
          "personaId": "persona-1",
          "status": "completed",
          "correctionMode": "immediate",
          "startedAt": { "seconds": 1717689600, "nanos": 0 },
          "endedAt": { "seconds": 1717690200, "nanos": 0 },
          "durationSeconds": 600,
          "turnCount": 15,
          "firstVoiceLatencyMs": 1500,
          "networkLatencyMs": 200,
          "overallScore": 85.5,
          "reportStatus": "completed",
          "createdAt": { "seconds": 1717689600, "nanos": 0 },
          "updatedAt": { "seconds": 1717690200, "nanos": 0 }
        }
      ],
      "pageable": {},
      "total": 1
    }
  }
}
```

---

## 报告模块 (Report)

### GET /api/v1/reports/{sessionId} - 获取练习报告

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {
    "reportId": "report-123",
    "sessionId": "session-123",
    "status": "completed",
    "generatedAt": { "seconds": 1717690200, "nanos": 0 },
    "overallScore": 85.5,
    "durationSeconds": 600,
    "turnCount": 15,
    "issueCount": 3,
    "scores": {
      "pronunciation": 80.0,
      "fluency": 85.0,
      "grammar": 90.0,
      "scenarioCompletion": 88.0
    },
    "scoreFormula": "overall = pronunciation * 0.30 + fluency * 0.20 + grammar * 0.25 + scenarioCompletion * 0.25",
    "summary": "Overall good performance. Focus on pronunciation of 'th' sounds.",
    "dataSources": ["audio", "transcript"],
    "conversationHighlights": [
      {
        "speaker": "user",
        "quote": "I want to buy an apple.",
        "comment": "Good use of simple sentence structure."
      }
    ],
    "pronunciationIssues": [
      {
        "word": "apple",
        "original": "æpəl",
        "corrected": "æp.əl",
        "issue": "stress",
        "explanation": "The stress should be on the first syllable.",
        "practiceText": "Practice: apple, apple, apple"
      }
    ],
    "grammarIssues": [],
    "expressionUpgrades": [
      {
        "original": "I want to buy",
        "better": "I'd like to buy",
        "reason": "More polite and natural expression."
      }
    ],
    "recommendedSentences": [
      "Could you tell me the price?",
      "Do you have any discounts?"
    ],
    "nextTopics": [
      {
        "scenarioId": "scenario-2",
        "title": "Restaurant Ordering",
        "difficulty": "easy",
        "reason": "Similar vocabulary and sentence patterns."
      }
    ],
    "mock": false
  }
}
```

### POST /api/v1/reports/{sessionId}/regenerate - 重新生成报告

**请求体：**
```json
{
  "reason": "发音识别不准确"
}
```

**响应：** 同获取报告

---

## 实时模拟与真人联调模块 (Realtime)

### POST /api/v1/dev/realtime/practice-sessions/{sessionId}/simulate-audio-turn - 模拟音频轮次

> 用途：脚本/后端联调使用。需要启动时开启 dev simulation 配置；正式客户端优先走下方三路 WebSocket。

**请求头：** `Authorization: Bearer {accessToken}`

**请求体：**
```json
{
  "audioFilePath": "C:/Users/13435/Desktop/demo/This is an apple.mp3",
  "audioBase64": "base64-audio-content",
  "transcript": "This is an apple",
  "turnClientId": "turn-1",
  "pronunciationVisible": true,
  "grammarVisible": true
}
```

**说明：**
- `transcript` 优先级最高，用于临时真人/脚本验证时直接指定用户文本。
- `audioBase64` 可选；真实供应商链路需要后端适配对应音频格式。
- `pronunciationVisible=false` 或 `grammarVisible=false` 只隐藏前端提示；后台仍处理并用于报告。

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": [
    {
      "type": "audio_chunk_ack",
      "serverSeq": 1,
      "sessionId": "session-123",
      "createdAt": "2026-06-06T10:00:00Z",
      "payload": {
        "turnClientId": "turn-1",
        "accepted": true,
        "seq": 1,
        "chunkBytes": 1280,
        "totalBytes": 1280,
        "finalChunk": true
      }
    },
    {
      "type": "transcript_final",
      "serverSeq": 2,
      "sessionId": "session-123",
      "createdAt": "2026-06-06T10:00:01Z",
      "payload": {
        "turnClientId": "turn-1",
        "turnId": "turn-user-1",
        "speaker": "user",
        "text": "This is an apple",
        "mock": false,
        "latencyMs": 830
      }
    },
    {
      "type": "ai_reply_delta",
      "serverSeq": 3,
      "sessionId": "session-123",
      "payload": {
        "turnId": "turn-ai-1",
        "text": "Nice sentence. Can you tell me what kind of apples you like?",
        "mock": false,
        "latencyMs": 830,
        "endToEndAudio": true,
        "isFirstSpeakableChunk": true,
        "isFinal": true
      }
    },
    {
      "type": "ai_audio_chunk",
      "serverSeq": 4,
      "sessionId": "session-123",
      "payload": {
        "turnId": "turn-ai-1",
        "seq": 1,
        "format": "pcm_s16le",
        "sampleRate": 24000,
        "durationMs": 1200,
        "data": "base64-audio-content",
        "audioUrl": "",
        "mock": false,
        "latencyMs": 830,
        "isFinal": true,
        "endToEndAudio": true
      }
    },
    {
      "type": "pronunciation_hint",
      "serverSeq": 5,
      "sessionId": "session-123",
      "payload": {
        "word": "apple",
        "phoneme": "/ˈæpəl/",
        "message": "Keep the first syllable clear.",
        "severity": "low",
        "display": true,
        "backendProcessed": true,
        "mock": false,
        "scores": {
          "pronunciation": 86.0,
          "fluency": 82.0,
          "completeness": 90.0
        }
      }
    },
    {
      "type": "grammar_hint",
      "serverSeq": 6,
      "sessionId": "session-123",
      "payload": {
        "original": "apples are good for our heath",
        "quickFix": "apples are good for our health",
        "explanation": "Use health, not heath.",
        "severity": "medium",
        "displayMode": "floating_hint",
        "display": true,
        "backendProcessed": true,
        "mock": false,
        "grammarScore": 82.0
      }
    },
    {
      "type": "score_snapshot",
      "serverSeq": 7,
      "sessionId": "session-123",
      "payload": {
        "overallScore": 84.5,
        "correctionCount": 1,
        "pronunciationIssueCount": 1,
        "formula": "overall = pronunciation * 0.30 + fluency * 0.20 + grammar * 0.25 + scenarioCompletion * 0.25"
      }
    }
  ]
}
```

### Browser 真人联调页面

临时页面位于：

```text
script_home/three-ws-live-demo.html
```

用途：在浏览器里模拟真实前端页面，同时连接三条 WebSocket，支持麦克风录音、手动/浏览器自动 transcript、两轮真人对话、实时查看 dialogue/pronunciation/correction 结果。

使用方式：
1. 启动后端，例如 `http://localhost:8585`。
2. 打开 `script_home/three-ws-live-demo.html`。
3. 页面 `Base URL` 填后端地址。
4. 点击 `登录 + 创建 Session + 连接三条 WS`。
5. 点击 `Coach 先发起聊天`。
6. 每轮：`开始录音` -> 真人说英语 -> `停止录音` -> 确认 transcript -> `发送本轮到三路处理`。
7. 查看三个面板：Dialogue / Pronunciation / Correction。

注意：浏览器 `MediaRecorder` 常见输出是 `webm/opus`，不一定是火山端到端实时语音最理想的 `16k mono pcm_s16le`。真实供应商是否走通以事件 payload 中的 `mock` 字段为准：
- `mock=false`：真实供应商链路返回。
- `mock=true`：后端 fallback/mock 返回。

---

## WebSocket 实时练习

### 三路设计

当前实时练习采用三条 WS 结果通道，客户端只需要向 `/dialogue` 应用目的地发送事件，后端会把同一轮用户输入分别处理后推送到三条 topic：

| 通道 | 职责 | 供应商路线 |
|---|---|---|
| `/dialogue` | 用户音频/文本 -> 实时对话 -> transcript、AI 文本、AI 音频、分数快照 | 豆包/火山端到端实时语音大模型；失败 fallback mock |
| `/pronunciation` | 同一轮用户音频 + transcript/ref_text -> 发音测评、词级问题、音标建议 | 腾讯智聆 SOE；失败 fallback mock |
| `/correction` | transcript -> 语法/表达纠错、quick fix、解释 | 豆包文本纠错；失败 fallback mock |

### STOMP 连接地址

默认端口按项目规范为 `8149`；本地端口占用时可使用启动时指定的端口，例如 `8585`。

- **对话连接**: `ws://localhost:8149/ws/v1/practice-sessions/{sessionId}/dialogue`
- **发音连接**: `ws://localhost:8149/ws/v1/practice-sessions/{sessionId}/pronunciation`
- **纠错连接**: `ws://localhost:8149/ws/v1/practice-sessions/{sessionId}/correction`

> 三个 endpoint 都是 STOMP over WebSocket endpoint。订阅 topic 后，客户端实际发送消息统一发到 `/app/practice-sessions/{sessionId}/dialogue`。

### 订阅 Topic

```text
/topic/practice-sessions/{sessionId}/dialogue
/topic/practice-sessions/{sessionId}/pronunciation
/topic/practice-sessions/{sessionId}/correction
```

### 发送目的地

```text
/app/practice-sessions/{sessionId}/dialogue
```

### 客户端发送消息格式

```json
{
  "type": "recording_start",
  "clientSeq": 1,
  "sessionId": "session-123",
  "sentAt": "2026-06-06T10:00:00Z",
  "payload": {
    "pronunciationVisible": true,
    "grammarVisible": true
  }
}
```

### 客户端事件类型

#### recording_start - 开始录音/进入实时房间

```json
{
  "type": "recording_start",
  "clientSeq": 1,
  "sessionId": "session-123",
  "sentAt": "2026-06-06T10:00:00Z",
  "payload": {
    "pronunciationVisible": true,
    "grammarVisible": true
  }
}
```

服务端在 `/topic/.../dialogue` 返回 `session_ready`。

#### audio_chunk - 上传用户音频分片

```json
{
  "type": "audio_chunk",
  "clientSeq": 2,
  "sessionId": "session-123",
  "sentAt": "2026-06-06T10:00:01Z",
  "payload": {
    "turnClientId": "turn-1",
    "seq": 1,
    "audioFormat": "pcm_s16le",
    "sampleRate": 16000,
    "channels": 1,
    "isFinal": false,
    "data": "base64-audio-chunk"
  }
}
```

服务端在 `/topic/.../dialogue` 返回 `audio_chunk_ack`。

#### user_turn_end - 结束一轮用户输入并触发三路处理

```json
{
  "type": "user_turn_end",
  "clientSeq": 3,
  "sessionId": "session-123",
  "sentAt": "2026-06-06T10:00:04Z",
  "payload": {
    "turnClientId": "turn-1",
    "transcript": "This is an apple, I like apples.",
    "pronunciationVisible": true,
    "grammarVisible": true,
    "startMs": 0,
    "endMs": 3000
  }
}
```

说明：
- `transcript` 在真实 `/dialogue` 链路中可由豆包/火山 ASR 事件返回；在脚本/浏览器临时验证中可手动传入作为 fallback。
- 后端收到 `user_turn_end` 后，会输出 dialogue、pronunciation、correction 三类事件。

#### ping - 心跳/延迟测量

```json
{
  "type": "ping",
  "clientSeq": 4,
  "sessionId": "session-123",
  "sentAt": "2026-06-06T10:00:05Z",
  "payload": {
    "clientTime": "2026-06-06T10:00:05Z"
  }
}
```

服务端返回 `pong`，包含 `estimatedRttMs`。

#### session_control - 控制会话

```json
{
  "type": "session_control",
  "clientSeq": 5,
  "sessionId": "session-123",
  "sentAt": "2026-06-06T10:00:30Z",
  "payload": {
    "action": "end"
  }
}
```

服务端返回 `session_state`，并将会话置为 completed / report generating。

### 服务端推送消息格式

```json
{
  "type": "ai_reply_delta",
  "serverSeq": 3,
  "sessionId": "session-123",
  "createdAt": "2026-06-06T10:00:04Z",
  "payload": {
    "turnId": "turn-ai-1",
    "text": "Nice sentence. What fruit do you like most?",
    "mock": false,
    "latencyMs": 830,
    "endToEndAudio": true,
    "isFirstSpeakableChunk": true,
    "isFinal": true
  }
}
```

### 服务端事件类型

| Topic | type | 说明 |
|---|---|---|
| dialogue | `session_ready` | 房间准备完成，返回音频格式、会话限制、显示选项 |
| dialogue | `pong` | 心跳响应和 RTT 估计 |
| dialogue | `audio_chunk_ack` | 音频分片接收确认 |
| dialogue | `transcript_final` | 用户最终 transcript |
| dialogue | `ai_reply_delta` | AI 文本回复；目前通常一次性 final 返回 |
| dialogue | `ai_audio_chunk` | AI 音频分片或 mock 音频 URL |
| dialogue | `score_snapshot` | 本轮后综合分数快照 |
| dialogue | `session_state` | 会话状态变化 |
| dialogue | `error` | 可恢复或不可恢复错误 |
| pronunciation | `pronunciation_hint` | 发音建议、音标、词级问题和 pronunciation/fluency/completeness 分数 |
| correction | `grammar_hint` | 语法/表达纠错、quick fix、解释、严重程度 |

### 真实供应商链路判断

每个核心事件 payload 会包含 `mock` 字段：

```json
{
  "type": "pronunciation_hint",
  "payload": {
    "mock": false
  }
}
```

- `/dialogue` 的 `mock=false` 表示走豆包/火山端到端实时语音。
- `/pronunciation` 的 `mock=false` 表示走腾讯智聆 SOE。
- `/correction` 的 `mock=false` 表示走豆包文本纠错。

同时可通过开发接口查询 provider call logs：

```http
GET /api/v1/dev/provider-call-logs?sessionId={sessionId}
Authorization: Bearer {accessToken}
```

期望 operation 至少包含：

```text
exchange
pronunciation_assessment
grammar_correction
```

---

## 通用说明

### 响应结构

所有接口返回统一格式：
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": {}
}
```

### 认证方式

大部分接口需要在请求头中携带token：
```
Authorization: Bearer {accessToken}
```

### 时间格式

所有时间字段使用Unix时间戳格式：
```json
{
  "seconds": 1717689600,
  "nanos": 0
}
```
