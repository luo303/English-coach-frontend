import {
  HistoryRecord,
  Metric,
  MockRealtimeStep,
  RealtimeScoreSnapshot,
  Scenario,
  TabItem,
} from '@/types/practice';

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

export const initialRealtimeScore: RealtimeScoreSnapshot = {
  fluency: 80,
  grammar: 78,
  overall: 82,
  pronunciation: 84,
};

export const mockRealtimeTimeline: MockRealtimeStep[] = [
  {
    audioLevel: 8,
    delayMs: 500,
    latencyMs: 238,
    status: 'connecting',
  },
  {
    audioLevel: 16,
    delayMs: 1100,
    finalTurn: {
      isFinal: true,
      speaker: 'assistant',
      text: 'Can you summarize what blocked the release this week?',
      turnId: 'turn_assistant_1',
    },
    latencyMs: 221,
    status: 'listening',
  },
  {
    audioLevel: 68,
    delayMs: 2100,
    partialTurn: {
      isFinal: false,
      speaker: 'user',
      text: 'The QA found two critical bugs and we need...',
      turnId: 'turn_user_1',
    },
    status: 'user_speaking',
  },
  {
    audioLevel: 82,
    delayMs: 3200,
    partialTurn: {
      isFinal: false,
      speaker: 'user',
      text: 'The QA found two critical bugs and we need one more day to verify.',
      turnId: 'turn_user_1',
    },
    status: 'user_speaking',
  },
  {
    audioLevel: 20,
    delayMs: 4300,
    finalTurn: {
      isFinal: true,
      speaker: 'user',
      text: 'The QA found two critical bugs and we need one more day to verify.',
      turnId: 'turn_user_1',
    },
    hint: {
      id: 'hint_timing_1',
      message: '表达正确，暂不打断。课后加入 risk mitigation 表达拓展。',
      severity: 'low',
      title: '时机控制',
      type: 'timing',
    },
    status: 'assistant_thinking',
  },
  {
    audioLevel: 14,
    delayMs: 5600,
    partialTurn: {
      isFinal: false,
      speaker: 'assistant',
      text: 'Good. What is your mitigation plan...',
      turnId: 'turn_assistant_2',
    },
    latencyMs: 218,
    status: 'assistant_speaking',
  },
  {
    audioLevel: 18,
    delayMs: 6800,
    finalTurn: {
      isFinal: true,
      speaker: 'assistant',
      text: 'Good. What is your mitigation plan, and who owns the verification?',
      turnId: 'turn_assistant_2',
    },
    hint: {
      id: 'hint_pronunciation_1',
      message: 'critical 的重音放在首音节，后续复练 cri-ti-cal。',
      severity: 'medium',
      title: '发音提示',
      type: 'pronunciation',
    },
    score: {
      fluency: 83,
      grammar: 80,
      overall: 84,
      pronunciation: 82,
    },
    status: 'listening',
  },
  {
    audioLevel: 75,
    delayMs: 8100,
    partialTurn: {
      isFinal: false,
      speaker: 'user',
      text: 'The backend owner will verify the fix before noon...',
      turnId: 'turn_user_2',
    },
    status: 'user_speaking',
  },
  {
    audioLevel: 22,
    delayMs: 9300,
    finalTurn: {
      isFinal: true,
      speaker: 'user',
      text: 'The backend owner will verify the fix before noon, and I will update the release channel.',
      turnId: 'turn_user_2',
    },
    hint: {
      id: 'hint_expression_1',
      message: '可以升级为: I will post a release update once verification is complete.',
      severity: 'medium',
      title: '表达升级',
      type: 'expression',
    },
    score: {
      fluency: 84,
      grammar: 82,
      overall: 85,
      pronunciation: 83,
    },
    status: 'assistant_thinking',
  },
  {
    audioLevel: 12,
    delayMs: 10800,
    finalTurn: {
      isFinal: true,
      speaker: 'assistant',
      text: 'Clear and actionable. Let us end here and review your strongest phrases.',
      turnId: 'turn_assistant_3',
    },
    latencyMs: 226,
    status: 'assistant_speaking',
  },
];

export const tabs: TabItem[] = [
  { key: 'practice', label: '练习', icon: '◎' },
  { key: 'conversation', label: '对话', icon: '◐' },
  { key: 'summary', label: '总结', icon: '▣' },
  { key: 'history', label: '历史', icon: '≡' },
];
