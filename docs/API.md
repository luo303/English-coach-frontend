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

## 实时模拟模块 (Realtime)

### POST /api/v1/dev/realtime/practice-sessions/{sessionId}/simulate-audio-turn - 模拟音频轮次

**请求体：**
```json
{
  "audioFilePath": "/path/to/audio.mp3",
  "transcript": "Hello, I want to buy an apple.",
  "turnClientId": "turn-1",
  "pronunciationVisible": true,
  "grammarVisible": true
}
```

**响应：**
```json
{
  "code": 200,
  "info": "success",
  "requestId": "req-xxx",
  "data": [
    {
      "type": "assistant_reply",
      "serverSeq": 1,
      "sessionId": "session-123",
      "createdAt": { "seconds": 1717689600, "nanos": 0 },
      "payload": {
        "text": "Sure! We have red and green apples. Which one do you prefer?",
        "audioUrl": "https://cdn.example.com/audio/assistant-1.mp3"
      }
    },
    {
      "type": "correction",
      "serverSeq": 2,
      "sessionId": "session-123",
      "createdAt": { "seconds": 1717689601, "nanos": 0 },
      "payload": {
        "original": "I want to buy",
        "corrected": "I'd like to buy",
        "explanation": "More polite expression."
      }
    }
  ]
}
```

---

## WebSocket 实时练习

### 连接地址

- **对话练习**: `ws://localhost:8080/ws/v1/practice-sessions/{sessionId}/dialogue`
- **发音练习**: `ws://localhost:8080/ws/v1/practice-sessions/{sessionId}/pronunciation`
- **纠错练习**: `ws://localhost:8080/ws/v1/practice-sessions/{sessionId}/correction`

### 客户端发送消息格式

```json
{
  "type": "text_input",
  "clientSeq": 1,
  "sessionId": "session-123",
  "createdAt": "2024-06-06T10:00:00Z",
  "payload": {
    "text": "Hello, how are you?"
  }
}
```

### 服务端推送消息格式

```json
{
  "type": "assistant_reply",
  "serverSeq": 1,
  "sessionId": "session-123",
  "createdAt": "2024-06-06T10:00:01Z",
  "payload": {
    "text": "I'm fine, thank you! How can I help you today?",
    "audioUrl": "https://cdn.example.com/audio/assistant-1.mp3"
  }
}
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
