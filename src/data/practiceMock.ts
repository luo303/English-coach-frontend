import { HistoryRecord, Metric, Scenario, TabItem } from '@/types/practice';

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

export const tabs: TabItem[] = [
  { key: 'practice', label: '练习', icon: '◎' },
  { key: 'conversation', label: '对话', icon: '◐' },
  { key: 'summary', label: '总结', icon: '▣' },
  { key: 'history', label: '历史', icon: '≡' },
];
