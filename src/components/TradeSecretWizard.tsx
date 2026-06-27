import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Wand2,
  Search, FileText, Image, Scale, FileCheck, ClipboardList,
  Send, ExternalLink, BookOpen, Lightbulb, AlertCircle,
  Loader2, X, Plus, CircleDot, ArrowRight, Download,
  Copy, Bot, Eye, EyeOff, Shield, Tag, Key, Lock, AlertTriangle,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ════════════════════════════════════════════════
//  Types
// ════════════════════════════════════════════════

interface TradeSecretData {
  name: string
  type: '技术信息' | '经营信息' | '混合型'
  department: string
  // Step 1
  informationIdentify: string
  informationList: string[]
  // Step 2
  secretAssessment: string
  threeElements: {
    secrecy: boolean
    value: boolean
    protection: boolean
  }
  assessmentReport: string
  // Step 3
  classification: '绝密' | '机密' | '秘密' | '内部公开'
  classificationBasis: string
  // Step 4
  protectionMeasures: string[]
  measuresPlan: string
  // Step 5
  managementRules: string
  managementDoc: string
  // Step 6
  evaluationReport: string
  evaluationSchedule: string
}

// ════════════════════════════════════════════════
//  Step Definitions (6 steps)
// ════════════════════════════════════════════════

const STEPS = [
  {
    id: 'identify',
    title: '信息识别',
    subtitle: '识别企业商业秘密信息',
    icon: Search,
    color: '#F59E0B',
    desc: '全面梳理企业可能构成商业秘密的信息资产',
    aiAction: 'AI商业秘密识别',
    templateTitle: '商业秘密识别清单',
    regulations: ['《反不正当竞争法》第9条（2025修订）：商业秘密定义', '《商业秘密保护规定》（总局令第126号，2026年1月1日施行）'],
  },
  {
    id: 'assessment',
    title: '三要件认定',
    subtitle: '评估是否符合商业秘密构成要件',
    icon: Key,
    color: '#EF4444',
    desc: '依据秘密性、价值性、保密措施三要件进行评估',
    aiAction: 'AI三要件评估',
    templateTitle: '商业秘密三要件认定标准',
    regulations: ['《反不正当竞争法》第9条第3款：三要件定义', '法释〔2020〕7号：商业秘密民事案件审理规定'],
  },
  {
    id: 'classification',
    title: '密级划分',
    subtitle: '根据重要程度划分密级',
    icon: Shield,
    color: '#8B5CF6',
    desc: '依据信息重要程度和泄露后果划分保密级别',
    aiAction: 'AI密级划分建议',
    templateTitle: '密级划分标准指南',
    regulations: ['《商业秘密保护规定》第15-20条：密级管理', 'GB/T 27935《商业秘密管理指南》'],
  },
  {
    id: 'measures',
    title: '保护措施',
    subtitle: '制定商业秘密保护措施',
    icon: Lock,
    color: '#22C55E',
    desc: '制定物理、技术、管理等多维度保护措施',
    aiAction: 'AI保护方案生成',
    templateTitle: '商业秘密保护措施清单',
    regulations: ['《反不正当竞争法》第9条第1款：保密义务', '《劳动合同法》第23-24条：竞业限制'],
  },
  {
    id: 'management',
    title: '管理规范',
    subtitle: '建立商业秘密管理制度',
    icon: FileText,
    color: '#3B82F6',
    desc: '建立完善的商业秘密管理规范体系',
    aiAction: 'AI管理制度生成',
    templateTitle: '商业秘密管理制度框架',
    regulations: ['《商业秘密保护规定》全文', '《企业商业秘密管理规范》（SB/T 10845)'],
  },
  {
    id: 'evaluation',
    title: '定期评估',
    subtitle: '建立定期评估与更新机制',
    icon: AlertTriangle,
    color: '#06B6D4',
    desc: '定期评估商业秘密保护效果，及时调整保护策略',
    aiAction: 'AI评估报告生成',
    templateTitle: '商业秘密保护评估指标',
    regulations: ['《商业秘密保护规定》第21条：定期评估', '《企业知识产权管理规范》（GB/T 29490)'],
  },
] as const

type StepId = typeof STEPS[number]['id']

// ════════════════════════════════════════════════
//  Template Data for Each Step
// ════════════════════════════════════════════════

function getStepTemplate(stepId: StepId): string {
  const templates: Record<StepId, string> = {
    identify: `# 商业秘密识别清单

## 一、技术信息类

### 1.1 研发技术

| 信息类型 | 示例 | 是否必然保密 | 建议处理 |
|---------|------|------------|---------|
| 源代码 | 软件程序代码 | 是 | 技术复制+保密措施=商业秘密 |
| 算法 | 核心处理逻辑 | 部分 | 取决于可分离性 |
| 工艺配方 | 化学配方、食品配方 | 是 | 典型商业秘密 |
| 生产工艺 | 制造流程参数 | 是 | 技术诀窍 |
| 设计图纸 | CAD图纸、设计方案 | 部分 | 技术复制+保密=秘密 |

### 1.2 技术成果
- 研究开发记录
- 实验数据
- 测试报告
- 改进方案

## 二、经营信息类

### 2.1 客户信息

| 信息类型 | 示例 | 保密要求 | 注意事项 |
|---------|------|---------|---------|
| 客户名单 | 完整客户信息 | 是 | 必须有保密措施 |
| 联系方式 | 电话、邮箱 | 是 | 结合名单整体判断 |
| 交易习惯 | 采购规律 | 是 | 体现经营特色 |
| 需求偏好 | 定制化需求 | 是 | 深度信息 |
| 报价策略 | 定价规律 | 是 | 核心经营信息 |

### 2.2 经营策划
- 营销方案
- 定价策略
- 供应商名单
- 成本结构
- 投资计划
- 战略规划

## 三、AI识别辅助

### 3.1 识别维度
1. **来源分析**：是否为自行研发/收集
2. **可分离性**：能否从公开渠道获取
3. **价值评估**：泄露会造成何种损失
4. **行业惯例**：竞争对手是否掌握类似信息

### 3.2 识别流程

\`\`\`
1. 信息收集 → 各部门调查
2. 初筛评估 → 快速判断是否可能
3. 深度分析 → 三要件逐项评估
4. 定密建议 → 确定密级
5. 登记备案 → 纳入管理体系
\`\`\`

## 四、AI商业秘密识别

点击"AI商业秘密识别"，系统将帮助您：
1. 梳理企业信息资产
2. 评估保密必要性
3. 识别潜在商业秘密
4. 生成分级建议`,
    assessment: `# 商业秘密三要件认定标准

## 一、法律依据

### 1.1 《反不正当竞争法》第9条第3款

> 本法所称的商业秘密，是指不为公众所知悉、具有商业价值并经权利人采取相应保密措施的技术信息、经营信息等商业信息。

### 1.2 三要件对照

| 要件 | 法律定义 | 举证要求 | 认定难点 |
|------|---------|---------|---------|
| **秘密性** | 不为公众所知悉 | 证明已采取保密措施 | 公众范围界定 |
| **价值性** | 具有商业价值 | 证明经济利益或竞争优势 | 价值量化 |
| **保密措施** | 采取相应保密措施 | 证明采取了合理措施 | "相应"的边界 |

## 二、秘密性认定

### 2.1 积极要件（秘密性）
- ✔ 不为公众所知悉
- ✔ 不为普遍知悉
- ✔ 非所属领域人员普遍知悉

### 2.2 消极要件（不丧失秘密性）
- ✔ 仅为所属领域相关人员知悉
- ✔ 整体或部分要素的组合被普遍知悉，但组合未普遍知悉
- ✔ 仅涉及产品尺寸、结构、材料等，但组合后实现特定效果

### 2.3 秘密性丧失情形
- ✔ 已普遍知悉
- ✔ 所属领域人员普遍知悉
- ✔ 无需付出一定代价即可知悉

## 三、价值性认定

### 3.1 价值类型
- 经济利益
- 竞争优势
- 战略价值

### 3.2 价值证明

| 证据类型 | 证明内容 | 证据效力 |
|---------|---------|---------|
| 投入成本 | 研发费用、保密费用 | 有 |
| 预期收益 | 商业计划、合同预期 | 有 |
| 竞争优势 | 市场份额、客户反馈 | 有 |
| 许可收益 | 技术许可合同 | 有 |
| 侵权赔偿 | 法院认定价值 | 最强 |

## 四、保密措施认定

### 4.1 合理保密措施类型

| 措施类型 | 具体措施 | 证明材料 |
|---------|---------|---------|
| 制度类 | 保密制度、保密协议 | 制度文件 |
| 物理类 | 门禁、监控、隔离 | 管理记录 |
| 技术类 | 加密、权限控制 | 系统日志 |
| 合同类 | 竞业限制、保密条款 | 合同文本 |
| 告知类 | 标识、告知函 | 告知记录 |

### 4.2 保密措施合理性判断
- 与信息的商业价值相适应
- 明确告知相关人员保密义务
- 可识别、可执行

### 4.3 不构成保密措施的情形
- ✔ 仅在合同中约定保密义务
- ✔ 仅口头告知
- ✔ 未明确保密范围
- ✔ 措施无法实际执行

## 五、AI三要件评估

点击"AI三要件评估"，系统将：
1. 对照法律标准逐项评估
2. 识别潜在风险点
3. 提供完善建议
4. 生成评估报告`,
    classification: `# 密级划分标准指南

## 一、密级体系

### 1.1 四级分类体系

| 密级 | 名称 | 定义 | 泄露后果 | 保护强度 |
|------|------|------|---------|---------|
| **A级** | 绝密 | 企业核心秘密，泄露会造成灾难性后果 | 不可逆重大损失 | 最高 |
| **B级** | 机密 | 企业重要秘密，泄露会造成严重损害 | 重大损失 | 高 |
| **C级** | 秘密 | 企业内部秘密，泄露会造成一定损失 | 一定损失 | 中 |
| **D级** | 内部公开 | 仅限内部使用，不可对外公开 | 管理混乱 | 低 |

### 1.2 分类参考标准

#### 绝密（A级）标准
- 核心技术配方、工艺
- 核心算法源代码
- 重大战略规划
- 并购重组计划
- 核心客户完整名单

#### 机密（B级）标准
- 重要技术信息
- 重要客户信息
- 定价策略
- 供应商核心信息
- 研发项目详情

#### 秘密（C级）标准
- 一般技术文档
- 一般经营信息
- 内部管理流程
- 人事信息
- 培训资料

## 二、分类流程

### 2.1 初评

\`\`\`
1. 信息识别 → 纳入管理范围
2. 价值评估 → 确定重要程度
3. 泄露后果 → 预判影响
4. 初步定级 → 建议密级
\`\`\`

### 2.2 审核
- 部门负责人审查
- 法务/合规审核
- 高管审批（AB级）

### 2.3 发布
- 正式定密
- 告知相关人员
- 登记备案

## 三、动态调整

### 3.1 升密条件
- 信息价值提升
- 泄露风险增加
- 战略重要性提高

### 3.2 降密/解密条件
- 信息已公开
- 价值已丧失
- 保护期限届满
- 业务调整

## 四、定密权限

| 密级 | 审批权限 |
|------|---------|
| A级（绝密） | 总裁/CEO审批 |
| B级（机密） | 分管副总裁审批 |
| C级（秘密） | 部门负责人审查 |
| D级（内部） | 部门负责人授权 |

## 五、AI密级划分建议

点击"AI密级划分建议"，系统将：
1. 分析信息特征
2. 评估泄露风险
3. 推荐最佳密级
4. 提供保护措施建议`,
    measures: `# 商业秘密保护措施清单

## 一、人员管理措施

### 1.1 入职管理

| 措施 | 内容 | 适用范围 | 执行要点 |
|------|------|---------|---------|
| 背景调查 | 核实工作经历、竞业限制 | 核心岗位 | 入职前完成 |
| 保密告知 | 告知保密义务和范围 | 全体员工 | 入职时 |
| 保密承诺 | 签署保密承诺书 | 全体员工 | 入职时 |
| 竞业限制 | 约定竞业限制条款 | 高级管理人员/技术人员 | 离职时生效 |

### 1.2 任职管理

| 措施 | 内容 | 适用范围 | 执行要点 |
|------|------|---------|---------|
| 保密培训 | 定期保密意识培训 | 全体员工 | 每年至少1次 |
| 权限控制 | 最小权限原则 | 全体员工 | IT系统 |
| 监控审计 | 访问日志审计 | 敏感岗位 | 定期 |
| 定期谈话 | 保密意识强化 | 核心岗位 | 季度 |

### 1.3 离职管理

| 措施 | 内容 | 适用范围 | 执行要点 |
|------|------|---------|---------|
| 离职面谈 | 强调保密义务 | 全体离职员工 | 离职当日 |
| 物品交接 | 归还保密资料、设备 | 全体离职员工 | 离职当日 |
| 权限回收 | 回收系统账号、门禁 | 全体离职员工 | 离职当日 |
| 竞业启动 | 通知是否启动竞业 | 竞业限制人员 | 离职当日 |

## 二、物理保护措施

### 2.1 区域管理

| 区域 | 措施 | 标识 | 访问控制 |
|------|------|------|---------|
| 核心区 | 绝密信息处理区 | 红色标识 | 审批+门禁+监控 |
| 机密区 | 机密信息处理区 | 橙色标识 | 门禁+监控 |
| 办公区 | 一般办公区域 | 绿色标识 | 门禁 |
| 公共区 | 接待、展示区域 | 蓝色标识 | 正常开放 |

### 2.2 载体管理
- 纸质文件：编号、密级标识、专柜保管
- 电子文件：加密、权限控制、水印
- 样品/模型：专柜、监控、登记

## 三、技术保护措施

### 3.1 IT系统保护

| 措施 | 功能 | 优先级 |
|------|------|-------|
| 访问控制 | 身份认证、权限管理 | 高 |
| 数据加密 | 存储加密、传输加密 | 高 |
| DLP系统 | 数据防泄漏 | 高 |
| 水印追踪 | 文档追溯 | 中 |
| 打印审批 | 重要文件打印审批 | 中 |

### 3.2 网络安全
- 防火墙隔离
- 入侵检测
- 安全审计
- 移动设备管理（MDM）

## 四、合同保护措施

### 4.1 员工合同

\`\`\`
必备条款：
- 保密义务条款
- 保密范围定义
- 违约责任约定
- 竞业限制条款（如适用）

可选条款：
- 发明归属条款
- 脱密期条款
- 竞业补偿条款
\`\`\`

### 4.2 合作合同
- 保密协议（NDA）
- 技术秘密条款
- 知识产权归属
- 成果使用限制

## 五、AI保护方案生成

点击"AI保护方案生成"，系统将：
1. 分析信息特征和风险
2. 推荐针对性保护措施
3. 生成措施清单
4. 提供实施优先级建议`,
    management: `# 商业秘密管理制度框架

## 一、制度体系

### 1.1 层级架构

\`\`\`
第一层：商业秘密管理总纲
    ↓
第二层：分类管理制度
    ├── 技术秘密管理制度
    ├── 经营秘密管理制度
    └── 客户信息管理制度
    ↓
第三层：操作规程
    ├── 定密操作规程
    ├── 解密操作规程
    ├── 保密培训规程
    └── 离职交接规程
    ↓
第四层：配套表单
    ├── 定密申请表
    ├── 保密协议模板
    ├── 交接清单
    └── 培训记录表
\`\`\`

### 1.2 制度要素

| 要素 | 内容 | 重要性 |
|------|------|-------|
| 目的范围 | 制度目的、适用范围 | 高 |
| 定义解释 | 关键术语定义 | 高 |
| 组织架构 | 归口部门、职责分工 | 高 |
| 管理流程 | 定密、解密流程 | 高 |
| 奖惩机制 | 激励与处罚 | 中 |
| 附则 | 解释权、生效日期 | 中 |

## 二、核心制度内容

### 2.1 定密制度

\`\`\`
一、定密权限
- A级（绝密）：总裁/CEO审批
- B级（机密）：分管副总裁审批
- C级（秘密）：部门负责人审查
- D级（内部）：部门负责人授权

二、定密流程
1. 产生部门提出申请
2. 保密工作机构审核
3. 相应权限领导审批
4. 登记备案、告知相关人
\`\`\`

### 2.2 保密责任制度

\`\`\`
一、领导责任
- 主要负责人：全面责任
- 分管领导：分管责任
- 部门负责人：直接责任

二、岗位职责
- 保密工作机构：管理责任
- 业务部门：落实责任
- 全体员工：直接责任
\`\`\`

### 2.3 保密培训制度

\`\`\`
一、培训内容
- 保密法律法规
- 企业保密制度
- 保密意识教育
- 案例警示教育

二、培训周期
- 入职培训：入职时
- 年度培训：每年至少一次
- 专项培训：岗位调整时
\`\`\`

### 2.4 检查与奖惩

\`\`\`
一、检查机制
- 定期检查：每季度一次
- 专项检查：重大节假日前
- 随机抽查：不定期

二、奖励机制
- 保密先进个人：年度评选
- 保密合理化建议：采纳奖励

三、惩处机制
- 一般违规：批评教育
- 严重违规：行政处分
- 违法泄露：法律追究
\`\`\`

## 三、AI管理制度生成

点击"AI管理制度生成"，系统将根据您的企业情况：
1. 生成完整的制度框架
2. 提供各子制度模板
3. 生成配套表单模板
4. 标注关键控制点`,
    evaluation: `# 商业秘密保护评估指标

## 一、评估维度

### 1.1 四大评估维度

| 维度 | 权重 | 评估要点 |
|------|------|---------|
| 制度建设 | 20% | 制度完善性、可执行性 |
| 措施落实 | 30% | 措施执行情况、有效性 |
| 人员管理 | 25% | 人员意识、行为规范 |
| 风险控制 | 25% | 风险识别、应急处理 |

### 1.2 评估周期

| 评估类型 | 周期 | 范围 | 负责部门 |
|---------|------|------|---------|
| 日常监测 | 持续 | 关键指标 | IT/安全部门 |
| 季度检查 | 每季度 | 制度执行 | 保密工作机构 |
| 年度评估 | 每年 | 全面评估 | 管理层 |
| 专项评估 | 事件触发 | 特定事项 | 相关部门 |

## 二、评估指标体系

### 2.1 制度建设指标（20分）

| 指标 | 分值 | 评估标准 |
|------|------|---------|
| 制度完整性 | 5 | 是否有完整制度体系 |
| 职责明确性 | 5 | 职责分工是否清晰 |
| 流程规范性 | 5 | 流程是否规范可行 |
| 更新及时性 | 5 | 是否及时修订完善 |

### 2.2 措施落实指标（30分）

| 指标 | 分值 | 评估标准 |
|------|------|---------|
| 物理保护 | 10 | 物理保护措施落实情况 |
| 技术防护 | 10 | 技术防护措施有效性 |
| 合同保护 | 5 | 保密协议签署情况 |
| 标识管理 | 5 | 密级标识规范性 |

### 2.3 人员管理指标（25分）

| 指标 | 分值 | 评估标准 |
|------|------|---------|
| 入职管理 | 5 | 入职保密管理落实 |
| 培训教育 | 10 | 培训覆盖率和效果 |
| 离职管理 | 5 | 离职交接规范性 |
| 意识水平 | 5 | 员工保密意识 |

### 2.4 风险控制指标（25分）

| 指标 | 分值 | 评估标准 |
|------|------|---------|
| 风险识别 | 5 | 是否定期识别风险 |
| 隐患排查 | 10 | 隐患发现和整改 |
| 应急机制 | 5 | 应急预案和演练 |
| 事件处置 | 5 | 事件处理规范性 |

## 三、评估结果处理

### 3.1 评分等级

| 等级 | 分数 | 状态 | 处理措施 |
|------|------|------|---------|
| 优秀 | 90-100 | 好 | 继续保持 |
| 良好 | 75-89 | 较好 | 针对性改进 |
| 一般 | 60-74 | 一般 | 重点改进 |
| 较差 | <60 | 差 | 全面整改 |

### 3.2 改进机制
1. **问题清单**：列出发现的问题
2. **整改计划**：制定整改措施
3. **责任落实**：明确整改责任
4. **跟踪验证**：验证整改效果

## 四、AI评估报告生成

点击"AI评估报告生成"，系统将：
1. 对照指标体系评估
2. 分析各维度得分
3. 识别风险点和不足
4. 生成改进建议报告`,
  }
  return templates[stepId]
}

// ════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════

interface TradeSecretWizardProps {
  open: boolean
  onClose: () => void
}

export default function TradeSecretWizard({ open, onClose }: TradeSecretWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  const [project, setProject] = useState<TradeSecretData>({
    name: '', type: '技术信息', department: '',
    informationIdentify: '', informationList: [],
    secretAssessment: '', threeElements: { secrecy: false, value: false, protection: false },
    assessmentReport: '',
    classification: '秘密', classificationBasis: '',
    protectionMeasures: [], measuresPlan: '',
    managementRules: '', managementDoc: '',
    evaluationReport: '', evaluationSchedule: '',
  })

  const [showTemplate, setShowTemplate] = useState(false)
  const [showRegulations, setShowRegulations] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiResponse, isStreaming])

  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0)
      setProject({
        name: '', type: '技术信息', department: '',
        informationIdentify: '', informationList: [],
        secretAssessment: '', threeElements: { secrecy: false, value: false, protection: false },
        assessmentReport: '',
        classification: '秘密', classificationBasis: '',
        protectionMeasures: [], measuresPlan: '',
        managementRules: '', managementDoc: '',
        evaluationReport: '', evaluationSchedule: '',
      })
      setAiResponse('')
      setIsStreaming(false)
    }
  }, [open])

  const handleAICall = useCallback(async () => {
    setAiLoading(true)
    setIsStreaming(true)
    setAiResponse('')

    try {
      const response = await fetch('/api/trade-secret-agent', {
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
    } catch (err) {
      console.error('[TradeSecretWizard] AI call failed:', err)
      const fallbacks: Record<StepId, string> = {
        identify: '我来帮您识别企业商业秘密信息。从技术信息和经营信息两个维度，全面梳理可能构成商业秘密的信息资产，评估保密必要性，生成保密建议清单。',
        assessment: '商业秘密的三要件认定是确权的核心。我来帮您依据《反不正当竞争法》对秘密性、价值性、保密措施进行逐项评估，识别潜在风险，提供完善建议。',
        classification: '密级划分是保护的基础。我来帮您根据信息的重要程度和泄露后果，推荐最佳密级划分方案，并提供相应的保护措施建议。',
        measures: '完善的保护措施是商业秘密安全的保障。我来帮您制定物理、技术、管理等多维度保护措施，生成针对性的保护方案和实施清单。',
        management: '健全的管理制度是商业秘密保护的基石。我来帮您建立完善的商业秘密管理规范体系，包括定密制度、保密责任、培训制度、检查奖惩等。',
        evaluation: '定期评估是持续保护的关键。我来帮您建立商业秘密保护评估机制，对照指标体系进行评估，生成改进建议报告。',
      }
      setAiResponse(fallbacks[currentStep.id] || '请稍候，AI正在分析...')
    } finally {
      setAiLoading(false)
      setIsStreaming(false)
    }
  }, [currentStep, project])

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      setAiResponse('')
    }
  }

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setAiResponse('')
    }
  }

  const StepIcon = currentStep.icon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-[var(--navy-700)] overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${currentStep.color}20` }}
                >
                  <StepIcon size={20} style={{ color: currentStep.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">商业秘密保护工作台</h2>
                  <p className="text-xs text-[var(--text-secondary)]">{currentStep.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-3 border-b border-[var(--navy-700)]">
              <div className="flex items-center gap-2">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={step.id} className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => { setCurrentStepIndex(i); setAiResponse('') }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                          i === currentStepIndex
                            ? 'ring-2'
                            : i < currentStepIndex
                            ? 'cursor-pointer hover:scale-105'
                            : 'opacity-50'
                        }`}
                        style={{
                          background: i <= currentStepIndex ? `${step.color}20` : 'transparent',
                          color: i <= currentStepIndex ? step.color : 'var(--text-muted)',
                        }}
                      >
                        {i < currentStepIndex ? (
                          <Check size={12} />
                        ) : (
                          <Icon size={12} />
                        )}
                        <span className="hidden md:inline">{step.title}</span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <div
                          className="h-px flex-1 mx-1"
                          style={{ background: i < currentStepIndex ? step.color : 'var(--navy-700)' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Main Content Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Step Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {currentStepIndex + 1}. {currentStep.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{currentStep.desc}</p>
                </div>

                {/* Step Content */}
                <div className="bg-[var(--navy-800)] rounded-xl p-5 mb-4 border border-[var(--navy-700)]">
                  <h4 className="text-sm font-semibold text-white mb-3">当前步骤信息</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">步骤编号</span>
                      <span className="text-white font-medium">{currentStep.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">步骤颜色</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: currentStep.color }} />
                        <span className="text-white">{currentStep.color}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">AI辅助功能</span>
                      <span className="text-white font-medium">{currentStep.aiAction}</span>
                    </div>
                  </div>
                </div>

                {/* AI Response Area */}
                {(aiResponse || aiLoading) && (
                  <div className="bg-[var(--navy-800)] rounded-xl p-5 border border-[var(--navy-700)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot size={16} className="text-[#F59E0B]" />
                      <h4 className="text-sm font-semibold text-white">AI 助手</h4>
                      {aiLoading && <Loader2 size={14} className="animate-spin text-[#F59E0B]" />}
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{aiResponse || '正在分析...'}</ReactMarkdown>
                    </div>
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-72 border-l border-[var(--navy-700)] p-4 overflow-y-auto">
                <div className="space-y-3">
                  {/* AI Assistant Button */}
                  <button
                    onClick={handleAICall}
                    disabled={aiLoading}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white' }}
                  >
                    {aiLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {currentStep.aiAction}
                  </button>

                  {/* Template Reference */}
                  <button
                    onClick={() => setShowTemplate(!showTemplate)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--navy-600)', color: 'var(--text-secondary)' }}
                  >
                    <BookOpen size={16} />
                    模板参考
                  </button>

                  {/* Regulations */}
                  <button
                    onClick={() => setShowRegulations(!showRegulations)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--navy-600)', color: 'var(--text-secondary)' }}
                  >
                    <Scale size={16} />
                    法条规定
                  </button>

                  {/* Template Panel */}
                  {showTemplate && (
                    <div className="mt-4 p-4 rounded-xl bg-[var(--navy-800)] border border-[var(--navy-700)]">
                      <h5 className="text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
                        {currentStep.templateTitle}
                      </h5>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{getStepTemplate(currentStep.id)}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Regulations Panel */}
                  {showRegulations && (
                    <div className="mt-4 p-4 rounded-xl bg-[var(--navy-800)] border border-[var(--navy-700)]">
                      <h5 className="text-xs font-bold text-white mb-3 uppercase tracking-wide">
                        相关法律条款
                      </h5>
                      <ul className="space-y-2">
                        {currentStep.regulations.map((reg, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[#F59E0B] mt-0.5">§</span>
                            {reg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--navy-700)]">
              <button
                onClick={goPrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={16} />
                上一页
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">
                  步骤 {currentStepIndex + 1} / {STEPS.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentStepIndex === STEPS.length - 1 ? (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: currentStep.color, color: 'white' }}
                  >
                    <Check size={16} />
                    完成
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: currentStep.color, color: 'white' }}
                  >
                    下一页
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}