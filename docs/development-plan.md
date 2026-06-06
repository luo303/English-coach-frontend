# AI 英语口语陪练 App 开发计划

> 日期：2026-06-06  
> 适用范围：React Native App 前端  
> 依据：`docs/react-native-app-development.md`、`docs/接口文档.md`、当前已完成 mock 界面  
> 当前目标：确定技术栈和技术选型，并形成可按阶段推进的开发计划。

## 1. 项目现状

当前项目已经完成 Expo + React Native 基础工程和一组前端 mock 页面：

- 场景选择页：`ScenarioSelectScreen`
- 实时练习页：`PracticeScreen`
- 课后总结页：`SessionSummaryScreen`
- 历史记录页：`HistoryScreen`
- 自定义底部导航：`AppNavigator`
- mock 数据与基础类型：`practiceMock.ts`、`practice.ts`

现阶段页面以静态 mock 为主，尚未接入真实登录、REST、WebSocket、麦克风采集、音频播放、课后报告接口和本地缓存。

## 2. 技术栈确定

### 2.1 基础技术栈

| 分类 | 选型 | 当前状态 | 说明 |
| --- | --- | --- | --- |
| 移动端框架 | React Native 0.81.5 | 已使用 | 与 Expo SDK 54 匹配 |
| 工程方案 | Expo SDK 54 | 已使用 | 保持 Managed / CNG 优先 |
| UI 框架 | React 19.1.0 | 已使用 | 与 Expo SDK 54 匹配 |
| 开发语言 | TypeScript 5.9 | 已使用 | 所有业务模型与接口类型强约束 |
| 路由入口 | Expo Router 6 | 已使用 | 当前 `main` 为 `expo-router/entry` |
| 页面组织 | Expo Router + AppNavigator | 已使用 | 短期保留自定义 navigator，后续再拆真实路由 |
| 样式 | React Native `StyleSheet` | 已使用 | 首期不引入 UI 组件库 |
| 包管理 | pnpm | 已使用 | 继续使用锁文件控制版本 |

### 2.2 推荐新增依赖

| 能力 | 推荐选型 | 接入阶段 | 原因 |
| --- | --- | --- | --- |
| HTTP 请求 | `expo/fetch` + 自封装 `apiClient` | P3 最小接入 / P5 完整接入 | 前期只服务登录、建房、结束；后期再覆盖场景、报告、历史 |
| 服务端状态 | TanStack Query | P5 | 场景、历史、报告等 REST 数据需要缓存、重试、加载状态和失效刷新 |
| 本地轻状态 | Zustand | P1 | 会话配置、UI 开关、练习状态比 React State 更容易跨页面共享 |
| Token 安全存储 | `expo-secure-store` | P3 | accessToken / refreshToken 需要加密存储；Web 预览使用内存或 Async Storage 降级 |
| 普通本地缓存 | `@react-native-async-storage/async-storage` | P5 | 保存用户偏好、最近场景、非敏感开关 |
| 实时通信 | 原生 `WebSocket` + `RealtimeClient` 封装 | P3 | 直接覆盖接口文档中的 3 条 WS 通道，避免页面耦合协议 |
| 音频采集/播放 | `react-native-audio-api` 优先，`expo-audio` 仅作普通播放备选 | P2 spike / P3 实装 | 更贴近实时通话：支持录音 data callback、音频图处理、短 buffer 队列播放；需要 Expo Development Build |
| 可视化 | 先用 RN View 自绘，必要时再引入 SVG | P0-P2 | 当前雷达图和趋势图可继续轻量实现，避免过早增加复杂度 |
| 测试 | `jest-expo` + React Native Testing Library | P1 起 | 优先覆盖实时 reducer、状态机、client 事件解析 |
| E2E | Maestro 优先，Detox 作为后续可选 | P5 | Expo 项目先用 Maestro 覆盖主流程更轻，Detox 等真机语音链路稳定后再评估 |

### 2.3 暂不采用

| 方案 | 暂不采用原因 |
| --- | --- |
| 直接在 App 接腾讯智聆 / 豆包 / TTS | 接口文档明确要求 App 只接后端，供应商密钥只能在后端 |
| `expo-av` 新接入 | 不适合实时 PCM buffer 采集与低延迟流式播放，避免新代码依赖旧音频路线 |
| Redux Toolkit | 当前状态规模不大，Zustand 更轻；服务端状态交给 TanStack Query |
| 大型 UI 组件库 | 当前界面已有明确视觉语言，首期保留自定义组件更可控 |
| 自研底层 PCM 原生模块 | P2 先验证 `react-native-audio-api` 能力；若仍无法满足，再评估自定义 Expo Module / Bare 原生模块 |

## 3. 前端架构目标

### 3.1 目录规划

```text
src/
  app/
  navigation/
  screens/
  components/
  clients/
    apiClient.ts
    authClient.ts
    scenarioClient.ts
    sessionClient.ts
    reportClient.ts
    historyClient.ts
    realtimeClient.ts
  audio/
    recorder.ts
    player.ts
    audioPermissions.ts
  state/
    practiceStore.ts
    sessionStore.ts
    authStore.ts
  types/
    api.ts
    practice.ts
    realtime.ts
    report.ts
  data/
    practiceMock.ts
```

### 3.2 分层原则

- 页面只负责渲染和用户交互，不直接拼 REST URL 或 WebSocket event。
- `clients/` 负责接口调用、鉴权头、错误转换、mock/real implementation 切换。
- `state/` 负责跨页面状态，例如当前场景、难度、口音、会话状态、提示开关。
- `audio/` 负责麦克风权限、采集、音频帧、播放、释放资源。
- `types/` 统一前端业务模型和接口模型，避免页面散落临时类型。

## 4. 分阶段开发计划

### 核心原则：实时房间优先

本项目的主价值不是完整 App 外围功能，而是“实时语音对话 + 发音/语法纠错”。因此开发顺序调整为：

```text
实时房间 UI
  -> 实时状态机
  -> WebSocket 协议
  -> 音频采集/播放
  -> 实时纠错旁路
  -> 课后报告沉淀
  -> 历史、画像、推荐等外围能力
```

REST 接口在前期只保留最小集合：登录、创建会话、结束会话、获取报告。场景列表、历史记录、用户画像可以后置，不应阻塞实时链路。

### 实时链路闭环清单

实时通话必须覆盖以下闭环，任何一环缺失都会影响可用性：

```text
选择场景
  -> 创建 session
  -> 请求麦克风权限
  -> 建立 /dialogue WebSocket
  -> session_ready
  -> recording_start
  -> audio_chunk 持续上行
  -> 本地 VAD / 服务端 VAD 判断用户 turn 结束
  -> user_turn_end
  -> transcript_delta / transcript_final
  -> ai_reply_delta
  -> ai_audio_chunk 入队播放
  -> 用户可 cancel_ai_speech / interrupt
  -> /correction 返回语法和表达提示
  -> /pronunciation 返回发音提示
  -> session_control end
  -> 停止录音和播放，释放资源
  -> 后端 report_generating
  -> 拉取或轮询报告
  -> 展示完整课后纠错
```

前端要把“实时房间是否可用”定义为：用户能连续说话、AI 能连续回应、用户能打断 AI、纠错旁路可失败但主对话继续、结束后资源释放并进入报告。

### P0：实时房间 mock 原型

目标：把当前页面重心从“完整 App 导航演示”收敛到“实时通话房间可演示”。

实现内容：

- 优先完善 `PracticeScreen`，把它作为主工作台。
- 房间内展示完整实时通话状态：
  - 连接中
  - 等待用户说话
  - 用户说话中
  - AI 思考中
  - AI 说话中
  - 用户打断
  - 结束生成报告
  - 错误/重连
- 房间内展示核心实时信息：
  - 麦克风音量
  - 用户 partial / final 字幕
  - AI partial / final 回复
  - 网络延迟
  - 本轮耗时
  - 发音提示
  - 语法/表达提示
  - 实时分数快照
- 保留场景选择页，但只作为进入实时房间的轻入口。
- 历史页和报告页暂时保持 mock，不作为当前阶段重点。

实施方式：

- 继续使用 React State 和 mock 数据。
- 新增 mock realtime timeline，用定时器模拟：
  - `session_ready`
  - `transcript_delta`
  - `transcript_final`
  - `ai_reply_delta`
  - `grammar_hint`
  - `pronunciation_hint`
  - `score_snapshot`
- 先把 UI 状态和事件结构定清楚，再接真实 WebSocket。

验收标准：

- 不接后端也能演示一轮完整实时通话和纠错。
- 用户能看到实时字幕、AI 回复、发音提示、语法提示和结束入口。
- `pnpm lint` 通过。
- 关键 UI 在 iOS/Android/Web 预览不溢出。

### P1：实时协议模型和状态机

目标：建立实时通话的前端内核，让页面不直接处理 WebSocket 细节。

实现内容：

- 新增 `types/realtime.ts`：
  - `RecordingStartEvent`
  - `AudioChunkEvent`
  - `UserTurnEndEvent`
  - `SessionControlEvent`
  - `ClientRealtimeEvent`
  - `ServerRealtimeEvent`
  - `RealtimeEnvelope`
  - `TranscriptTurn`
  - `CorrectionHint`
  - `PronunciationHint`
  - `ScoreSnapshot`
- 新增 `state/sessionStore.ts` 管理：
  - `sessionId`
  - 当前场景
  - 会话状态
  - 连接状态
  - `clientSeq`
  - `serverSeq`
  - 字幕 turns
  - 当前 partial 字幕
  - AI 回复状态
  - AI 音频播放队列
  - 录音状态
  - 当前 turnClientId
  - 网络延迟
  - 发音提示开关
  - 语法提示开关
  - 当前纠错列表
  - 当前发音问题列表
- 实现前端会话状态机：
  - `idle`
  - `connecting`
  - `listening`
  - `assistant_speaking`
  - `ending`
  - `report_generating`
  - `summary_ready`
  - `error`
- 新增 `realtimeEventReducer`：
  - partial 合并
  - final 覆盖 partial
  - `serverSeq` 防重放
  - `ai_audio_chunk` 入队
  - `session_control` 状态转换
  - `cancel_ai_speech` 后清空播放队列
  - 错误降级
  - 旁路纠错不影响主链路

实施方式：

- 引入 Zustand。
- 页面只读 store，不直接处理事件拼接。
- mock timeline 也走同一套 reducer，保证后续替换真实 WS 时 UI 不大改。

验收标准：

- 所有实时 UI 都由状态机驱动。
- partial/final 字幕合并正确。
- 发音和语法提示可开关显示。
- reducer 有基础单元测试。

### P2：音频技术 spike

目标：在接真实业务接口前确认 Expo 音频路线是否能承载实时通话，这是项目最大技术风险。

实现内容：

- 验证录音权限申请。
- 验证真实麦克风音量 metering。
- 验证是否能产出或转换为：
  - 16kHz
  - 16bit
  - mono
  - 40ms 分片
  - base64 PCM
- 验证 WebSocket 发送节奏。
- 验证本地 VAD 或静音计时策略：
  - 识别用户开始说话
  - 识别用户停止说话
  - 触发 `user_turn_end`
  - 避免短暂停顿误切 turn
- 验证 AI 音频播放策略：
  - PCM stream
  - base64 音频片段
  - mp3/aac 短片段
- 确认是否需要自定义 Expo Module。

实施方式：

- 使用 `react-native-audio-api` 做第一轮验证。
- 通过 `AudioRecorder.onAudioReady` 获取连续 raw audio buffer。
- 将 float PCM buffer 转成后端需要的 PCM16 base64。
- 按 40ms 或后端确认的 chunk 时长重切片。
- 使用 `AudioBufferQueueSourceNode` 验证 AI 短音频片段排队播放。
- 验证 `cancel_ai_speech` 时能清空队列并立即停止当前播放。
- 验证离开房间、结束会话、异常断开时录音和播放资源都能释放。
- 使用其 Expo config plugin 配置麦克风权限；开发阶段需要 Expo Development Build，不能用 Expo Go 验证真机原生能力。
- 单独做最小 spike 页面或隐藏调试入口，不和业务 UI 混在一起。
- spike 输出明确结论：
  - A：`react-native-audio-api` 可满足录音与播放
  - B：`react-native-audio-api` 可满足录音，但播放需后端返回更适合的短音频片段
  - C：必须自定义 Expo Module
  - D：必须 EAS prebuild / 原生模块

验收标准：

- iOS / Android 至少一端真机验证完成，最终必须双端验证。
- 得到可执行的音频路线，不把底层不确定性留到后期。
- 明确后端需要返回的音频格式。

### P3：最小 REST + WebSocket 主链路

目标：打通真实实时对话主链路。REST 只做建房和收尾，不先做完整业务闭环。

实现内容：

- 最小 REST：
  - 匿名登录或临时 token
  - `POST /api/v1/practice-sessions`
  - `POST /api/v1/practice-sessions/{sessionId}/end`
- 新增 `RealtimeClient`，封装：
  - 建连
  - 断线重连
  - 心跳 `ping/pong`
  - `clientSeq` / `serverSeq`
  - 事件分发
  - 关闭释放
- 接入 `/dialogue` 主通道：
  - `/dialogue`
  - `session_ready`
  - `transcript_delta`
  - `transcript_final`
  - `ai_reply_delta`
  - `ai_audio_chunk`
  - `score_snapshot`
  - `session_state`
  - `error`
- 客户端上行事件：
  - `recording_start`
  - `audio_chunk`
  - `user_turn_end`
  - `session_control pause/resume/end`
  - `session_control cancel_ai_speech`
  - `ping`
- 房间 UI 增加：
  - 网络延迟
  - 连接状态
  - 断线重连提示
  - 实时分数快照

实施方式：

- 使用原生 `WebSocket`。
- 第一小步用 mock audio frame 验证协议。
- 第二小步根据 P2 结论接入真实麦克风音频。
- 首期音频帧优先使用 base64 JSON，二进制 frame 等 React Native 和后端兼容性验证后再切换。
- 将实时事件归一化到 `sessionStore`，页面只消费状态。
- AI 音频播放由 `audio/player.ts` 管理，页面只发送打断或停止命令。
- 断线后先停止上行音频，重连成功后根据服务端 session 状态决定继续、恢复字幕或结束生成报告。

验收标准：

- WS 能正常建连、心跳、断开。
- 房间能显示实时字幕、AI 文本/音频、状态变化和错误提示。
- 用户说话结束后能正确发送 `user_turn_end`。
- AI 说话时用户能打断，播放队列能清空。
- `serverSeq` 乱序事件不会污染 UI。
- 用户可以完成一轮真实语音对话。

### P4：实时纠错和发音旁路

目标：接入项目最关键的纠错能力，让通话过程中能看到轻量提示，结束后能沉淀总结。

实现内容：

- 接入 `/correction` 通道：
  - `grammar_hint`
  - `expression_hint`
  - `quickFix`
  - `severity`
  - `shouldInterrupt`
- 接入 `/pronunciation` 通道：
  - `pronunciation_hint`
  - word score
  - phoneme issue
  - severity
  - practice text
- 房间内纠错展示策略：
  - 默认轻提示，不打断用户说话。
  - `shouldInterrupt=false` 时只展示浮层或对话间隙提示。
  - `shouldInterrupt=true` 时交给 AI 主通道澄清，不由前端硬弹窗打断。
  - 用户可关闭发音提示或语法提示显示，但后端仍处理并写入报告。
- 结束时整理会话 transcript、纠错、发音问题，进入报告生成。

实施方式：

- 旁路事件进入同一个 `realtimeEventReducer`。
- 纠错列表按 turnId 归档。
- 严重问题在房间内轻量展示，详细解释放到课后报告。

验收标准：

- 主对话异常和旁路异常互不拖垮。
- 用户说话过程中不会被大面积纠错 UI 打断。
- 房间内能看到实时纠错，报告中能看到完整纠错。

### P5：报告、历史和质量保障

目标：把实时通话产生的数据沉淀成课后反馈，再补外围页面。

实现内容：

- 报告：
  - `GET /api/v1/reports/{sessionId}`
  - `POST /api/v1/reports/{sessionId}/regenerate`
  - 报告生成中轮询或订阅 `report_generating` 状态
  - 发音、语法、总结任一失败时展示部分报告
- 历史：
  - `GET /api/v1/practice-sessions?page=1&pageSize=20&status=completed`
- 场景：
  - `GET /api/v1/scenarios`
  - `GET /api/v1/scenarios/{scenarioId}`
- 补齐空状态、失败状态、加载骨架、重试入口。
- 优化低端机性能，避免实时字幕频繁 setState 造成卡顿。
- 增加日志与埋点：
  - sessionId
  - requestId
  - ws latency
  - firstVoiceLatencyMs
  - error code
- 测试覆盖：
  - client 响应包解析
  - token refresh
  - session 状态机
  - realtime event reducer
  - 报告容错展示
- 构建与发布：
  - 配置 EAS Build
  - 配置开发、测试、生产环境
  - Android 权限与 iOS Info.plist 麦克风文案

验收标准：

- `pnpm lint` 通过。
- `pnpm exec tsc --noEmit` 通过。
- REST / WS / 音频异常都有可恢复体验。
- Android 和 iOS 真机完成完整练习闭环。

## 5. 前后端联调顺序

建议按实时通话优先顺序联调：

1. 用 mock timeline 跑通房间状态机和 UI。
2. 完成音频 spike，确定 App 与后端音频格式。
3. 用临时 token 或匿名登录创建 session。
4. 建立 `/dialogue` WebSocket，仅验证 `session_ready` 和 `ping/pong`。
5. 使用 mock audio frame 验证 `recording_start` 和 `audio_chunk` 协议。
6. 验证 VAD / 静音计时，并发送 `user_turn_end`。
7. 接入真实麦克风音频发送。
8. 接入 `transcript_delta` / `transcript_final`。
9. 接入 `ai_reply_delta` 和 AI 音频播放。
10. 验证 `cancel_ai_speech` 和用户打断。
11. 接入 `/correction` 语法/表达纠错。
12. 接入 `/pronunciation` 发音提示。
13. 结束会话，进入 `report_generating`。
14. 拉取或轮询报告。
15. 最后补场景列表、历史记录、用户画像。

## 6. 关键技术风险

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| `react-native-audio-api` 输出 buffer 的实际采样率或分片长度与期望不完全一致 | 影响 16k PCM16 40ms 上行协议 | P2 spike 中实测 iOS/Android，必要时在前端重采样/重切片 |
| AI 音频返回为低延迟 PCM stream，短 buffer 队列播放不稳定 | 影响 AI 发声体验 | 优先用 `AudioBufferQueueSourceNode` 验证，必要时协商后端返回更大的可播放片段 |
| `react-native-audio-api` 需要原生开发构建 | 不能使用 Expo Go 快速验证 | P2 开始切 Expo Development Build，并将 config plugin 写入 `app.json` |
| VAD / 静音切 turn 不准 | 用户停顿时误结束或迟迟不回复 | P2 同时验证本地静音阈值和服务端 turn_end 策略，阈值可配置 |
| 打断 AI 后播放队列未清空 | 用户体验像“抢话失败” | `cancel_ai_speech` 必须同时发 WS 控制事件并清空本地音频队列 |
| 离开房间后录音或播放未释放 | 耗电、占用麦克风、下次会话异常 | 所有 end/error/unmount 路径统一调用 recorder/player cleanup |
| WebSocket 三通道事件时序复杂 | UI 状态错乱 | 使用统一 event reducer 和 seq 防重放 |
| React Native WebSocket 二进制帧兼容性不确定 | 音频传输不稳定 | 首期使用 base64 JSON，二进制作为优化项 |
| 报告生成慢或失败 | 用户结束后体验差 | 允许展示生成中、重试和部分反馈 |
| Token 过期导致 WS 中断 | 练习被打断 | 处理 `AUTH_EXPIRED`，刷新 token 后重连或结束生成报告 |
| 实时字幕更新过频 | 低端机卡顿 | 合并 delta、节流渲染、final 覆盖 partial |
| 发音/语法旁路异常 | 主对话不稳定 | 旁路错误不影响 `/dialogue` 主链路 |

## 7. 近期执行建议

优先顺序：

1. 完成 P0：把 `PracticeScreen` 做成实时通话主工作台。
2. 完成 P1：先做实时事件类型、状态机、reducer 和 mock timeline。
3. 完成 P2：立刻做音频 spike，确定 Expo Managed 是否能承载。
4. 开始 P3：只接创建 session 和 `/dialogue` 主通道。
5. 完成 P4：接 `/correction` 和 `/pronunciation`，形成实时纠错能力。
6. P5 再补报告、历史、画像和完整 REST。

当前最推荐的第一批代码任务：

- 新增 `types/realtime.ts`，先定实时事件和纠错事件。
- 新增 `state/sessionStore.ts` 和 `realtimeEventReducer`。
- 新增 mock realtime timeline，驱动 `PracticeScreen`。
- 重构 `PracticeScreen`，让字幕、AI 状态、音量、纠错提示都来自 session state。
- 做 `react-native-audio-api` spike，输出音频路线结论。

## 8. 技术选型结论

本项目继续基于 Expo SDK 54 + React Native 0.81 + React 19 + TypeScript 开发。首期保留 Expo Router 入口和当前 `AppNavigator`，样式继续使用 `StyleSheet`。状态管理采用 Zustand，REST 数据采用 TanStack Query，安全 token 使用 `expo-secure-store`，普通偏好缓存使用 Async Storage。实时通信使用原生 WebSocket 并封装 `RealtimeClient`。真实音频优先使用 `react-native-audio-api`，因为它比 `expo-audio` 更适合持续录音 raw buffer、实时处理和短音频片段排队播放；代价是需要 Expo Development Build。

审查后的修正结论：整体技术路线可行，但音频不能放到后期才验证。P2 必须完成 `react-native-audio-api` spike，明确 iOS/Android 是否能稳定输出后端需要的 PCM16 分片并平滑播放 AI 音频；P3 只打通创建 session、`/dialogue` 主通道和真实音频；P4 再接 `/correction`、`/pronunciation` 旁路。WebSocket 首期优先 base64 JSON，不把二进制帧作为 MVP 前置条件。这样计划会更贴合“实时通话 + 纠错”这个核心目标。

移动端只对接业务后端 REST 与 WebSocket，不直连豆包、腾讯智聆、TTS/ASR 等供应商。实时体验以主对话链路低延迟为第一优先级，发音测评和语法纠错走旁路异步链路，并最终沉淀到课后报告和历史记录。
