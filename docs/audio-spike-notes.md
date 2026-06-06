# P2 Audio Spike Notes

> 日期：2026-06-06  
> 阶段：P2 `react-native-audio-api` 音频技术 spike  
> 状态：工程准备完成，真机已验证基础录音和播放链路。

## 1. 当前结论

`react-native-audio-api` 比 `expo-audio` 更适合作为本项目的实时通话音频方案，因为它提供：

- `AudioRecorder.onAudioReady`：持续获取 raw audio buffer。
- `AudioBufferQueueSourceNode`：短音频片段排队播放。
- `AudioContext` / `AudioBuffer`：可以按 PCM buffer 方式处理音频。
- Expo config plugin：可以配置 iOS 麦克风文案和 Android 权限。

真机验证反馈：

- 录音调试页点击“开始录音”后有状态和数据变化。
- `AudioBufferSourceNode` 一次性播放测试可出声。
- `AudioBufferQueueSourceNode` 队列播放测试可出声。
- 增加“播放录音”闭环：将最近录到的 PCM16 base64 frames 合并后播放。
- 当前测试音是 880Hz 正弦波，听起来像电子音属于预期。

当前代码已经完成：

- 安装 `react-native-audio-api@0.12.2`。
- 在 `app.json` 配置 `react-native-audio-api` plugin。
- 增加 `src/audio/pcm.ts`：
  - float PCM -> PCM16 bytes
  - PCM16 bytes -> base64
  - base64 PCM16 -> Float32Array
  - AudioBuffer -> mono PCM16 frame
  - RMS 音量计算
- 增加 `src/audio/recorder.ts`：
  - 请求麦克风权限
  - 激活 audio session
  - 请求 16kHz / 40ms / mono callback
  - 输出 PCM16 base64 frame
  - 记录实际 sampleRate、chunkMs、level
- 增加 `src/audio/player.ts`：
  - 播放前激活 audio session
  - PCM16 base64 -> AudioBuffer
  - `AudioBufferQueueSourceNode.enqueueBuffer`
  - 先 enqueue，再 connect/start
  - 清空队列、停止、关闭
- 增加 `AudioSpikeScreen` 调试入口。

## 2. 关键风险

### 2.1 worklets peer 版本不匹配

安装时出现 peer warning：

```text
react-native-audio-api 0.12.2 requires react-native-worklets >= 0.6.0
current project uses react-native-worklets 0.5.1
```

当前不直接升级 `react-native-worklets`，原因：

- Expo SDK 54 / Reanimated 当前依赖链实际使用 `react-native-worklets 0.5.1`。
- 贸然升级可能破坏 Expo SDK 54 和 Reanimated 兼容性。
- P2 先验证 recorder / buffer queue 的基础路径。

如果 Development Build 真机运行失败，再单独评估：

- 升级 `react-native-worklets` 到 `>=0.6.0`
- 升级 Reanimated 兼容版本
- 降级 `react-native-audio-api`
- 改用自定义 Expo Module

### 2.2 实际采样率和 chunk 时长可能不等于请求值

`AudioRecorder.onAudioReady` 可以请求：

```text
sampleRate: 16000
bufferLength: 640
channelCount: 1
```

但库类型说明实际值可能因设备不同而变化。因此真机必须记录：

- `actualSampleRate`
- `actualChunkMs`
- `numFrames`
- `level`

如果实际不是 16kHz / 40ms：

- 优先在前端重切片。
- 如 sampleRate 不稳定，再决定前端重采样或后端兼容。

### 2.3 Expo Go 不可验证

该库包含原生模块。P2 必须使用 Expo Development Build 或 EAS/Prebuild 真机验证，不能用 Expo Go 作为结论依据。

## 3. 真机验证清单

### Recorder

- iOS / Android 麦克风权限需继续分别确认。
- 点击“开始录音”后状态应从 `requesting permission` 进入 `waiting for first frame`。
- 点击“开始录音”后 `framesReceived` 持续增长。
- 如果停留在 `waiting for first frame`，说明权限和 session 已通过，但 `onAudioReady` 没有回调。
- `actualSampleRate` 是否接近 16000。
- `actualChunkMs` 是否接近 40ms。
- 说话时 `level` 明显升高。
- 点击“停止”后 frame 停止增长。
- 离开页面后录音释放。

### Player

- 点击“Source 测试”能听到测试音。
- 点击“队列播放”能听到测试音，状态进入 `tone enqueued`。
- 录音 1-2 秒后点击“播放录音”，应能听到刚才录到的声音。
- 多次点击是否能连续入队播放仍需在真实 AI 音频片段下验证。
- 点击“清队列”后后续 queued buffer 不继续播放。
- 离开页面后播放资源释放。

## 4. P2 验收口径

P2 不要求完成真实 WebSocket 上行，不要求完成真实 AI 音频播放。

P2 只回答四个问题：

```text
1. App 能不能持续拿到 raw audio buffer？
2. 能不能稳定转成后端需要的 PCM16 base64 frame？
3. 能不能用 buffer queue 播放短音频片段？
4. 当前 Expo SDK 54 + worklets 0.5.1 是否能跑通 Development Build？
```

如果第 4 点失败，P2 结论不应进入 P3，而应先处理音频原生兼容性。
