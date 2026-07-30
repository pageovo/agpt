// 每次课后，把最新记录复制到 lessons 数组的最上方。
// 日期使用 YYYY-MM-DD，progress 填 0 到 100 之间的数字。
window.LEARNING_DATA = {
  siteName: "向上学习",
  lastUpdated: "2026-07-30",

  student: {
    name: "林同学",
    grade: "初二",
    subjects: ["数学", "物理"],
    goal: "本阶段重点：稳固一次函数与几何基础，养成写完后主动验算的习惯。",
  },

  lessons: [
    {
      date: "2026-07-29",
      subject: "数学",
      content: "一次函数图像与性质，结合待定系数法求解析式",
      problem: "遇到图像平移题时，对 k、b 的变化判断不够稳定；计算后较少主动验算。",
      progress: 75,
      evaluation: "基础概念已经掌握，今天后半段能独立完成中档题。建议本周每天练习 2 道图像判断题。",
    },
    {
      date: "2026-07-25",
      subject: "物理",
      content: "密度公式的应用与单位换算",
      problem: "克每立方厘米和千克每立方米的换算容易漏掉数量级。",
      progress: 60,
      evaluation: "审题比上节课更仔细，公式使用正确。单位换算还需要通过专项练习巩固。",
    },
    {
      date: "2026-07-22",
      subject: "数学",
      content: "全等三角形判定方法复习与综合题训练",
      problem: "能够找到对应边，但书写证明过程时理由不够完整。",
      progress: 85,
      evaluation: "思路清楚，经过提醒后能规范写出证明步骤。下一阶段重点提高独立表达能力。",
    },
  ],
};
