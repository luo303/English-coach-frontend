import {
  HistoryRecord,
  Metric,
  Scenario,
  TabItem,
} from '@/types/practice';
import { MockRealtimeStep } from '@/types/realtime';

export const scenarios: Scenario[] = [
  {
    id: 'meeting',
    title: '会议 Meeting',
    subtitle: '汇报进展、阻塞说明、确认 owner',
    level: 'B2',
    focus: ['职场表达', '推进讨论', '风险说明'],
    minutes: 8,
  },
  {
    id: 'interview',
    title: '面试 Interview',
    subtitle: '讲项目、回答追问、解释决策',
    level: 'B1-B2',
    focus: ['STAR 回答', '追问承接', '自信表达'],
    minutes: 10,
  },
  {
    id: 'ordering',
    title: '点餐 Ordering',
    subtitle: '推荐、忌口、换菜与结账',
    level: 'A2',
    focus: ['日常反应', '礼貌请求', '确认信息'],
    minutes: 6,
  },
  {
    id: 'support',
    title: '客服 Support',
    subtitle: '说明问题、争取补偿、确认方案',
    level: 'B1',
    focus: ['澄清问题', '协商表达', '结果复述'],
    minutes: 7,
  },
];

export const summaryMetrics: Metric[] = [
  { label: '发音清晰度', value: 84 },
  { label: '语法准确度', value: 80 },
  { label: '表达自然度', value: 76 },
  { label: '流利度', value: 83 },
];

export const historyRecords: HistoryRecord[] = [
  { title: 'Release 周会', score: 81, delta: '+5 分', time: '7:12', expression: 7 },
  { title: '产品决策面试', score: 84, delta: '+7 分', time: '8:12', expression: 9 },
  { title: '餐厅点餐', score: 79, delta: '稳定', time: '4:58', expression: 5 },
  { title: '客服沟通', score: 70, delta: '需复练', time: '6:20', expression: 4 },
];

export const mockRealtimeTimeline: MockRealtimeStep[] = [
  {
    delayMs: 500,
    event: {
      payload: {
        latencyMs: 238,
      },
      serverSeq: 1,
      sessionId: 'mock_session_001',
      type: 'session_ready',
    },
  },
  {
    delayMs: 800,
    event: {
      payload: {
        level: 16,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 1100,
    event: {
      payload: {
        isFinal: true,
        speaker: 'assistant',
        text: 'Can you summarize what blocked the release this week?',
        turnId: 'turn_assistant_1',
      },
      serverSeq: 2,
      sessionId: 'mock_session_001',
      type: 'transcript_final',
    },
  },
  {
    delayMs: 1500,
    event: {
      payload: {
        estimatedRttMs: 221,
      },
      serverSeq: 3,
      sessionId: 'mock_session_001',
      type: 'pong',
    },
  },
  {
    delayMs: 1900,
    event: {
      payload: {
        level: 68,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 2100,
    event: {
      payload: {
        isFinal: false,
        speaker: 'user',
        text: 'The QA found two critical bugs and we need...',
        turnId: 'turn_user_1',
      },
      serverSeq: 4,
      sessionId: 'mock_session_001',
      type: 'transcript_delta',
    },
  },
  {
    delayMs: 3000,
    event: {
      payload: {
        level: 82,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 3200,
    event: {
      payload: {
        isFinal: false,
        speaker: 'user',
        text: 'The QA found two critical bugs and we need one more day to verify.',
        turnId: 'turn_user_1',
      },
      serverSeq: 5,
      sessionId: 'mock_session_001',
      type: 'transcript_delta',
    },
  },
  {
    delayMs: 4100,
    event: {
      payload: {
        level: 20,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 4300,
    event: {
      payload: {
        isFinal: true,
        speaker: 'user',
        text: 'The QA found two critical bugs and we need one more day to verify.',
        turnId: 'turn_user_1',
      },
      serverSeq: 6,
      sessionId: 'mock_session_001',
      type: 'transcript_final',
    },
  },
  {
    delayMs: 4500,
    event: {
      payload: {
        id: 'hint_timing_1',
        message: '表达正确，暂不打断。课后加入 risk mitigation 表达拓展。',
        severity: 'low',
        title: '时机控制',
        type: 'timing',
      },
      serverSeq: 7,
      sessionId: 'mock_session_001',
      type: 'expression_hint',
    },
  },
  {
    delayMs: 5400,
    event: {
      payload: {
        level: 14,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 5600,
    event: {
      payload: {
        isFinal: false,
        speaker: 'assistant',
        text: 'Good. What is your mitigation plan...',
        turnId: 'turn_assistant_2',
      },
      serverSeq: 8,
      sessionId: 'mock_session_001',
      type: 'ai_reply_delta',
    },
  },
  {
    delayMs: 5900,
    event: {
      payload: {
        audioBase64: 'mock_pcm_base64_chunk_001',
        format: 'pcm16',
        id: 'audio_chunk_001',
        sampleRate: 24000,
        turnId: 'turn_assistant_2',
      },
      serverSeq: 9,
      sessionId: 'mock_session_001',
      type: 'ai_audio_chunk',
    },
  },
  {
    delayMs: 6600,
    event: {
      payload: {
        level: 18,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 6800,
    event: {
      payload: {
        isFinal: true,
        speaker: 'assistant',
        text: 'Good. What is your mitigation plan, and who owns the verification?',
        turnId: 'turn_assistant_2',
      },
      serverSeq: 10,
      sessionId: 'mock_session_001',
      type: 'transcript_final',
    },
  },
  {
    delayMs: 7000,
    event: {
      payload: {
        id: 'hint_pronunciation_1',
        message: 'critical 的重音放在首音节，后续复练 cri-ti-cal。',
        severity: 'medium',
        title: '发音提示',
        type: 'pronunciation',
      },
      serverSeq: 11,
      sessionId: 'mock_session_001',
      type: 'pronunciation_hint',
    },
  },
  {
    delayMs: 7200,
    event: {
      payload: {
        fluency: 83,
        grammar: 80,
        overall: 84,
        pronunciation: 82,
      },
      serverSeq: 12,
      sessionId: 'mock_session_001',
      type: 'score_snapshot',
    },
  },
  {
    delayMs: 7900,
    event: {
      payload: {
        level: 75,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 8100,
    event: {
      payload: {
        isFinal: false,
        speaker: 'user',
        text: 'The backend owner will verify the fix before noon...',
        turnId: 'turn_user_2',
      },
      serverSeq: 13,
      sessionId: 'mock_session_001',
      type: 'transcript_delta',
    },
  },
  {
    delayMs: 9100,
    event: {
      payload: {
        level: 22,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 9300,
    event: {
      payload: {
        isFinal: true,
        speaker: 'user',
        text: 'The backend owner will verify the fix before noon, and I will update the release channel.',
        turnId: 'turn_user_2',
      },
      serverSeq: 14,
      sessionId: 'mock_session_001',
      type: 'transcript_final',
    },
  },
  {
    delayMs: 9500,
    event: {
      payload: {
        id: 'hint_expression_1',
        message: '可以升级为: I will post a release update once verification is complete.',
        severity: 'medium',
        title: '表达升级',
        type: 'expression',
      },
      serverSeq: 15,
      sessionId: 'mock_session_001',
      type: 'expression_hint',
    },
  },
  {
    delayMs: 9700,
    event: {
      payload: {
        fluency: 84,
        grammar: 82,
        overall: 85,
        pronunciation: 83,
      },
      serverSeq: 16,
      sessionId: 'mock_session_001',
      type: 'score_snapshot',
    },
  },
  {
    delayMs: 10600,
    event: {
      payload: {
        level: 12,
      },
      type: 'local.audio_level',
    },
  },
  {
    delayMs: 10800,
    event: {
      payload: {
        isFinal: true,
        speaker: 'assistant',
        text: 'Clear and actionable. Let us end here and review your strongest phrases.',
        turnId: 'turn_assistant_3',
      },
      serverSeq: 17,
      sessionId: 'mock_session_001',
      type: 'transcript_final',
    },
  },
];

export const tabs: TabItem[] = [
  { key: 'practice', label: '练习', icon: '◎' },
  { key: 'conversation', label: '对话', icon: '◐' },
  { key: 'summary', label: '总结', icon: '▣' },
  { key: 'history', label: '历史', icon: '≡' },
];
