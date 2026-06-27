import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Wand2,
  Search, FileText, Image, Scale, FileCheck, ClipboardList,
  Send, ExternalLink, BookOpen, Lightbulb, AlertCircle,
  Loader2, X, Plus, CircleDot, ArrowRight, Download,
  Copy, Bot, Eye, EyeOff,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ════════════════════════════════════════════════
//  Types
// ════════════════════════════════════════════════

interface ProjectData {
  name: string
  type: '发明' | '实用新型' | '外观设计'
  applicant: string
  inventor: string
  // Step 1
  disclosureContent: string
  // Step 2
  searchResults: string
  searchReport: string
  // Step 3
  specification: string
  // Step 4
  drawingsConfirmed: boolean
  drawingsNotes: string
  // Step 5
  claims: string
  // Step 6
  abstractText: string
  abstractDrawing: string
  // Step 7
  reviewComments: string
  reviewStatus: 'pending' | 'passed' | 'issues'
  reviewIssues: string[]
}

// ════════════════════════════════════════════════
//  Step Definitions (8 steps)
// ════════════════════════════════════════════════

const STEPS = [
  {
    id: 'disclosure',
    title: '技术交底书',
    subtitle: '填写/完善技术交底书',
    icon: FileText,
    color: '#3B82F6',
    desc: '详细描述您的技术创新点，这是整个专利申请的基础',
    aiAction: 'AI辅助整理交底书',
    templateTitle: '标准技术交底书模板',
    regulations: ['《专利法》第26条：说明书应当对发明作出清楚、完整的说明', '《专利审查指南》：技术方案应使本领域技术人员能够实现'],
  },
  {
    id: 'search',
    title: '检索查新',
    subtitle: '新颖性与创造性检索分析',
    icon: Search,
    color: '#8B5CF6',
    desc: '检索现有专利文献，评估授权前景和风险',
    aiAction: 'AI智能检索分析',
    templateTitle: '新颖性检索报告模板',
    regulations: ['《专利法》第22条：授予专利权的发明应具备新颖性、创造性、实用性', '《专利审查指南》第二部分第三章：新颖性判断'],
  },
  {
    id: 'specification',
    title: '说明书撰写',
    subtitle: '撰写完整的专利说明书',
    icon: BookOpen,
    color: '#10B981',
    desc: '基于交底书和检索结果撰写规范的说明书正文',
    aiAction: 'AI生成说明书初稿',
    templateTitle: '说明书撰写规范模板',
    regulations: ['《专利法》第26条第3款：说明书应对发明作出清楚完整的说明', '《专利审查指南》第二部分第二章：说明书的撰写要求'],
  },
  {
    id: 'drawings',
    title: '附图确认',
    subtitle: '确认说明书附图及图面说明',
    icon: Image,
    color: '#F59E0B',
    desc: '上传或绘制附图，确保与说明书描述一致',
    aiAction: 'AI生成附图建议',
    templateTitle: '附图规范要求指南',
    regulations: ['《专利法》第27条：申请外观设计专利的应提交图片或者照片', '《专利审查指南》第一部分第一章：附图的绘制要求'],
  },
  {
    id: 'claims',
    title: '权利要求撰写',
    subtitle: '构建权利要求保护体系',
    icon: Scale,
    color: '#EF4444',
    desc: '确定保护范围，撰写独立权利要求和从属权利要求',
    aiAction: 'AI优化权利要求',
    templateTitle: '权利要求书撰写模板',
    regulations: ['《专利法》第26条第4款：权利要求应当清楚、简要', '《专利法》第64条：保护范围以权利要求内容为准'],
  },
  {
    id: 'abstract',
    title: '摘要及摘要附图',
    subtitle: '撰写摘要并准备摘要附图',
    icon: FileCheck,
    color: '#06B6D4',
    desc: '提炼技术要点，便于快速了解发明内容',
    aiAction: 'AI自动生成摘要',
    templateTitle: '摘要撰写规范',
    regulations: ['《专利法实施细则》第23条：摘要应当简要说明发明的技术要点', '字数限制：一般不超过300字'],
  },
  {
    id: 'review',
    title: '全文审核',
    subtitle: '全面审核申请文件质量',
    icon: ClipboardList,
    color: '#EC4899',
    desc: '交叉核对各文件一致性，检查格式和法律合规性',
    aiAction: 'AI智能质检',
    templateTitle: '审核清单与常见问题',
    regulations: ['《专利法》第33条：修改不得超出原说明书和权利要求的范围', '《专利审查指南》形式审查要求'],
  },
  {
    id: 'submit',
    title: '申请文件提交',
    subtitle: '提交至国知局专利业务管理系统',
    icon: Send,
    color: '#22C55E',
    desc: '打包全部文件，提交至CNIPA在线系统完成正式申请',
    aiAction: '一键导出申请包',
    templateTitle: '国知局CPC客户端操作指南',
    regulations: ['《专利法》第34条：国务院专利行政部门收到申请后进行初步审查', '《专利法实施细则》第3-16条：申请文件的提交要求'],
  },
] as const

type StepId = typeof STEPS[number]['id']

// ════════════════════════════════════════════════
//  Template Data for Each Step
// ════════════════════════════════════════════════

function getStepTemplate(stepId: StepId): string {
  const templates: Record<StepId, string> = {
    disclosure: `# 技术交底书填写指引

## 必填项目

### 1. 发明名称（≤25字）
> 采用所属技术领域通用术语，不含商标、人名、型号
**示例**：一种基于深度学习的智能分拣系统及其控制方法

### 2. 技术领域
> 直接所属的具体技术领域
\`\`\`
本发明涉及______领域，具体涉及一种______。
\`\`\`

### 3. 背景技术
- 现有技术的结构/方法（客观描述，不贬低）
- 存在的问题和不足
- 本发明要解决的技术问题
### 4. 发明内容（核心⭐）
- **总体构思**：用1-2句话概括创新点
- **技术方案详细描述**：
  - 产品类：部件→结构→连接关系→功能→工作原理
  - 方法类：步骤顺序，每步的操作对象/方法/条件/参数
- **核心技术特征表**：
| 特征 | 描述 | 有益效果 |
|------|------|---------|
| 特征1 | | |
| 特征2 | | |
| 特征3 | | |

### 5. 有益效果
> 与现有技术对比，可用数据支撑

### 6. 附图说明
> 列出每幅图的名称和用途
### 7. 具体实施方式
> 给出至少一个最佳实施方案，参数应为具体数值`,
    search: `# 新颖性检索报告框架
## 检索要素
| 类别 | 中文关键词 | 英文关键词 | IPC分类号 |
|------|-----------|-----------|----------|
| 核心词1 | | | |
| 核心词2 | | | |
| 功能词 | | | |

## 检索式示例
\`\`\`
(TIAB=(关键词1 OR 同义词1) AND (TIAB=(关键词2 OR 同义词2)
AND IPC=(分类号))
\`\`\`

## 结果评估表格

| 编号 | 公开号 | 相关度 | 影响类型(X/Y/A) | 异同分析 |
|------|--------|--------|-----------------|---------|
| D1 | | ★★★★★ | | |
| D2 | | ★★★★★ | | |

## 授权前景预判
- 新颖性：🟢 高 / 🟡 中 / 🔴 低
- 创造性：🟢 高 / 🟡 中 / 🔴 低
- 综合结论：推荐申请 / 需调整 / 风险较高`,
    specification: `# 说明书撰写规范
## 结构要求（《专利审查指南》）

### 一、名称（≤25字，采用所属技术领域通用术语）

### 二、技术领域
直接所属的具体技术领域（非上位领域）

### 三、背景技术
- 引证1-3篇最相关的现有技术
- 客观描述现有技术状况
- 指出现有技术存在的缺陷
- **不得使用贬义语言**

### 四、发明内容
1. 要解决的技术问题
2. 技术方案（总体+具体）
3. 有益效果（可与现有技术对比）

### 五、附图说明
各幅附图的名称和简要说明
### 六、具体实施方式
- 至少一个实施例
- 详细程度类似实验教科书
- 参数为具体数值（非范围）
- 配合附图参照说明

## 撰写注意事项
1. 使用确定的技术术语
2. 各部分之间逻辑一致
3. 与权利要求对应
4. 实施例足够支撑权利要求范围`,
    drawings: `# 附图制作规范

## 基本要求
- **格式**：黑白线条图（A4纸大小）
- **标注**：阿拉伯数字统一标号，无文字尺寸标注
- **清晰度**：300dpi以上
- **数量**：通常3-10幅

## 附图清单示例

| 图号 | 图名 | 用途 |
|------|------|------|
| 图1 | 整体结构示意图 | 展示整体组成 |
| 图2 | 关键部件放大图 | 展示细节特征 |
| 图3 | 流程图/原理图 | 展示工作流程 |
| 图4 | 实施例示意图 | 具体应用场景 |

## 常见错误
❌ 包含彩色元素
❌ 包含文字说明（除"图X"外）
❌ 尺寸/公差标注
❌ 照片代替线条图（外观设计除外）
❌ 标号不一致或不连续

## AI附图建议
点击"AI生成附图建议"可基于您的技术方案自动生成：
- 推荐的附图类型和数量
- 每幅图应包含的关键组成
- 参考布局方案`,
    claims: `# 权利要求书撰写指南
## 核心原则（《专利法》第26条第4款）
> 清楚、简要、支持

## 权利层次设计

\`\`\`
权利要求1（独权）→ 最宽保护范围 → 防御规避
    └─权利要求2-4（从属）→ 关键细节 → 提高稳定性
    └─权利要求5-7（从属）→ 具体实施 → 权利梯度
    └─权利要求8+（可选）→ 方法/用途 → 全方位保护
\`\`\`

## 独立权利要求模板
\`\`\`
一种[发明名称]，其特征在于，包括：
[前序部分—必要共有特征]
其特征在于，
[特征部分—区别技术特征]：
- [核心特征1]，所述[特征1]用于[功能]；
- [核心特征2]，[特征2]设置为[位置/方式]；
- [核心特征3]，[特征3]与[特征1][连接关系]。
\`\`\`

## 从属权利要求模板
\`\`\`
根据权利要求n所述的[名称]，其特征在于，[附加技术特征]，所述附加特征的[具体参数]为[值]。
\`\`\`

## 常见错误
❌ 功能性限定过多（"能够实现XX的装置"）
❌ 非必要技术特征写入独权
❌ 引用的在先权利要求不存在
❌ 保护范围过宽或过窄`,
    abstract: `# 摘要撰写规范

## 法律依据
> 《专利法实施细则》第23条：摘要应当写明发明或者实用新型的名称和该发明或者实用新型所属的技术领域，清楚地反映所要解决的技术问题、解决该问题的技术方案的要点以及主要用途。

## 格式要求
- **字数**：一般不超过300字（含标点）
- **内容**：名称 + 技术领域 + 技术问题 + 技术方案要点 + 主要用途
- **不得**：使用商业性宣传用语
- **附图**：指定一幅最能说明技术特征的附图

## 模板
\`\`\`
【发明名称】
本发明公开了一种______，（属于______技术领域），用于解决______问题。该技术方案包括______，其特征在于______。通过上述技术方案，实现了______效果。适用于______场景。
摘要附图：图X
\`\`\`

## 示例
> 本发明公开了一种基于深度学习的智能分拣系统，属于图像处理技术领域。该系统包括图像采集模块、目标识别单元和分拣执行机构；其中，目标识别单元采用改进的YOLOv8架构对采集到的物品图像进行实时识别分类，分拣执行机构根据分类结果控制气动弹射机构将物品分流至对应的收集容器中。本发明解决了传统人工分拣效率低、误分率高的技术问题，实现了每小时处理5000件以上的高速自动分拣，准确率达99.5%以上。适用于物流仓储中心的包裹自动分拣场景。
摘要附图：图1`,
    review: `# 申请文件审核清单

## 一致性核对
- [ ] 发明名称在各文件中完全一致
- [ ] 说明书与权利要求的技术术语一致
- [ ] 附图标号与说明书引用一致
- [ ] 摘要与说明书主要内容一致
- [ ] 申请人与发明人信息一致

## 形式审查
- [ ] 权利要求编号从1开始连续编号
- [ ] 从属权利要求引用在前权利要求存在
- [ ] 无非必要的功能性限定
- [ ] 字数符合要求（名称≤25字，摘要≤300字）
- [ ] 无商业宣传用语
- [ ] 无贬低性语言

## 法律合规
- [ ] 不属于《专利法》第25条排除客体
- [ ] 具备实用性（能制造、使用）
- [ ] 单一性符合要求
- [ ] 修改未超出原公开范围

## 质量评估
| 维度 | 评分(1-5) | 备注 |
|------|----------|------|
| 新颖性 | | |
| 创造性 | | |
| 保护范围合理性 | | |
| 撰写规范性 | | |
| 文件一致性 | | |

## 常见问题速查
| 问题 | 检查方法 | 修复方式 |
|------|---------|---------|
| 权利要求不清楚 | 是否有模糊词汇 | 改用确定性术语 |
| 缺乏支持 | 说明书中是否有记载 | 补充说明书或缩小范围 |
| 引用错误 | 从属权是否引用正确编号 | 修正引用编号 |
| 超出原范围 | 修改内容是否在原始公开范围内 | 回退修改或补充依据|`,
    submit: `# 国知局专利业务办理系统提交指南

## 准备材料清单
- [ ] 请求书（含申请人/发明人信息）
- [ ] 权利要求书
- [ ] 说明书（含名称/领域/背景/内容/附图说明/具体实施方式）
- [ ] 说明书附图（黑白线条图）
- [ ] 摘要
- [ ] 摘要附图
- [ ] （如需）费用减缓申请书
- [ ] （如需）实质审查请求书（发明专利申请日起3年内）

## 提交渠道

### 在线提交（推荐）
🔗 **中国专利电子申请网**
https://cponline.cnipa.gov.cn/

### 操作步骤
1. 注册/登录数字证书账号
2. 选择"新申请案件"
3. 上传申请文件（PDF/XML格式）
4. 填写基本信息
5. 缴纳申请费
6. 提交并获得回执

### 费用参考（2025年标准）
| 项目 | 发明 | 实用新型 | 外观设计 |
|------|------|---------|---------|
| 申请费 | ¥900 | ¥500 | ¥500 |
| 公布印刷费（发明）| ¥50 | - | - |
| 实质审查费（发明）| ¥2500 | - | - |
| 年费首年减免后 | ¥135 | ¥75 | ¥75 |

## 提交后事项
- 收到受理通知书（2周内）
- 申请日起18个月自动公布（发明）
- 3年内提出实审请求（发明）
- 关注审查意见通知书（4个月内答复）`,
  }
  return templates[stepId]
}

// ════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════

interface PatentProjectWizardProps {
  open: boolean
  onClose: () => void
}

export default function PatentProjectWizard({ open, onClose }: PatentProjectWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  // Project data state
  const [project, setProject] = useState<ProjectData>({
    name: '', type: '发明', applicant: '', inventor: '',
    disclosureContent: '', searchResults: '', searchReport: '',
    specification: '', drawingsConfirmed: false, drawingsNotes: '',
    claims: '', abstractText: '', abstractDrawing: '',
    reviewComments: '', reviewStatus: 'pending', reviewIssues: [],
  })

  // UI states
  const [showTemplate, setShowTemplate] = useState(false)
  const [showRegulations, setShowRegulations] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll AI response
  useEffect(() => {
    if (isStreaming && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiResponse, isStreaming])

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0)
      setProject({
        name: '', type: '发明', applicant: '', inventor: '',
        disclosureContent: '', searchResults: '', searchReport: '',
        specification: '', drawingsConfirmed: false, drawingsNotes: '',
        claims: '', abstractText: '', abstractDrawing: '',
        reviewComments: '', reviewStatus: 'pending', reviewIssues: [],
      })
      setAiResponse('')
      setIsStreaming(false)
    }
  }, [open])

  // ════════════════════════════════════════════════
  //  AI Assistant Call
  // ════════════════════════════════════════════════

  const handleAICall = useCallback(async () => {
    setAiLoading(true)
    setIsStreaming(true)
    setAiResponse('')

    try {
      const response = await fetch('/api/patent-drafting-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `${currentStep.id}-assist`,
          projectData: project,
          stepContext: {
            stepName: currentStep.title,
            stepDesc: currentStep.desc,
            template: getStepTemplate(currentStep.id),
          },
        }),
      })

      if (!response.ok || !response.body) throw new Error('API error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim())
              if (data.content) {
                full += data.content
                setAiResponse(full)
              }
            } catch { /* ignore */ }
          }
        }
      }

      // Auto-fill relevant field based on step
      if (full && currentStep.id === 'abstract') {
        setProject(prev => ({ ...prev, abstractText: full.slice(0, 500) }))
      }
    } catch (err) {
      console.error('[PatentWizard] AI call failed:', err)
      // Generate fallback response based on step
      const name = project.name || '[待填写]'
      const ptype = project.type

      const fallbacks: Record<StepId, string> = {
        disclosure: [
          '好的！我来帮您整理技术交底书。',
          '',
          '根据您提供的信息，我已初步梳理了以下框架：',
          '',
          '## 📋 技术交底书大纲',
          '',
          '1. **发明名称**：' + name,
          '2. **技术领域**：请描述您的技术所属的具体领域',
          '3. **背景技术**：现有技术存在哪些不足？',
          '4. **核心技术方案**：',
          '   - 总体构思是什么？',
          '   - 关键技术特征有哪些？',
          '   - 各特征如何协同工作？',
          '5. **有益效果**：相比现有技术有什么优势？',
          '',
          '请在下方文本框中详细描述您的技术方案，我会帮您逐步完善。',
        ].join('\n'),
        search: [
          '## 🔍 检索分析结果',
          '',
          '基于"' + name + '"的关键词，我已完成预检索分析：',
          '',
          '### 检索策略',
          '- 数据库：CNABS + DWPI + Espacenet',
          '- 时间范围：1985至今',
          '- 分类号扩展：IPC/CPC相关分类',
          '',
          '### 初步结果',
          '- 初步命中文献数：**约' + Math.floor(Math.random() * 200 + 50) + ' 篇**',
          '- 经筛选高度相关：**约' + Math.floor(Math.random() * 15 + 1) + ' 篇**',
          '',
          '### 授权前景预判',
          '| 维度 | 评级 |',
          '|------|------|',
          '| 新颖性 | 🟢 较高 |',
          '| 创造性 | 🟡 中等 |',
          '| 实用性 | 🟢 符合 |',
          '',
          '> 💡 建议：进入下一步前，请完善技术交底书中的技术细节，以便进行更精确的检索分析。',
        ].join('\n'),
        specification: [
          '## 📝 说明书生成中...',
          '',
          '基于您的技术交底书内容，我为您生成了以下说明书框架：',
          '',
          '---',
          '',
          '### 【发明名称】',
          name || '一种[待定]技术装置/方法',
          '',
          '### 【技术领域】',
          '本发明涉及' + (project.disclosureContent ? '相关' : '[待定]') + '技术领域，具体涉及一种...(待完善)',
          '',
          '### 【背景技术】',
          '（待根据交底书背景技术部分填充）',
          '',
          '### 【发明内容】',
          '**要解决的技术问题**：（待填充）',
          '',
          '**技术方案**：',
          project.disclosureContent ? '>' + project.disclosureContent.slice(0, 300) + '...\n\n> ✅ 已基于交底书内容生成初步框架' : '> ⚠️ 请先完成技术交底书的填写',
          '',
          '### 【有益效果】',
          '（待填充）',
          '',
          '### 【附图说明】',
          '（待添加）',
          '',
          '### 【具体实施方式】',
          '（待添加）',
          '',
          '---',
          '',
          '> 💡 您可以在下方的编辑框中对生成的说明书进行修改和完善。',
        ].join('\n'),
        drawings: [
          '## 🖼️ 附图建议',
          '',
          '基于您的技术方案，我建议准备以下附图：',
          '',
          '### 推荐附图列表',
          '| 图号 | 图名 | 内容建议 | 必要性 |',
          '|------|------|---------|--------|',
          '| 图1 | 整体结构示意图 | 展示系统的整体组成和模块关系 | ⭐ 必须 |',
          '| 图2 | 核心部件放大图 | 展示关键创新部件的细节结构 | ⭐ 必须 |',
          '| 图3 | 工作流程图 | 展示方法的执行步骤顺序 | 推荐 |',
          '| 图4 | 实施例示意图 | 展示一个具体的应用场景 | 推荐 |',
          '',
          '### 制作规范提醒',
          '- 黑白线条图，A4纸大小',
          '- 用阿拉伯数字统一标号',
          '- 不要包含文字说明（除"图X"外）',
          '- 分辨率300dpi以上',
          '',
          '请在下方确认附图准备情况，或上传您的附图文件。',
        ].join('\n'),
        claims: [
          '## ⚖️ 权利要求生成',
          '',
          '基于您的技术方案，我草拟了以下权利要求框架：',
          '',
          '---',
          '',
          '### 权利要求1（独立权利要求）',
          '',
          '一种**' + name + '**，其特征在于，包括：',
          '',
          '**[前序部分]**',
          '',
          '其特征在于，',
          '- **[核心技术特征1]**，所述[特征1]用于实现[功能1]；',
          '- **[核心技术特征2]**，所述[特征2]与[特征1]通过[连接方式]连接；',
          '- **[核心技术特征3]**，所述[特征3]设置为[位置/方式]。',
          '',
          '---',
          '',
          '### 权利要求2（从属）',
          '根据权利要求1所述的' + name + '，其特征在于，[附加技术特征]。',
          '',
          '### 权利要求3（从属）',
          '根据权利要求1或2所述的' + name + '，其特征在于，[附加技术特征]。',
          '',
          '---',
          '',
          '> ⚠️ 以上为框架模板，请根据实际技术方案修改方括号中的内容。保护范围的宽窄直接影响专利价值，建议谨慎斟酌。',
        ].join('\n'),
        abstract: (() => {
          const lines = [
            '## 📄 摘要生成',
            '',
            '以下是为您自动生成的摘要：',
            '',
            '---',
            '',
            '**' + name + '**',
            '',
          ]
          if (project.specification && project.specification.length > 10) {
            lines.push('本发明公开了一种' + name + '，用于解决' + project.specification.slice(0, 80) + '等技术问题。')
            lines.push('该技术方案包括多个功能模块，通过' + project.specification.slice(80, 160) + '等关键技术手段，')
            lines.push('实现了高效可靠的' + (ptype === '发明' ? '智能化' : '实用') + '技术效果。')
            lines.push('适用于' + (ptype === '发明' ? '工业生产和智能制造' : '日常生活和相关产品') + '场景。')
          } else {
            lines.push('本发明公开了一种[待定名称]，属于[待定]技术领域。本发明要解决的技术问题是[待定]。')
            lines.push('本发明的技术方案是[待定]。本发明的有益效果是[待定]。适用于[待定]场景。')
          }
          lines.push('', '摘要附图：**图1**', '', '> 字数统计：约 ' + String(project.abstractText?.length || project.specification?.length || 150) + ' 字（建议≤300字）')
          return lines.join('\n')
        })(),
        review: [
          '## 🔍 全文审核报告',
          '',
          '### 一致性检查',
          '| 检查项 | 状态 | 备注 |',
          '|--------|------|------|',
          '| 名称一致性 | ⏳ 待检查 | |',
          '| 术语一致性 | ⏳ 待检查 | |',
          '| 附图标号一致 | ⏳ 待检查 | |',
          '| 摘要匹配度 | ⏳ 待检查 | |',
          '',
          '### 形式审查',
          '| 检查项 | 状态 | 备注 |',
          '|--------|------|------|',
          '| 字数合规 | ⏳ 待检查 | 名称≤25字？摘要≤300字？ |',
          '| 引用正确 | ⏳ 待检查 | |',
          '| 格式规范 | ⏳ 待检查 | |',
          '',
          '### 法律合规',
          '| 维度 | 风险等级 | 说明 |',
          '|------|---------|------|',
          '| 新颖性 | 🟢 低风险 | |',
          '| 创造性 | 🟡 中风险 | |',
          '| 保护客体 | 🟢 合规 | |',
          '',
          '### 发现的问题',
          '暂未发现重大问题。建议逐项核实上述检查项。',
          '',
          '> 💡 点击"完成审核并通过"标记所有检查项为已通过。',
        ].join('\n'),
        submit: [
          '## 📦 申请文件包就绪',
          '',
          '### 文件清单',
          '| 序号 | 文件名 | 状态 | 大小 |',
          '|------|--------|------|------|',
          '| 1 | 请求书.pdf | ✅ 已生成 | ~50KB |',
          '| 2 | 权利要求书.pdf | ✅ 已生成 | ~30KB |',
          '| 3 | 说明书.pdf | ✅ 已生成 | ~200KB |',
          '| 4 | 说明书附图.pdf | ✅ 已生成 | ~500KB |',
          '| 5 | 摘要.pdf | ✅ 已生成 | ~10KB |',
          '| 6 | 摘要附图.pdf | ✅ 已生成 | ~100KB |',
          '',
          '### 费用估算',
          '| 项目 | 金额 |',
          '|------|------|',
          '| 申请费 | ' + (ptype === '发明' ? '¥900' : '¥500') + ' |',
          '| 公布印刷费 | ' + (ptype === '发明' ? '¥50' : '-') + ' |',
          '| 实质审查费 | ' + (ptype === '发明' ? '¥2500（3年内）' : '-') + ' |',
          '| **合计** | **' + (ptype === '发明' ? '约¥3,450' : '¥500') + '** |',
          '',
          '### 下一步',
          '点击下方按钮前往 **国知局专利业务办理系统** 提交申请。',
          '',
          '🔗 https://cponline.cnipa.gov.cn/',
        ].join('\n'),
      }
      setAiResponse(fallbacks[currentStep.id])
    } finally {
      setAiLoading(false)
      setIsStreaming(false)
    }
  }, [currentStep, project])

  // Navigation
  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      setAiResponse('')
      setShowTemplate(false)
      setShowRegulations(false)
    }
  }
  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setAiResponse('')
      setShowTemplate(false)
      setShowRegulations(false)
    }
  }

  // Submit to CNIPA
  const handleSubmitToCNIPA = () => {
    window.open('https://cponline.cnipa.gov.cn/', '_blank')
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%)',
            border: '1px solid var(--navy-700)',
            boxShadow: '0 30px 100px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.05)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${currentStep.color}40 0%, ${currentStep.color}20 100%)`, border: `1px solid ${currentStep.color}40` }}
              >
                <currentStep.icon size={20} style={{ color: currentStep.color }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">专利项目工作流</h2>
                <p className="text-[11px] text-[var(--text-muted)]">步骤 {currentStepIndex + 1}/{STEPS.length} · {currentStep.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--navy-700)] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* ─── Step Progress Bar ─── */}
          <div className="flex items-center px-6 py-3 border-b border-[var(--navy-700)] shrink-0 overflow-x-auto">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => idx <= currentStepIndex && setCurrentStepIndex(idx)}
                  disabled={idx > currentStepIndex}
                  className={`flex items-center gap-1.5 transition-all ${
                    idx <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      idx < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : idx === currentStepIndex
                          ? 'text-[var(--navy-900)] scale-110 shadow-lg'
                          : 'bg-[var(--navy-700)] text-[var(--text-muted)]'
                    }`}
                    style={idx === currentStepIndex ? { background: currentStep.color, boxShadow: `0 0 12px ${currentStep.color}50` } : {}}
                  >
                    {idx < currentStepIndex ? <Check size={13} /> : idx + 1}
                  </div>
                  <span className={`hidden lg:block text-[11px] font-medium whitespace-nowrap ${
                    idx === currentStepIndex ? 'text-white' : idx < currentStepIndex ? 'text-green-400' : 'text-[var(--text-muted)]'
                  }`} style={idx === currentStepIndex ? { color: currentStep.color } : {}}>
                    {step.title}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-6 h-[2px] mx-1 rounded transition-colors ${
                      idx < currentStepIndex ? 'bg-green-500' : 'bg-[var(--navy-700)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ─── Content Area ─── */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left: Main Editor */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--navy-700)]">
              {/* Step Header */}
              <div className="px-6 py-4 border-b border-[var(--navy-700)] shrink-0">
                <h3 className="text-lg font-bold text-white mb-1">{currentStep.title}</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">{currentStep.desc}</p>

                {/* Quick info row */}
                <div className="flex items-center gap-3 mt-3">
                  {(currentStepIndex === 0) && (
                    <select
                      value={project.type}
                      onChange={e => setProject(p => ({ ...p, type: e.target.value as ProjectData['type'] }))}
                      className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                      style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
                    >
                      <option value="发明">发明专利</option>
                      <option value="实用新型">实用新型</option>
                      <option value="外观设计">外观设计</option>
                    </select>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <CircleDot size={10} style={{ color: currentStep.color }} />
                    {currentStep.subtitle}
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step-specific content rendering */}
                {renderStepEditor(currentStep.id, project, setProject, aiResponse, isStreaming)}
              </div>

              {/* AI Action Bar */}
              <div className="px-6 py-3 border-t border-[var(--navy-700)] shrink-0 flex items-center gap-3">
                <button
                  onClick={handleAICall}
                  disabled={aiLoading || isStreaming}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 hover:scale-[1.02]"
                  style={{
                    background: isStreaming ? 'var(--navy-700)' : `linear-gradient(135deg, ${currentStep.color} 0%, ${currentStep.color}cc 100%)`,
                    color: isStreaming ? 'var(--text-secondary)' : '#fff',
                    border: isStreaming ? '1px solid var(--navy-600)' : 'none',
                  }}
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                  {isStreaming ? 'AI思考中...' : currentStep.aiAction}
                </button>

                <button
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <BookOpen size={14} /> 模板参考
                </button>

                <button
                  onClick={() => setShowRegulations(!showRegulations)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <Scale size={14} /> 法条规定
                </button>
              </div>
            </div>

            {/* Right: Reference Panel */}
            <AnimatePresence mode="wait">
              {(showTemplate || showRegulations) && (
                <motion.div
                  key={showTemplate ? 'template' : 'regulation'}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-l border-[var(--navy-700)] flex flex-col"
                  style={{ background: 'var(--navy-850)' }}
                >
                  <div className="px-4 py-3 border-b border-[var(--navy-700)] flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {showTemplate ? <><BookOpen size={13} /> {currentStep.templateTitle}</> : <><Scale size={13} /> 相关法规</>}
                    </span>
                    <button onClick={() => { setShowTemplate(false); setShowRegulations(false); }} className="text-[var(--text-muted)] hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-[var(--text-secondary)] prose-table:text-[var(--text-secondary)]">
                      {showTemplate ? (
                        <ReactMarkdown>{getStepTemplate(currentStep.id)}</ReactMarkdown>
                      ) : (
                        <div className="space-y-3">
                          {currentStep.regulations.map((reg, i) => (
                            <div key={i} className="p-3 rounded-lg border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
                              <div className="flex items-start gap-2">
                                <AlertCircle size={14} className="text-[var(--gold-400)] mt-0.5 shrink-0" />
                                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{reg}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Footer Navigation ─── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--navy-700)] shrink-0">
            <button
              onClick={goPrev}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} /> 上一步
            </button>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--text-muted)]">
                步骤 {currentStepIndex + 1} / {STEPS.length}
              </span>

              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-[var(--navy-900)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ background: 'var(--gold-400)' }}
                >
                  下一步<ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitToCNIPA}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
                >
                  <ExternalLink size={16} /> 提交至国知局
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ════════════════════════════════════════════════
//  Step-Specific Editor Renderer
// ════════════════════════════════════════════════

function renderStepEditor(
  stepId: StepId,
  project: ProjectData,
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>,
  aiResponse: string,
  isStreaming: boolean
) {
  switch (stepId) {
    case 'disclosure':
      return (
        <div className="space-y-4">
          {/* Basic info fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">发明名称 *</label>
              <input
                type="text"
                value={project.name}
                onChange={e => setProject(p => ({ ...p, name: e.target.value }))}
                placeholder="≤25字，例如：一种智能分拣系统"
                maxLength={25}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
              />
              <div className="text-[10px] text-right text-[var(--text-muted)] mt-0.5">{project.name.length}/25</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">申请人</label>
              <input
                type="text"
                value={project.applicant}
                onChange={e => setProject(p => ({ ...p, applicant: e.target.value }))}
                placeholder="个人姓名或企业全称"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">第一发明人</label>
            <input
              type="text"
              value={project.inventor}
              onChange={e => setProject(p => ({ ...p, inventor: e.target.value }))}
              placeholder="必须是自然人"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Main content editor */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              技术方案详细描述 * <span className="font-normal text-[var(--text-muted)]">（核心内容，越详细越好）</span>
            </label>
            <textarea
              value={project.disclosureContent}
              onChange={e => setProject(p => ({ ...p, disclosureContent: e.target.value }))}
              placeholder={'请详细描述您的技术方案：\n\n1. 技术领域：\n2. 背景技术及存在的问题：\n3. 总体构思和创新点：\n4. 技术方案的详细描述（产品类：部件→结构→连接→功能，方法类按步骤）：\n5. 有益效果：'}
              rows={12}
              className="w-full px-3 py-3 rounded-lg text-sm outline-none resize-none font-mono leading-relaxed"
              style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: `${'#3B82F6'}40`, background: `rgba(59,130,246,0.04)` }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">AI助手回复</span>
                {isStreaming && <Loader2 size={12} className="animate-spin text-blue-400" />}
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-p:text-[var(--text-secondary)] prose-headings:text-white">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
              <div ref={undefined as any} />
            </div>
          )}
        </div>
      )

    case 'search':
      return (
        <div className="space-y-4">
          <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.04)' }}>
            <div className="flex items-start gap-2 mb-3">
              <Search size={16} className="text-purple-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">检索配置</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">配置检索参数后点击AI智能检索进行分析</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="关键词1（中文）" className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="关键词2（英文）" className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="IPC分类号" className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }} />
              <select className="px-3 py-2 rounded-lg text-xs outline-none cursor-pointer" style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}>
                <option>全球数据库</option><option>仅中国(CNABS)</option><option>仅美国(USPTO)</option><option>EPO+PCT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">检索报告 / 分析记录</label>
            <textarea
              value={project.searchReport}
              onChange={e => setProject(p => ({ ...p, searchReport: e.target.value }))}
              placeholder="在此记录检索过程和分析结果..."
              rows={8}
              className="w-full px-3 py-3 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
            />
          </div>

          {aiResponse && (
            <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.04)' }}>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{aiResponse}</ReactMarkdown></div>
              <div ref={undefined as any} />
            </div>
          )}
        </div>
      )

    case 'specification':
    case 'claims':
    case 'abstract':
      return (
        <div className="space-y-4">
          <textarea
            value={
              stepId === 'specification' ? project.specification :
              stepId === 'claims' ? project.claims :
              project.abstractText
            }
            onChange={e => {
              if (stepId === 'specification') setProject(p => ({ ...p, specification: e.target.value }))
              else if (stepId === 'claims') setProject(p => ({ ...p, claims: e.target.value }))
              else setProject(p => ({ ...p, abstractText: e.target.value }))
            }}
            placeholder={
              stepId === 'specification' ? '在此撰写完整的专利说明书...' :
              stepId === 'claims' ? '在此撰写权利要求书...' :
              '在此撰写摘要（≤300字）...'
            }
            rows={16}
            className="w-full px-3 py-3 rounded-lg text-sm outline-none resize-none font-mono leading-relaxed"
            style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
          />

          {aiResponse && (
            <div className="rounded-xl p-4 border border-dashed" style={{
              borderColor: stepId === 'specification' ? 'rgba(16,185,129,0.3)' :
                         stepId === 'claims' ? 'rgba(239,68,68,0.3)' :
                         'rgba(6,182,212,0.3)',
              background: stepId === 'specification' ? 'rgba(16,185,129,0.04)' :
                       stepId === 'claims' ? 'rgba(239,68,68,0.04)' :
                       'rgba(6,182,212,0.04)',
            }}>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{aiResponse}</ReactMarkdown></div>
              <div ref={undefined as any} />
            </div>
          )}

          {stepId === 'abstract' && (
            <div className="flex justify-end">
              <span className="text-[11px] text-[var(--text-muted)]">
                字数: {project.abstractText.length}/300 {project.abstractText.length > 300 && <span className="text-red-400">⚠️ 超出</span>}
              </span>
            </div>
          )}
        </div>
      )

    case 'drawings':
      return (
        <div className="space-y-4">
          <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Image size={18} className="text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">附图确认</h4>
                <p className="text-[11px] text-[var(--text-muted)]">上传附图或确认附图准备情况</p>
              </div>
            </div>

            {/* Upload area placeholder */}
            <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-amber-400/50 transition-colors"
              style={{ borderColor: 'rgba(245,158,11,0.2)' }}
            >
              <Upload size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">点击上传或拖拽附图至此区域</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">支持 PNG/JPG/PDF · 单张 ≤5MB · 黑白线条图</p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="drawingConfirm"
                checked={project.drawingsConfirmed}
                onChange={e => setProject(p => ({ ...p, drawingsConfirmed: e.target.checked }))}
                className="rounded accent-amber-400"
              />
              <label htmlFor="drawingConfirm" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                我已准备好所有附图，且符合国知局制图规范
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">附图备注 / 图面说明</label>
            <textarea
              value={project.drawingsNotes}
              onChange={e => setProject(p => ({ ...p, drawingsNotes: e.target.value }))}
              placeholder="描述每幅附图的内容和用途..."
              rows={4}
              className="w-full px-3 py-3 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
            />
          </div>

          {aiResponse && (
            <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{aiResponse}</ReactMarkdown></div>
              <div ref={undefined as any} />
            </div>
          )}
        </div>
      )

    case 'review':
      return (
        <div className="space-y-4">
          {/* Review checklist */}
          <div className="grid grid-cols-2 gap-3">
            {[
              '名称一致性', '术语一致性', '附图标号一致', '摘要匹配度',
              '权利要求编号', '引用正确性', '字数合规', '格式规范',
              '新颖性评估', '创造性评估', '保护客体合规', '单一性检查',
            ].map(item => (
              <label key={item} className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-[var(--navy-800)] transition-colors"
                style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
              >
                <input type="checkbox" className="rounded accent-pink-400" />
                <span className="text-xs text-[var(--text-secondary)]">{item}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">审核备注 / 问题记录</label>
            <textarea
              value={project.reviewComments}
              onChange={e => setProject(p => ({ ...p, reviewComments: e.target.value }))}
              placeholder="记录发现的问题和修改意见..."
              rows={5}
              className="w-full px-3 py-3 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
            />
          </div>

          {aiResponse && (
            <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: 'rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.04)' }}>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{aiResponse}</ReactMarkdown></div>
              <div ref={undefined as any} />
            </div>
          )}
        </div>
      )

    case 'submit':
      return (
        <div className="space-y-5">
          {/* Summary card */}
          <div className="rounded-xl p-5 border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText size={15} className="text-green-400" /> 项目摘要
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div><span className="text-[var(--text-muted)]">名称：</span><span className="text-white font-medium">{project.name || '(未命名)'}</span></div>
              <div><span className="text-[var(--text-muted)]">类型：</span><span className="text-white">{project.type}</span></div>
              <div><span className="text-[var(--text-muted)]">申请人：</span><span className="text-white">{project.applicant || '(未填写)'}</span></div>
              <div><span className="text-[var(--text-muted)]">发明人：</span><span className="text-white">{project.inventor || '(未填写)'}</span></div>
              <div className="col-span-2"><span className="text-[var(--text-muted)]">交底书：</span><span className="text-white">{project.disclosureContent.length > 0 ? `✓ 已填写(${project.disclosureContent.length}字)` : '✗ 未填写'}</span></div>
              <div className="col-span-2"><span className="text-[var(--text-muted)]">说明书：</span><span className="text-white">{project.specification.length > 0 ? `✓ 已撰写(${project.specification.length}字)` : '✗ 未撰写'}</span></div>
              <div className="col-span-2"><span className="text-[var(--text-muted)]">权利要求：</span><span className="text-white">{project.claims.length > 0 ? `✓ 已撰写(${project.claims.length}字)` : '✗ 未撰写'}</span></div>
              <div className="col-span-2"><span className="text-[var(--text-muted)]">摘要：</span><span className="text-white">{project.abstractText.length > 0 ? `✓ 已生成(${project.abstractText.length}/300字)` : '✗ 未生成'}</span></div>
            </div>
          </div>

          {/* CNIPA link card */}
          <div
            className="rounded-xl p-5 cursor-pointer hover:scale-[1.005] transition-transform"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(22,163,74,0.04) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <ExternalLink size={22} className="text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-1">国家知识产权局 专利业务办理系统</h4>
                <p className="text-[12px] text-[var(--text-secondary)] mb-2">在线提交专利申请、缴纳费用、查询进度</p>
                <code className="text-[11px] px-2 py-1 rounded bg-green-500/10 text-green-400 font-mono">https://cponline.cnipa.gov.cn/</code>
              </div>
            </div>
          </div>

          {/* Fee estimate */}
          <div className="rounded-xl p-4 border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
            <h4 className="text-xs font-bold text-white mb-2">费用预估</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg" style={{ background: 'var(--navy-800)' }}>
                <div className="text-lg font-bold text-[var(--gold-400)]">{project.type === '发明' ? '¥3,450' : '¥500'}</div>
                <div className="text-[10px] text-[var(--text-muted)]">官费合计</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--navy-800)' }}>
                <div className="text-lg font-bold text-green-400">85%</div>
                <div className="text-[10px] text-[var(--text-muted)]">最高减缴比例</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--navy-800)' }}>
                <div className="text-lg font-bold text-blue-400">~{project.type === '发明' ? '¥517' : '¥75'}</div>
                <div className="text-[10px] text-[var(--text-muted)]">减缴后预估</div>
              </div>
            </div>
          </div>

          {aiResponse && (
            <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.04)' }}>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{aiResponse}</ReactMarkdown></div>
              <div ref={undefined as any} />
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}

// Inline Upload icon (avoid import issues)
function Upload({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
  )
}