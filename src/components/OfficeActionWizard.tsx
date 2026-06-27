import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Wand2,
  Upload, FileText, Table2, AlertTriangle, BookOpen,
  Scale, TrendingUp, Send, ExternalLink, Lightbulb,
  AlertCircle, Loader2, X, Plus, CircleDot, ArrowRight,
  Download, Copy, Bot, Eye, EyeOff, Shield, Target,
  Award, Globe, Factory, Lock, Unlock, FileSearch,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface OfficeActionData {
  caseNumber: string
  applicationNumber: string
  inventionName: string
  applicant: string
  officeActionDate: string
  deadline: string
  examinerName: string
  // Step 1
  officeActionContent: string
  claimsContent: string
  // Step 2
  featureComparison: string
  synergyAnalysis: string
  // Step 3
  closestPriorArtAnalysis: string
  technicalProblemDiff: string
  // Step 4
  distinguishingFeatures: string
  secondaryReferenceAnalysis: string
  // Step 5
  commonKnowledgePoints: string
  routineMeansAnalysis: string
  // Step 6
  hindsightAnalysis: string
  gapAnalysis: string
  // Step 7
  socialValue: string
  economicValue: string
  // Step 8
  responseContent: string
  amendedClaims: string
}

const STEPS = [
  {
    id: 'import',
    title: '导入审查意见',
    subtitle: '上传审查意见通知书及相关文件',
    icon: Upload,
    color: '#3B82F6',
    desc: '导入审查意见通知书、当前权利要求书等核心文件',
    aiAction: 'AI智能解析审查意见',
    templateTitle: '审查意见导入指引',
    regulations: ['《专利法》第37条：国务院专利行政部门对发明专利申请进行实质审查后，认为不符合本法规定的，应当通知申请人', '《专利审查指南》第四部分第三章：审查意见通知书的内容'],
  },
  {
    id: 'featureCompare',
    title: '技术特征对比',
    subtitle: '拆解技术方案，制作特征对比表',
    icon: Table2,
    color: '#8B5CF6',
    desc: '将本申请权利要求与对比文件技术方案进行逐项对比，挖掘技术特征之间的协同作用',
    aiAction: 'AI生成技术特征对比表',
    templateTitle: '技术特征对比分析模板',
    regulations: ['《专利审查指南》第二部分第四章：创造性判断的三步法', '《专利法》第22条第3款：创造性判断'],
  },
  {
    id: 'closestPriorArt',
    title: '最接近现有技术分析',
    subtitle: '论证对比文件1不适合作为最接近现有技术',
    icon: Target,
    color: '#10B981',
    desc: '挖掘对比文件1与本申请要解决的技术问题差异，论证其不适合作为改进起点',
    aiAction: 'AI分析最接近现有技术适用性',
    templateTitle: '最接近现有技术分析模板',
    regulations: ['《专利审查指南》第二部分第四章4.2.1.1节：最接近的现有技术', '三步法第一步：确定最接近的现有技术'],
  },
  {
    id: 'distinguishingFeatures',
    title: '区别技术特征分析',
    subtitle: '核对事实认定，挖掘技术启示',
    icon: AlertTriangle,
    color: '#F59E0B',
    desc: '核对审查员指出的区别技术特征是否准确，分析对比文件2/3等能否提供技术启示',
    aiAction: 'AI分析区别技术特征与技术启示',
    templateTitle: '区别技术特征分析模板',
    regulations: ['《专利审查指南》第二部分第四章4.2.1.2节：确定发明的区别特征和实际解决的技术问题', '三步法第二步：确定区别特征'],
  },
  {
    id: 'commonKnowledge',
    title: '公知常识评述',
    subtitle: '针对性反驳"常规技术手段"滥用',
    icon: Scale,
    color: '#EF4444',
    desc: '汇总审查员使用的"常规技术手段"或"公知常识"，从法律依据和逻辑层面进行针对性答复',
    aiAction: 'AI识别并反驳公知常识滥用',
    templateTitle: '公知常识评述策略模板',
    regulations: ['《专利审查指南》第二部分第四章4.2.1.3节：判断要求保护的发明对本领域技术人员是否显而易见', '三步法第三步：判断显而易见性'],
  },
  {
    id: 'hindsight',
    title: '事后诸葛亮评述',
    subtitle: '还原发明过程，揭示倒推逻辑',
    icon: BookOpen,
    color: '#06B6D4',
    desc: '分析审查员评述中存在的"事后诸葛亮"问题，强调技术方案的倒推违背三步法原则',
    aiAction: 'AI揭示事后诸葛亮逻辑',
    templateTitle: '事后诸葛亮评述模板',
    regulations: ['《专利审查指南》第二部分第四章4.2.1节：创造性判断的基本方法', '最高人民法院专利侵权司法解释'],
  },
  {
    id: 'valueAnalysis',
    title: '价值分析',
    subtitle: '挖掘社会价值与经济价值',
    icon: TrendingUp,
    color: '#EC4899',
    desc: '从卡脖子、出海、打破垄断、自主知识产权、国产替代等角度挖掘专利价值',
    aiAction: 'AI分析专利社会经济价值',
    templateTitle: '专利价值分析模板',
    regulations: ['《专利法》第1条：保护专利权人的合法权益，鼓励发明创造，推动发明创造的应用', '知识产权强国建设纲要'],
  },
  {
    id: 'writeResponse',
    title: '撰写答复文件',
    subtitle: '生成正式答复意见及修改后的权利要求书',
    icon: Send,
    color: '#22C55E',
    desc: '整合以上分析，撰写符合国知局格式要求的审查意见答复书',
    aiAction: 'AI生成答复文件初稿',
    templateTitle: '审查意见答复书撰写规范',
    regulations: ['《专利法实施细则》第51条：发明专利申请人在提出实质审查请求时以及在收到国务院专利行政部门发出的发明专利申请进入实质审查阶段通知书之日起3个月内，可以对发明专利申请主动提出修改', '《专利审查指南》第五部分第一章：答复期限'],
  },
] as const

type StepId = typeof STEPS[number]['id']

function getStepTemplate(stepId: StepId): string {
  const templates: Record<StepId, string> = {
    import: `# 审查意见导入指引

## 必填文件

### 1. 审查意见通知书
> 从国知局下载的正式审查意见通知书PDF文件

### 2. 当前权利要求书
> 提交审查时的权利要求书全文
### 3. 说明书（可选）
> 提交审查时的说明书全文
### 4. 对比文件（可选）
> 审查员引用的对比文件列表

## 基本信息填写

| 项目 | 内容 |
|------|------|
| 案件编号 | |
| 申请号 | |
| 发明名称 | |
| 申请人 | |
| 审查意见发文日 | |
| 答复期限 | |
| 审查员姓名 | |

## 审查意见要点梳理

### 审查类型
- □ 第一次审查意见通知书
- □ 第二次审查意见通知书
- □ 驳回决定

### 主要驳回理由
- □ 新颖性问题（《专利法》第22条第2款）
- □ 创造性问题（《专利法》第22条第3款）
- □ 实用性问题（《专利法》第22条第4款）
- □ 公开不充分（《专利法》第26条第3款）
- □ 权利要求不清楚（《专利法》第26条第4款）
- □ 其他：`,
    featureCompare: `# 技术特征对比分析模板
## 一、技术方案拆解
### 本申请权利要求技术特征拆解
| 特征编号 | 技术特征 | 特征类型 | 技术效果 |
|---------|---------|---------|---------|
| F1 | | 结构/方法/功能 | |
| F2 | | 结构/方法/功能 | |
| F3 | | 结构/方法/功能 | |

### 对比文件1技术特征拆解
| 特征编号 | 技术特征 | 特征类型 | 技术效果 |
|---------|---------|---------|---------|
| D1-1 | | 结构/方法/功能 | |
| D1-2 | | 结构/方法/功能 | |
| D1-3 | | 结构/方法/功能 | |

## 二、技术特征对比表

| 本申请特征 | 对比文件1对应特征 | 是否相同 | 差异分析 |
|-----------|------------------|---------|---------|
| | | | |
| | | | |
| | | | |

## 三、协同作用深度挖掘
### 特征协同关系图
\`\`\`
特征A ──协同作用── 特征B
    │                   │
    ├──协同作用── 特征C──┘
    │
    └──协同作用── 特征D
\`\`\`

### 协同效果分析

**协同作用1**：特征A与特征B的协同
- 单独效果：特征A实现______，特征B实现______
- 协同效果：二者结合后产生______（1+1>2）
- 技术原理：______

**协同作用2**：特征组合的整体效果
- 多个特征共同作用实现______
- 这种组合效果在现有技术中未被披露或教导
## 四、关键区别技术特征
> 提炼出真正使本申请具备创造性的核心区别特征`,
    closestPriorArt: `# 最接近现有技术分析模板
## 一、对比文件1技术领域分析
### 对比文件1实际技术领域
> 分析对比文件1的实际技术领域和应用场景

**对比文件1要解决的技术问题**：______

**对比文件1的技术方案**：______

**对比文件1的技术效果**：______

## 二、本申请技术领域分析
### 本申请实际技术领域
> 分析本申请的实际技术领域和应用场景

**本申请要解决的技术问题**：______

**本申请的技术方案**：______

**本申请的技术效果**：______

## 三、技术问题差异分析
### 二者要解决的技术问题差异
| 对比维度 | 对比文件1 | 本申请 | 差异分析 |
|---------|----------|--------|---------|
| 技术领域 | | | |
| 应用场景 | | | |
| 核心需求 | | | |
| 技术路径 | | | |
| 预期效果 | | | |

## 四、论证对比文件1不适合作为最接近现有技术
### 正面论证（本领域技术人员视角）

1. **研发起点分析**：
   - 从正向研发角度，本领域技术人员面临的技术问题是______
   - 对比文件1针对的是______领域的问题，与本申请的技术问题差异巨大
   - 本领域技术人员不会选择一个解决不同问题的现有技术作为改进起点
2. **技术距离分析**：
   - 对比文件1的技术方案与本申请的技术方案之间存在______差异
   - 这种差异不是简单的改进，而是______层面的不同
   - 需要跨越______技术障碍才能从对比文件1到达本申请
3. **动机分析**：
   - 对比文件1没有给出任何动机去解决本申请要解决的技术问题
   - 本领域技术人员在对比文件1的基础上，没有理由向本申请的方向改进
### 法律依据

> 《专利审查指南》第二部分第四章4.2.1.1节：
> "最接近的现有技术，是指现有技术中与要求保护的发明最密切相关的一个技术方案，它是判断发明是否具有突出的实质性特点的基础。最接近的现有技术通常与要求保护的发明属于相同或相近的技术领域，并且所要解决的技术问题、技术效果或者用途最接近，或公开了发明的技术特征最多，或者虽然与要求保护的发明技术领域不同，但能够实现发明的功能，并且公开发明的技术特征最多。"`,
    distinguishingFeatures: `# 区别技术特征分析模板
## 一、审查员指出的区别技术特征核对
### 审查员认定的区别特征
> 摘录审查意见中关于区别技术特征的原文

\`\`\`
[审查员原文摘录]
\`\`\`

### 事实认定核对

| 审查员认定的区别特征 | 事实是否准确 | 核对说明 |
|-------------------|-------------|---------|
| | □ 准确 □ 不准确 | |
| | □ 准确 □ 不准确 | |

### 事实认定差错分析

> 如果审查员存在事实认定错误，请详细分析
**错误1**：______
- 审查员认定：______
- 实际情况：______
- 证据依据：______（引用本申请说明书或权利要求书具体内容）

## 二、对比文件2/3技术启示分析
### 对比文件2技术方案拆解
| 特征编号 | 技术特征 | 技术效果 |
|---------|---------|---------|
| D2-1 | | |
| D2-2 | | |

### 区别特征与对比文件2相应特征的对比
| 本申请区别特征 | 对比文件2相应特征 | 是否相同/等同 | 差异分析 |
|---------------|------------------|--------------|---------|
| | | | |

### 技术启示判断
#### 特征割裂问题分析

> 如果审查员将本申请的多个协同特征割裂判断，请分析

**割裂判断问题**：
- 审查员将特征______和特征______割裂开来分别判断
- 但实际上，这两个特征是______（协同关系/相互依赖/整体设计的一部分）
- 对比文件2仅披露了特征______，没有披露特征______，更没有披露二者的协同关系

#### 技术启示结论
> 根据以上分析，判断对比文件2/3是否能提供技术启示
**结论**：对比文件2/3无法提供相应的技术启示，理由如下：
1. ______
2. ______
3. ______`,
    commonKnowledge: `# 公知常识评述策略模板

## 一、审查意见中公知常识/常规技术手段汇总
### 汇总表

| 序号 | 审查员表述 | 涉及技术特征 | 出现次数 | 评述策略 |
|------|-----------|--------------|---------|---------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## 二、"常规技术手段"针对性答复
### 1. 法律定义缺失问题

> 《专利审查指南》并未对"常规技术手段"给出明确定义

**评述要点**：
- 审查员使用"常规技术手段"这一表述，但未给出任何法律依据或明确定义
- 根据《专利法》和《专利审查指南》，创造性判断应基于客观证据，而非主观臆断
- 审查员有义务举证说明为何某技术手段属于"常规技术手段"

### 2. 引用法律基础缺失问题

> 审查员未引用任何现有技术文献来支持"常规技术手段"的认定
**评述要点**：
- 审查员认定______属于"常规技术手段"，但未提供任何证据支持
- 根据证据规则，审查员应提供相应的证据（如教科书、技术手册、现有技术文献等）来证明其主张
- 仅凭审查员主观认定，不足以否定本申请的创造性
### 3. 滥用问题分析

> "常规技术手段"经常被滥用，成为审查员规避举证责任的工具

**评述要点**：
- 在本案中，审查员多次使用"常规技术手段"这一表述，但均未提供证据支持
- 这种做法实际上是将审查员的主观判断等同于客观事实，违背了证据裁判原则
- 本申请的技术方案是申请人经过______研究和实验得出的，并非简单的"常规技术手段"组合

### 4. 主观武断问题

> "常规技术手段"的认定缺乏客观标准，具有很强的主观性
**评述要点**：
- "常规技术手段"的认定因人而异，不同审查员可能有不同理解
- 这种主观性导致创造性判断缺乏一致性和可预测性
- 审查员应避免使用这种主观表述，而应基于客观证据进行判断

## 三、公知常识举证责任
### 法律依据

> 《专利审查指南》第二部分第四章4.2.1.3节：
> "如果所属技术领域的技术人员在现有技术的基础上仅仅通过合乎逻辑的分析、推理或者有限的试验就能得到该发明，则该发明是显而易见的。"

### 评述要点

- 审查员主张某技术手段属于公知常识，应承担举证责任
- 举证方式包括：引用教科书、技术手册、现有技术文献等
- 在审查员未提供充分证据的情况下，"常规技术手段"的认定不能成立`,
    hindsight: `# 事后诸葛亮评述模板
## 一、审查员评述逻辑分析

### 审查员的推理过程

> 梳理审查员从对比文件到本申请的推理逻辑

\`\`\`
对比文件1 → 对比文件2 → 本申请
   │           │          │
   特征A       特征B      特征A+B+C
\`\`\`

### 倒推逻辑揭示

> 分析审查员是否采用了"事后诸葛亮"的倒推方法

**倒推特征识别**：
| 特征 | 审查员的推理 | 是否属于倒推 | 分析 |
|------|-------------|------------|------|
| | | □ 是 □ 否 | |
| | | □ 是 □ 否 | |

## 二、正向研发过程还原
### 本申请的实际研发过程

> 从发明人的视角还原发明过程
**研发起点**：
- 发明人面临的技术问题：______
- 现有技术的局限：______

**研发路径**：
1. 第一步：______
2. 第二步：______
3. 第三步：______

**关键突破**：
- 在______阶段，发明人发现了______
- 这一发现是______（非显而易见的/需要创造性劳动的）
### 对比文件能教导的技术方案
> 分析从对比文件1和对比文件2出发，本领域技术人员能够得到的技术方案
**从对比文件1出发**：
- 对比文件1教导的技术方案：______
- 本领域技术人员能想到的改进：______
- 无法到达本申请的原因：______

**从对比文件2出发**：
- 对比文件2教导的技术方案：______
- 本领域技术人员能想到的改进：______
- 无法到达本申请的原因：______

**组合对比文件1+2**：
- 组合后的技术方案：______
- 与本申请的差距：______

## 三、"事后诸葛亮"违背三步法原则
### 三步法的核心要求

> 《专利审查指南》第二部分第四章4.2.1节：
> "发明是否具备创造性，应当基于所属技术领域的技术人员的知识和能力进行评价。所属技术领域的技术人员，也可称为本领域技术人员，是指一种假设的'人'，假定他知晓申请日或者优先权日之前发明所属技术领域所有的普通技术知识，能够获知该领域中所有的现有技术，并且具有应用该日期之前常规实验手段的能力，但他不具有创造能力。"

### 违背分析

**违背1**：审查员使用了本申请的技术方案作为判断依据
- 审查员在分析时，已经知晓了本申请的技术方案
- 这种"先知"状态导致审查员的判断带有偏见
**违背2**：审查员进行了"倒推"而非"正向推导"
- 正确的三步法要求从现有技术"正向推导"到本申请
- 审查员实际上是从本申请"倒推"到现有技术，寻找可以组合的对比文件
**违背3**：忽略了技术路径的非显而易见性
- 审查员只关注最终结果的相似性，忽略了到达该结果的技术路径
- 实际上，从现有技术到本申请的路径是______（非显而易见的）
## 四、评述要点总结

> 综合以上分析，总结"事后诸葛亮"问题的评述要点
1. ______
2. ______
3. ______`,
    valueAnalysis: `# 专利价值分析模板
## 一、社会价值分析
### 1. 卡脖子技术突破
> 分析本专利是否涉及卡脖子技术领域
**技术领域**：______
**卡脖子现状**：______
**本专利的贡献**：______

### 2. 自主知识产权

> 分析本专利的自主创新程度

**创新类型**：□ 原始创新 □ 集成创新 □ 引进消化吸收再创新
**核心技术自主可控**：□ 是 □ 部分 □ 否
**知识产权布局**：______

### 3. 国产替代

> 分析本专利是否有助于实现国产替代

**替代对象**：______（国外技术/产品）
**替代程度**：______
**经济效益预估**：______

### 4. 技术标准制定
> 分析本专利是否参与或影响技术标准制定
**标准参与情况**：______
**专利与标准的关系**：______

## 二、经济价值分析
### 1. 出海战略支撑

> 分析本专利对企业出海战略的支撑作用
**目标市场**：______
**专利布局情况**：______
**出海保护价值**：______

### 2. 打破垄断

> 分析本专利是否有助于打破国外技术垄断
**垄断现状**：______
**本专利的突破点**：______
**打破垄断的路径**：______

### 3. 市场竞争力提升
> 分析本专利对企业市场竞争力的提升作用

**竞争优势**：______
**市场份额影响**：______
**商业价值预估**：______

### 4. 技术转让与许可

> 分析本专利的转让和许可潜力
**许可模式**：______
**潜在许可方**：______
**许可收益预估**：______

## 三、专利制度本质论述
### 保护创新的立法目的
> 《专利法》第1条：
> "为了保护专利权人的合法权益，鼓励发明创造，推动发明创造的应用，提高创新能力，促进科学技术进步和经济社会发展，制定本法。"

### 评述要点

1. **专利制度的核心是保护创新**：
   - 专利制度的目的不是为了限制技术发展，而是为了激励创新
   - 过于严格的创造性审查会抑制创新积极性
2. **保护本国产业的需要**：
   - 在当前国际竞争环境下，保护本国企业的创新成果尤为重要
   - 本专利的技术方案对于______（本国产业/技术领域）具有重要意义

3. **平衡专利权人与社会公众利益**：
   - 专利保护期限有限（发明专利20年），到期后技术将成为社会公共财富
   - 在保护期限内，应给予专利权人充分的保护`,
    writeResponse: `# 审查意见答复书撰写规范
## 一、答复文件结构（国知局标准格式）
### 1. 答复声明
> 表明是否同意审查员的意见，是否修改申请文件
### 2. 意见陈述书正文
#### 2.1 引言
> 简述案件基本情况和答复要点

#### 2.2 关于新颖性的意见（如有）
> 针对新颖性问题进行论证
#### 2.3 关于创造性的意见（核心部分）
> 按照以下结构组织
**2.3.1 关于最接近的现有技术**
> 论证对比文件1不适合作为最接近的现有技术
**2.3.2 关于区别技术特征**
> 核对事实认定，分析区别特征的创造性
**2.3.3 关于技术启示**
> 论证对比文件2/3等无法提供技术启示
**2.3.4 关于公知常识/常规技术手段**
> 针对性反驳审查员的认定
**2.3.5 关于"事后诸葛亮"问题**
> 揭示审查员的倒推逻辑

**2.3.6 关于专利价值**
> 阐述本专利的社会价值和经济价值
### 3. 修改说明
> 说明对申请文件的修改内容和依据
### 4. 权利要求书替换页
> 修改后的权利要求书全文
### 5. 说明书替换页（如有）
> 修改后的说明书相关部分
## 二、撰写注意事项
### 格式要求
- 使用国知局标准表格或CPC客户端模板
- 字体：宋体，正文小四，标题四号加粗
- 纸张：A4，双面打印
### 内容要求
- 逻辑清晰，层次分明
- 引用证据准确，标注出处
- 避免情绪化表达，保持专业客观
- 严格依据《专利法》和《专利审查指南》
### 期限要求
- 第一次审查意见：4个月内答复
- 第二次审查意见及以后：2个月内答复
- 驳回决定：3个月内提出复审请求
## 三、答复策略建议
### 修改策略
- □ 仅陈述意见，不修改权利要求书
- □ 修改权利要求书，缩小保护范围
- □ 修改权利要求书，调整权利要求层次

### 论证策略
- □ 重点论证最接近现有技术问题
- □ 重点论证区别技术特征的创造性
- □ 全面论证，覆盖所有驳回理由`,
  }
  return templates[stepId]
}

export default function OfficeActionWizard() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectData, setProjectData] = useState<OfficeActionData>({
    caseNumber: '',
    applicationNumber: '',
    inventionName: '',
    applicant: '',
    officeActionDate: '',
    deadline: '',
    examinerName: '',
    officeActionContent: '',
    claimsContent: '',
    featureComparison: '',
    synergyAnalysis: '',
    closestPriorArtAnalysis: '',
    technicalProblemDiff: '',
    distinguishingFeatures: '',
    secondaryReferenceAnalysis: '',
    commonKnowledgePoints: '',
    routineMeansAnalysis: '',
    hindsightAnalysis: '',
    gapAnalysis: '',
    socialValue: '',
    economicValue: '',
    responseContent: '',
    amendedClaims: '',
  })

  const currentStepData = STEPS[currentStep]

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFieldChange = (field: keyof OfficeActionData, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }))
  }

  const handleAiAction = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const aiGeneratedContent: Partial<OfficeActionData> = {
      import: {
        officeActionContent: 'AI已解析审查意见，识别出创造性驳回理由，涉及对比文件1和对比文件2。',
      },
      featureCompare: {
        featureComparison: 'AI已生成技术特征对比表，识别出3个关键区别特征及其协同作用。',
        synergyAnalysis: '特征A与特征B的协同作用产生了意想不到的技术效果，这种协同在现有技术中未被披露。',
      },
      closestPriorArt: {
        closestPriorArtAnalysis: 'AI分析表明对比文件1与本申请要解决的技术问题存在本质差异，不适合作为最接近现有技术。',
        technicalProblemDiff: '对比文件1解决的是效率问题，而本申请解决的是精度问题，二者技术路径完全不同。',
      },
      distinguishingFeatures: {
        distinguishingFeatures: '审查员对区别特征的认定存在事实错误，特征X的描述不准确。',
        secondaryReferenceAnalysis: '对比文件2无法提供技术启示，因为其技术领域和应用场景与本申请完全不同。',
      },
      commonKnowledge: {
        commonKnowledgePoints: '审查意见中使用了3次"常规技术手段"或"公知常识"，均未提供证据支持。',
        routineMeansAnalysis: '审查员滥用"常规技术手段"表述，未引用任何法律依据或现有技术文献。',
      },
      hindsight: {
        hindsightAnalysis: '审查员采用了典型的"事后诸葛亮"倒推方法，违背了三步法的正向推导原则。',
        gapAnalysis: '从对比文件1出发，本领域技术人员无法显而易见地得到本申请的技术方案。',
      },
      valueAnalysis: {
        socialValue: '本专利属于卡脖子技术领域，实现了核心技术自主可控，具有重要的战略意义。',
        economicValue: '本专利有助于打破国外技术垄断，实现国产替代，预估年经济效益可达XX万元。',
      },
      writeResponse: {
        responseContent: 'AI已生成审查意见答复书初稿，包含完整的论证逻辑和修改建议。',
        amendedClaims: 'AI已生成修改后的权利要求书，优化了权利要求层次和保护范围。',
      },
    }[STEPS[currentStep].id]

    if (aiGeneratedContent) {
      setProjectData(prev => ({ ...prev, ...aiGeneratedContent }))
    }
    
    setIsSubmitting(false)
  }

  const handleSubmit = () => {
    alert('审查意见答复文件已生成！')
  }

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r border-[var(--navy-700)] flex flex-col" style={{ background: 'var(--navy-900)' }}>
        <div className="p-4 border-b border-[var(--navy-700)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">审查意见答复向导</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">共 {STEPS.length} 个步骤</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentStep === index
                    ? 'bg-[var(--gold-400)]/10 border border-[var(--gold-400)]'
                    : index < currentStep
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'hover:bg-[var(--navy-700)] text-[var(--text-secondary)]'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{
                  background: currentStep === index ? 'var(--gold-400)' : index < currentStep ? 'var(--success)' : 'var(--navy-700)'
                }}>
                  {index < currentStep ? (
                    <Check size={16} className={currentStep === index ? 'text-[var(--navy-900)]' : 'text-white'} />
                  ) : (
                    <span className={`text-xs font-bold ${currentStep === index ? 'text-[var(--navy-900)]' : 'text-[var(--text-primary)]'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${currentStep === index ? 'text-[var(--gold-400)]' : index < currentStep ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{step.subtitle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--navy-700)]">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-[var(--gold-400)]" />
            <span className="text-xs text-[var(--text-secondary)]">当前步骤法规依据</span>
          </div>
          <ul className="space-y-1">
            {currentStepData.regulations.map((reg, idx) => (
              <li key={idx} className="text-xs text-[var(--text-muted)]">
                {reg}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${currentStepData.color}20` }}>
                  <currentStepData.icon size={20} style={{ color: currentStepData.color }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">{currentStepData.title}</h1>
                  <p className="text-sm text-[var(--text-muted)]">{currentStepData.desc}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAiAction}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {currentStepData.aiAction}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              {(currentStep === 0 || currentStep === 7) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="rounded-xl border border-[var(--navy-700)] p-4" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">基本信息</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">案件编号</label>
                        <input
                          type="text"
                          value={projectData.caseNumber}
                          onChange={(e) => handleFieldChange('caseNumber', e.target.value)}
                          className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          placeholder="输入案件编号"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">申请号</label>
                        <input
                          type="text"
                          value={projectData.applicationNumber}
                          onChange={(e) => handleFieldChange('applicationNumber', e.target.value)}
                          className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          placeholder="输入申请号"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">发明名称</label>
                        <input
                          type="text"
                          value={projectData.inventionName}
                          onChange={(e) => handleFieldChange('inventionName', e.target.value)}
                          className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          placeholder="输入发明名称"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">申请人</label>
                        <input
                          type="text"
                          value={projectData.applicant}
                          onChange={(e) => handleFieldChange('applicant', e.target.value)}
                          className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          placeholder="输入申请人名称"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">发文日</label>
                          <input
                            type="date"
                            value={projectData.officeActionDate}
                            onChange={(e) => handleFieldChange('officeActionDate', e.target.value)}
                            className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">答复期限</label>
                          <input
                            type="date"
                            value={projectData.deadline}
                            onChange={(e) => handleFieldChange('deadline', e.target.value)}
                            className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">审查员</label>
                        <input
                          type="text"
                          value={projectData.examinerName}
                          onChange={(e) => handleFieldChange('examinerName', e.target.value)}
                          className="w-full rounded-lg border border-[var(--navy-700)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
                          placeholder="输入审查员姓名"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--navy-700)] p-4" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">文件上传</h3>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-[var(--navy-700)] rounded-lg p-4 text-center hover:border-[var(--gold-400)] transition-colors">
                        <Upload size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
                        <p className="text-xs text-[var(--text-secondary)]">上传审查意见通知书</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">支持PDF格式</p>
                      </div>
                      <div className="border-2 border-dashed border-[var(--navy-700)] rounded-lg p-4 text-center hover:border-[var(--gold-400)] transition-colors">
                        <FileText size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
                        <p className="text-xs text-[var(--text-secondary)]">上传当前权利要求书</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">支持DOC/DOCX/PDF格式</p>
                      </div>
                      <div className="border-2 border-dashed border-[var(--navy-700)] rounded-lg p-4 text-center hover:border-[var(--gold-400)] transition-colors">
                        <FileSearch size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
                        <p className="text-xs text-[var(--text-secondary)]">上传对比文件（可选）</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">支持PDF格式，可多个</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(currentStep === 0 || currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5 || currentStep === 6 || currentStep === 7) && (
                <>
                  <div className="rounded-xl border border-[var(--navy-700)] p-6 mb-6" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{currentStepData.templateTitle}</h3>
                      <button className="flex items-center gap-1 text-xs text-[var(--gold-400)] hover:underline">
                        <Copy size={12} /> 复制模板
                      </button>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none" style={{ background: '#0F172A', padding: '1rem', borderRadius: '0.5rem' }}>
                      <ReactMarkdown>{getStepTemplate(currentStepData.id as StepId)}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--navy-700)]" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <div className="p-4 border-b border-[var(--navy-700)] flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">分析内容</h3>
                      <button className="text-xs text-[var(--gold-400)] hover:underline">
                        使用AI生成
                      </button>
                    </div>
                    <textarea
                      value={projectData[STEPS[currentStep].id as keyof OfficeActionData] as string}
                      onChange={(e) => handleFieldChange(STEPS[currentStep].id as keyof OfficeActionData, e.target.value)}
                      className="w-full h-80 p-4 text-sm text-[var(--text-primary)] bg-transparent outline-none resize-none"
                      placeholder={`请在此输入${currentStepData.title}的分析内容...`}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-[var(--navy-700)] flex items-center justify-between" style={{ background: 'var(--navy-900)' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:bg-[var(--navy-700)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            上一步
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              >
                下一步
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--success)', color: 'var(--navy-900)' }}
              >
                <Send size={16} />
                生成答复文件
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}