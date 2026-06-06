# AI 英语口语陪练 App 前端开发文档

## 1. 项目目标

开发一款 React Native 英语口语练习工具，帮助用户在指定场景下进行真实对话训练。

App 端需要支持：

- 场景选择：面试、点餐、会议等
- 实时语音对话
- 发音评测
- 语法 / 表达纠错
- 课后总结
- 口语能力提升的可量化反馈

发音评测、语法纠错、课后总结、用户数据、课程数据等能力由其他业务后端提供。当前阶段以前端 mock 为主，本文档只定义当前页面需要承载的 UI、状态、数据结构和后续接口适配方式，不展开其他后端实现。

## 2. 前端技术栈

| 分类 | 技术 |
| --- | --- |
| 移动端框架 | React Native |
| 开发语言 | TypeScript |
| 工程方案 | Expo SDK 54 |
| 页面导航 | Expo Router + 当前 `AppNavigator` |
| 状态管理 | React State |
| 实时通信 | 当前阶段 mock，后续预留 WebSocket client interface |
| HTTP 请求 | 当前阶段 mock，后续预留 fetch client interface |
| 麦克风权限 | 当前阶段不申请真实权限 |
| 实时音频采集 | 当前阶段不采集真实音频 |
| PCM 音频播放 | 当前阶段不播放真实音频 |
| iOS 音频底层 | 后续对接时再选型 |
| Android 音频底层 | 后续对接时再选型 |
| 样式方案 | StyleSheet |
| 本地缓存 | 当前阶段暂不接入 |

## 3. 前端功能范围

### 负责

- 练习场景选择
- 难度、口音、练习目标选择
- 实时语音会话 UI
- 实时语音会话 UI mock
- mock 音量和状态展示
- 实时字幕展示
- 会话状态展示
- 打断、结束、重试等交互
- 发音评测结果展示
- 语法 / 表达纠错结果展示
- 课后总结展示
- 能力指标可视化
- 后续多后端接口适配预留

### 不负责

- 实时通话后端实现
- 发音评测算法实现
- 语法纠错算法实现
- 课后总结生成逻辑
- 用户体系后端
- 课程体系后端
- 订单、支付、运营后台等业务后端
- 当前阶段真实麦克风采集、真实音频播放、真实 REST 和真实 WebSocket

## 4. 后端依赖边界

前端会对接多个后端能力，但各后端职责相互独立。

| 能力 | 前端对接方式 | 说明 |
| --- | --- | --- |
| 实时语音通话 | 后续 WebSocket client interface | 当前阶段使用 mock |
| 发音评测 | 后续 HTTP API / 业务 SDK | 当前阶段使用 mock |
| 语法 / 表达纠错 | 后续 HTTP API | 当前阶段使用 mock |
| 课后总结 | 后续 HTTP API | 当前阶段使用 mock |
| 用户与练习记录 | 后续 HTTP API | 当前阶段使用 mock |

前端需要通过独立 client 层隔离这些能力，避免页面直接耦合具体后端实现。

## 5. 推荐目录结构

```text
src/
  app/
    _layout.tsx
    index.tsx
  navigation/
    AppNavigator.tsx
  screens/
    ScenarioSelectScreen.tsx
    PracticeScreen.tsx
    SessionSummaryScreen.tsx
    HistoryScreen.tsx
  components/
    scenario/
      ScenarioCard.tsx
      DifficultySelector.tsx
      AccentSelector.tsx
    practice/
      RealtimeControls.tsx
      TranscriptPanel.tsx
      AudioLevelMeter.tsx
      SpeakingStatus.tsx
    feedback/
      PronunciationReport.tsx
      CorrectionList.tsx
      SummaryCard.tsx
      AbilityRadar.tsx
      ScoreTrend.tsx
  clients/
    realtimeClient.ts
    reportClient.ts
    historyClient.ts
  state/
    practiceStore.ts
    sessionStore.ts
  types/
    practice.ts
```

## 6. 页面设计

### ScenarioSelectScreen

用于选择练习场景和练习参数。

核心内容：

- 场景列表：面试、点餐、会议等
- 难度选择：初级、中级、高级
- 口音选择：美式、英式
- 练习目标：流利度、准确度、职场表达、日常沟通等
- 开始练习入口

### PracticeScreen

用于承载实时语音练习。

核心内容：

- 当前场景信息
- 实时连接状态
- 麦克风音量
- 用户实时字幕
- AI 实时字幕
- AI 语音播放状态
- 开始、结束、打断、重试按钮
- 会话计时

实时练习过程中不强打断用户进行纠错，避免破坏自然对话。纠错和总结优先在会话结束后展示。

### SessionSummaryScreen

用于展示课后反馈。

核心内容：

- 总体评分
- 流利度评分
- 发音评分
- 语法评分
- 表达自然度评分
- 关键词和高频问题
- 发音问题列表
- 语法 / 表达纠错列表
- 优秀表达摘录
- 下一步练习建议

### HistoryScreen

用于展示历史练习记录。

核心内容：

- 练习时间
- 练习场景
- 总分
- 分项能力变化
- 历史总结入口

## 7. 实时通话链路

当前阶段实时通话页面只展示 mock 状态，不连接实时通话后端。后续对接时通过 client interface 替换 mock。

```text
PracticeScreen
  -> mock realtime state
  -> TranscriptPanel / SpeakingStatus / RealtimeControls
  -> SessionSummaryScreen
```

## 8. 实时 WebSocket 事件

### App -> Realtime Server

```ts
export type ClientRealtimeEvent =
  | {
      type: "session.start";
      scenarioId: "interview" | "restaurant" | "meeting";
      difficulty: "beginner" | "intermediate" | "advanced";
      accent: "us" | "uk";
    }
  | {
      type: "audio.input";
      audioBase64: string;
      format: "pcm16";
      sampleRate: 16000;
      timestampMs: number;
    }
  | {
      type: "user.interrupt";
      timestampMs: number;
    }
  | {
      type: "session.end";
    };
```

### Realtime Server -> App

```ts
export type ServerRealtimeEvent =
  | {
      type: "session.ready";
      sessionId: string;
    }
  | {
      type: "transcript.partial";
      turnId: string;
      speaker: "user" | "assistant";
      text: string;
    }
  | {
      type: "transcript.final";
      turnId: string;
      speaker: "user" | "assistant";
      text: string;
    }
  | {
      type: "audio.output";
      turnId: string;
      audioBase64: string;
      format: "pcm16";
      sampleRate: number;
    }
  | {
      type: "error";
      code: string;
      message: string;
      recoverable: boolean;
    };
```

## 9. 实时音频采集

### 目标输出

```text
format: pcm16
sampleRate: 16000
channel: mono
encoding: base64
```

### TypeScript 接口

```ts
export type AudioInputFrame = {
  audioBase64: string;
  sampleRate: 16000;
  level: number;
};

export type AudioFrameHandler = (frame: AudioInputFrame) => void;

export interface RealtimeAudioRecorder {
  start(onFrame: AudioFrameHandler): Promise<void>;
  stop(): void;
}
```

### 要求

- 支持麦克风权限申请
- 支持持续输出短音频帧
- 输出单声道音频
- 输出 PCM16 格式
- 输出 16kHz 采样率
- 输出 base64 字符串
- 输出音量值用于 UI 展示
- 停止后释放麦克风资源

## 10. 实时音频播放

### 输入格式

```text
format: pcm16
sampleRate: 24000
channel: mono
encoding: base64
```

### TypeScript 接口

```ts
export interface RealtimeAudioPlayer {
  enqueuePcm16(audioBase64: string, sampleRate: number): Promise<void>;
  stop(): void;
  close(): Promise<void>;
}
```

### 要求

- 支持 PCM16 音频片段排队播放
- 支持低延迟播放
- 支持打断时立即停止
- 支持会话结束时释放资源
- 支持连续音频片段平滑播放

## 11. 练习会话状态

```ts
export type PracticeSessionState =
  | "idle"
  | "requesting_microphone"
  | "connecting"
  | "listening"
  | "assistant_speaking"
  | "ending"
  | "ended"
  | "generating_summary"
  | "summary_ready"
  | "error";
```

## 12. 练习流程

```text
用户选择场景
  -> 选择难度、口音和练习目标
  -> 点击开始
  -> 进入 mock 实时对话
  -> 展示 mock 连接、字幕、音量和 AI 状态
  -> 用户点击结束
  -> 使用 mock 数据生成课后总结
  -> 展示课后总结页
```

## 13. 发音评测前端模型

```ts
export type PronunciationAssessment = {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore?: number;
  prosodyScore?: number;
  words: PronunciationWord[];
};

export type PronunciationWord = {
  word: string;
  score: number;
  issue?: string;
  phonetic?: string;
  startMs?: number;
  endMs?: number;
};
```

展示要求：

- 展示总发音分
- 展示准确度和流利度
- 标记低分单词
- 支持查看单词级问题
- 不在用户说话过程中频繁弹出，优先在课后总结中展示

## 14. 语法 / 表达纠错前端模型

```ts
export type CorrectionItem = {
  id: string;
  turnId?: string;
  type: "grammar" | "expression";
  original: string;
  suggestion: string;
  explanation: string;
  severity?: "low" | "medium" | "high";
};
```

展示要求：

- 原句和建议表达并列展示
- 解释简短明确
- 优先展示影响理解的问题
- 支持按严重程度排序
- 避免在实时对话中打断用户

## 15. 课后总结前端模型

```ts
export type SessionSummary = {
  sessionId: string;
  scenarioId: string;
  durationSec: number;
  overallScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  grammarScore: number;
  expressionScore: number;
  highlights: string[];
  weaknesses: string[];
  nextSteps: string[];
  pronunciation?: PronunciationAssessment;
  corrections: CorrectionItem[];
};
```

展示要求：

- 总分和分项分数清晰可见
- 指出本次练习做得好的地方
- 指出最需要改进的 2-3 个问题
- 给出下一次练习建议
- 支持历史记录对比

## 16. 反馈能力接口适配

发音评测、语法 / 表达纠错、课后总结由其他业务后端提供。当前阶段由 mock 数据驱动；后续需要预留独立 client 层，并在实时通话结束后统一拉取或提交生成。

### 调用时机

```text
mock 实时通话结束
  -> 整理本次会话 transcript
  -> 整理 sessionId、scenarioId、duration、difficulty、accent
  -> 从 mock implementation 获取发音评测、语法纠错和课后总结
  -> 进入 SessionSummaryScreen
```

### 会话提交模型

```ts
export type PracticeSessionPayload = {
  realtimeSessionId: string;
  scenarioId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  accent: "us" | "uk";
  durationSec: number;
  startedAt: string;
  endedAt: string;
  transcript: TranscriptTurn[];
};

export type TranscriptTurn = {
  turnId: string;
  speaker: "user" | "assistant";
  text: string;
  startedAtMs?: number;
  endedAtMs?: number;
};
```

### pronunciationClient

用于获取发音评测结果。

```ts
export interface PronunciationClient {
  assessSession(payload: PracticeSessionPayload): Promise<PronunciationAssessment>;
}
```

前端展示重点：

- 总体发音分
- 准确度
- 流利度
- 单词级问题
- 可跟读复练的单词列表

### correctionClient

用于获取语法和表达纠错。

```ts
export interface CorrectionClient {
  analyzeSession(payload: PracticeSessionPayload): Promise<CorrectionItem[]>;
}
```

前端展示重点：

- 原句
- 建议表达
- 错误类型
- 简短解释
- 优先级或严重程度

### summaryClient

用于获取课后总结。

```ts
export interface SummaryClient {
  generateSummary(payload: PracticeSessionPayload): Promise<SessionSummary>;
}
```

前端展示重点：

- 总体表现
- 分项评分
- 做得好的地方
- 主要问题
- 下一步练习建议
- 历史能力趋势

### 反馈加载状态

```ts
export type FeedbackLoadingState =
  | "idle"
  | "submitting_session"
  | "loading_pronunciation"
  | "loading_corrections"
  | "loading_summary"
  | "ready"
  | "error";
```

### 容错要求

- 发音评测失败时，仍可展示语法纠错和课后总结
- 语法纠错失败时，仍可展示发音评测和课后总结
- 课后总结失败时，展示已拿到的分项反馈
- 所有反馈失败时，保留本次实时字幕并提示稍后重试
- 不因为课后反馈生成失败影响实时通话结束流程

## 17. 交互原则

- 实时对话优先保证自然度和低延迟
- 用户说话时不弹出大面积反馈
- AI 说话时允许用户打断
- 纠错和发音反馈默认后置到课后总结
- 实时字幕可以展示 partial，但最终字幕以 final 为准
- 网络异常时保留当前会话状态并提供重试或结束入口

## 18. 环境配置

```env
# 当前阶段不需要真实环境变量。
# 后续对接时再配置实时服务和业务接口环境变量。
```

后续接入真实服务时，再补充开发、测试和生产环境地址。

## 19. 前端验收标准

- 可以选择面试、点餐、会议等练习场景
- 可以选择难度、口音和练习目标
- 可以进入 mock 实时对话页面
- 可以展示 mock 连接状态
- 不申请真实麦克风权限
- 不连接真实 WebSocket
- 可以展示用户实时字幕
- 可以展示 AI 实时字幕
- 可以展示 mock AI 说话状态
- 可以通过 mock 控制结束会话
- 可以正常结束会话并释放资源
- 可以展示发音评测结果
- 可以展示语法 / 表达纠错结果
- 可以展示课后总结
- 可以展示口语能力分项评分
- `pnpm lint` 和 `pnpm exec tsc --noEmit` 通过
