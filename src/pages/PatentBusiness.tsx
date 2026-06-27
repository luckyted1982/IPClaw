import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Search, Reply, LayoutGrid, CalendarClock, Shield, PlusCircle, ChevronRight, ShieldAlert, Compass, Calculator, Copy, FileDown, X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'
import PatentProjectWizard from '@/components/PatentProjectWizard'

const accentColor = '#3B82F6'

const stats = [
  { icon: PenTool, label: '本月撰写量', value: '1,247', trend: '+12%', color: '#3B82F6' },
  { icon: Shield, label: '授权成功率', value: '87.3%', trend: '+3.1%', color: '#22C55E' },
  { icon: CalendarClock, label: '平均处理周期', value: '2.4天', trend: '-40%', color: '#FACC15' },
]

const services = [
  {
    icon: PenTool,
    title: '专利撰写',
    description: 'AI辅助专利文档撰写,根据技术交底书自动生成权利要求书、说明书及附图说明,效率提升87%',
    metrics: { primary: '本月 1,247 件', secondary: '平均 2.1天完成' },
    tags: ['AI生成', '国知局格式', '多语言'],
    cta: '开始撰写',
  },
  {
    icon: Search,
    title: '专利检索',
    description: '深度语义检索全球专利数据库,智能分析新颖性与创造性,生成专业检索报告',
    metrics: { primary: '覆盖 1.8亿 专利', secondary: '支持 12 种语言' },
    tags: ['语义检索', '相似度分析', '全球数据库'],
    cta: '开始检索',
  },
  {
    icon: Reply,
    title: '审查意见答复',
    description: '智能分析审查意见通知书,自动生成答复策略、修改建议及论证模板',
    metrics: { primary: '成功率 92.4%', secondary: '平均答复周期 3天' },
    tags: ['智能分析', '策略生成', '模板库'],
    cta: '开始答复',
  },
  {
    icon: LayoutGrid,
    title: '专利布局分析',
    description: '基于技术领域与竞争对手分析,制定最优专利申请布局策略,构建专利护城河',
    metrics: { primary: '服务 340+ 企业', secondary: '覆盖 28 个技术领域' },
    tags: ['竞争分析', '布局策略', '专利地图'],
    cta: '开始分析',
  },
  {
    icon: Shield,
    title: '专利维权',
    description: '侵权监测、证据固定、维权策略制定与诉讼支持,全流程专利保护方案',
    metrics: { primary: '成功维权 156 件', secondary: '挽回损失 ¥2.3亿' },
    tags: ['侵权监测', '证据固定', '诉讼支持'],
    cta: '开始维权',
  },
  {
    icon: ShieldAlert,
    title: 'FTO调查',
    description: '产品上市前专利自由实施调查,排查侵权风险,提供规避设计建议与标准化FTO报告',
    metrics: { primary: '覆盖 180+ 国家', secondary: '6步闭环流程' },
    tags: ['风险排查', '侵权比对', '规避设计'],
    cta: '开始调查',
  },
  {
    icon: Compass,
    title: '专利导航',
    description: '遵循GB/T 39551-2020国家标准,提供产业规划、企业经营、研发活动全景式专利导航分析',
    metrics: { primary: '5类应用场景', secondary: '国家标准合规' },
    tags: ['产业规划', '技术空白', '竞争格局'],
    cta: '开始导航',
  },
  {
    icon: Calculator,
    title: '年费管理',
    description: '基于国知局2025最新标准,提供年费计算、减免政策、缴纳规划、成本优化与风险预警全流程服务',
    metrics: { primary: '覆盖20年周期', secondary: '85%减缴政策' },
    tags: ['费用计算', '减免申请', '权利恢复'],
    cta: '开始管理',
  },
]

const recentPatents = [
  { name: '智能分拣系统发明专利', type: '发明', status: '撰写中', updated: '2小时前', statusColor: '#FACC15' },
  { name: '图像识别方法及系统', type: '发明', status: '审查中', updated: '1天前', statusColor: '#3B82F6' },
  { name: '数据处理装置实用新型', type: '实用新型', status: '已授权', updated: '3天前', statusColor: '#22C55E' },
  { name: '商标近似检测算法', type: '发明', status: '已驳回', updated: '5天前', statusColor: '#EF4444' },
  { name: '区块链存证系统', type: '发明', status: '撰写中', updated: '1周前', statusColor: '#FACC15' },
]

const templateContent1 = `# 专利申请技术交底书

> **填写说明**:本模板依据《中华人民共和国专利法》《专利法实施细则》及《专利审查指南》(2023年修订版)编制。请发明人如实、详细填写,确保技术方案清楚完整。
> **保密承诺**:本交底书内容仅用于专利申请代理用途,代理人负有法定保密义务。

---

## 一、基本信息
| 项目 | 内容 |
|------|------|
| **发明名称** | (≤25字,采用所属技术领域通用术语,不得含人名/地名/商标/型号/商业宣传用语。例:一种智能分拣系统及其控制方法) |
| **申请类型** | □发明专利　□实用新型专利　□外观设计专利 |
| **申请人名称** | (个人姓名或企业全称) |
| **统一社会信用代码/身份证号** | |
| **联系人及电话** | |
| **电子邮箱** | |
| **通讯地址及邮编** | |
| **第一发明人** | (必须是自然人,对实质性特点作出创造性贡献的人) |
| **其他发明人** | (多人时请列出全部,按贡献排序) |
| **技术联系人** | (负责与代理人沟通技术细节的人员) |
| **完成日期** | ____年__月__日 |

---

## 二、所属技术领域
> **撰写指引**:写明该发明直接所属或直接应用的具体技术领域,而非上位领域或相邻领域。
> 例1:本发明涉及图像处理领域,尤其涉及一种基于深度学习的目标检测方法。
> 例2:本发明涉及机械加工设备领域,具体涉及一种车削夹具。

【在此填写技术领域描述】

---

## 三、背景技术
### 3.1 现有技术状况
> **撰写指引**:
> - 引证1-3篇最相关的现有技术文献(专利文献需注明国别+公开号;非专利文献注明出处)
> - 客观描述现有技术的结构/方法/原理
> - **不得使用贬义性语言**

【在此描述现有技术方案】

### 3.2 现有技术存在的缺陷/不足
> **撰写指引**:客观指出现有技术在效率、成本、精度、可靠性等方面的问题。这些缺陷正是本发明要解决的问题。
【在此具体阐述缺陷和不足】

### 3.3 本发明要解决的技术问题
> **撰写指引**:正面描述本发明的目的,应与后续技术方案和有益效果紧密呼应。
针对上述现有技术中存在的______问题,本发明的目的在于提供一种______,以实现______。

---

## 四、发明内容(核心部分 ⭐)

### 4.1 总体构思
> 用一两句话概括本发明的核心创新点,点明与现有技术的本质区别。
【在此阐述总体构思】

### 4.2 技术方案的详细描述
> **这是最重要的部分!** 需要使本领域技术人员能够理解和复现。
> **产品类发明**:按"部件→结构→连接关系→功能→工作原理"逻辑描述
>
> **方法类发明**:按步骤顺序描述,每步说明操作对象/方法/条件/参数

#### 【产品发明示例】
\`\`\`
本发明包括A部件、B部件和C部件,其中:
- A部件为______,设置在______位置,其特征在于______。
- B部件与A部件通过______方式连接,B部件用于实现______。
- C部件安装在______处,当装置工作时,A部件执行______动作, B部件响应并执行______,最终实现______效果。
\`\`\`

#### 【方法发明示例】
\`\`\`
本发明的方法包括以下步骤:
步骤1:对输入数据进行______预处理,条件为______。
步骤2:将步骤1处理后的数据与______进行______操作,参数设置为______。
步骤3:通过______算法对结果进行分析,输出______。
步骤4:根据分析结果执行______决策。
\`\`\`

【在此详细描述您的技术方案,建议分点阐述】

### 4.3 核心技术特征(权利要求初步构思)
> 提炼出区别于现有技术的核心技术特征,这些特征将成为权利要求的基础。
| 序号 | 核心技术特征 | 对应的有益效果 |
|------|-------------|---------------|
| 特征1 | | |
| 特征2 | | |
| 特征3 | | |

### 4.4 有益效果
> **撰写指引**:与现有技术对比说明优点,可用数据支撑(如效率提升X%、成本降低Y%)。
【在此描述有益效果】

---

## 五、附图及其简要说明
| 图号 | 图名 | 说明 |
|------|------|------|
| 图1 | | (整体结构示意图/流程图) |
| 图2 | | (关键部件放大图/子流程图) |
| 图3 | | (实施例示意图) |

> **注意**:附图为黑白线条图,无文字标注尺寸,各部件用阿拉伯数字统一标号。

---

## 六、具体实施方式
> **撰写指引**:给出一个或多个最佳实施方案,详细程度类似实验教科书,确保本领域技术人员能复现。
> - 配方参数应为**具体数值**(而非范围)
> - 实施例越多越有利于获得宽保护范围(建议≥3个)

### 实施例一:【主要实施方式】
【在此详细描述第一个实施方式的完整实现过程】

### 实施例二:【变型实施方式】
【在此描述第二种实现方式,体现不同的参数配置或结构变型】

### 实施例三:(如有)

---

## 七、替代方案 / 变形设计

> 列出您想到的其他可能的技术实现方式,便于代理人评估是否需要纳入保护范围。
【在此填写】

---

## 八、需要保密的技术诀窍(Know-how)
> 如有不愿公开但希望保留的技术细节,请在此注明。代理人会在撰写时酌情隐去。
【选填】

---

## 九、附件清单
- [ ] 附图(A4纸黑白绘制或CAD打印)
- [ ] 现有技术对比文献复印件
- [ ] 试验数据/测试报告
- [ ] 其他补充材料

---

## 十、签章确认
| 角色 | 签字 | 日期 |
|------|------|------|
| 发明人/设计人 | | ____年__月__日 |
| 技术负责人审核 | | ____年__月__日 |
| IP部门确认 | | ____年__月__日 |

> **提交前自查**:
> - [ ] 发明名称规范(无商标/型号/人名)
> - [ ] 技术方案完整可复现
> - [ ] 背景技术引证充分
> - [ ] 有益效果明确
> - [ ] 附图清晰标号一致
> - [ ] 实施例足够详细

---
*本模板依据 CNIPA《专利审查指南》(2023) + GB/T 相关国家标准编制*
*最后更新:2025年1月*`

const templateContent2 = `# 权利要求书
> **法律效力声明**:权利要求书是确定专利权保护范围的**唯一法律依据**。《专利法》第64条规定:发明或者实用新型专利权的保护范围以其权利要求的内容为准。
> **撰写核心原则**:清楚、简要、支持(《专利法》第26条第4款)

---

## 一、独立权利要求(必填 ⭐)

> 独立权利要求限定最宽的保护范围,必须包含解决技术问题所必需的**全部必要技术特征**。
> **标准句式**:\`一种[发明名称],其特征在于,[前序部分:与现有技术共有的必要技术特征],其特征在于,[特征部分:区别于现有技术的技术特征]。\`

### 权利要求1:【独立权利要求】最宽保护范围
一种**[发明/实用新型名称]**,其特征在于,包括:

**[前序部分 — 与最接近现有技术共有的必要技术特征]**

**[特征部分 — 区别于现有技术的核心技术特征]**
- **[核心技术特征1]**,所述[特征1]与[特征2]之间通过[连接方式]连接。
- **[核心技术特征2]**,所述[特征2]用于[功能描述]。
- **[核心技术特征3]**,所述[特征3]设置为[位置/方式]。
其特征在于,[可选:实现的工作原理/达到的技术效果]。

> **撰写检查清单**:
> - [ ] 是否包含了实现发明目的的全部必要技术特征?
> - [ ] 前序部分是否准确反映了与现有技术的共性?
> - [ ] 特征部分是否清楚界定了区别特征?
> - [ ] 保护范围是否适当(不过宽也不过窄)?

---

## 二、从属权利要求(推荐 ≥3项)

> 从属权利要求在独立权利要求基础上增加附加技术特征,进一步限定保护范围。
> **标准句式**:\`根据权利要求n所述的[名称],其特征在于,[附加技术特征]。\`
>
> **作用**:① 构建防御性权利梯度,为修改留退路,提高授权稳定性。

### 权利要求2:根据权利要求1所述的**[名称]**,其特征在于,**[附加技术特征1]**,所述[附加特征1]的具体参数为**[具体值/范围]**,用于**[功能/效果]**。

### 权利要求3:根据权利要求1所述的**[名称]**,其特征在于,**[附加技术特征2]**,所述[附加特征2]与**[核心特征X]**的配合关系为**[具体方式]**。

### 权利要求4:根据权利要求3所述的**[名称]**,其特征在于,**[附加技术特征3]**,包含**[子特征A]**和**[子特征B]**,其中:
- 所述**[子特征A]**用于**[功能A]**。
- 所述**[子特征B]**用于**[功能B]**。

### 权利要求5:(可选)方法权利要求
一种**[对应方法的名称]**,其特征在于,包括以下步骤:
- 步骤S1:**[第一步操作]**,条件为**[参数]**。
- 步骤S2:**[第二步操作]**,其中**[关键参数]**设置为**[值]**。
- 步骤S3:**[第三步操作]**,输出**[结果]**。

---

## 三、撰写规范速查表
| 规范项 | 要求 | 常见错误 |
|--------|------|---------|
| **用语规范** | 使用确定的技术术语 | "大概""近似""相关""较强"等模糊词 |
| **引用正确** | 引用在前权利要求的编号必须存在 | 引用不存在的权利要求号 |
| **单一性** | 一项独立权利要求只能有一个技术方案 | 两项并列方案未拆分为多项独权 |
| **支持性** | 所有技术特征必须在说明书中有记载 | 超出说明书公开的范围 |
| **必要特征** | 独立权利要求不能遗漏必要技术特征 | 非必要技术特征写入独权导致范围过窄 |
| **功能性限定** | 尽量用结构/步骤限定,避免纯功能描述 | "能够实现XX功能的装置" |

---

## 四、权利要求布局策略

### 4.1 保护层次设计

\`\`\`
权利要求1(独权):最宽保护范围,防御竞争对手规避设计
    ├ 权利要求2-3(从属):增加关键技术细节,提高授权稳定性
    ├ 权利要求4-5(从属):具体实施方式,构建权利梯度
    └ 权利要求6+(可选):方法/用途/变形,全方位保护
\`\`\`

### 4.2 常见布局模式

| 模式 | 适用场景 | 示例 |
|------|---------|------|
| **伞式布局** | 核心技术创新 | 独权(1)→从权(2-10),层层递进 |
| **并联式布局** | 多种技术路线 | 多项独权分别保护不同方案 |
| **围栏式布局** | 防御性申请 | 围绕竞品专利周边布设从属 |
| **混合式布局** | 综合性保护 | 以上组合使用 |

---

## 五、《专利法》关键条款索引
| 条款 | 内容 | 与权利要求的关系 |
|------|------|-----------------|
| 第26条第4款 | 权利要求应当清楚、简要 | 撰写质量的法律标准 |
| 第64条 | 保护范围以权利要求内容为准 | 权利要求的法律效力 |
| 第22条 | 新颖性、创造性、实用性 | 授权实质条件 |
| 第31条 | 单一性要求 | 一项申请一个总的发明构思 |

---
*本模板依据《专利法实施细则》(2023修订)第10-22条 + 《专利审查指南》第二部分第二章编制*
*最后更新:2025年1月*`

const templateContent3 = `# 专利新颖性检索报告
> **报告编号**:IPClaw-NV-[YYYYMMDD]-[序号]
> **报告性质**:本报告为AI辅助生成的新颖性预检索报告,仅供参考。正式查新报告需由国家一级科技查新机构出具并盖章。

---

## 一、报告基本信息
| 项目 | 内容 |
|------|------|
| **发明名称** | |
| **申请类型** | □发明　□实用新型　□外观设计 |
| **申请人** | |
| **委托日期** | ____年__月__日 |
| **检索人/机构** | IPClaw AI检索系统 |
| **完成日期** | ____年__月__日 |
| **检索目的** | □申请前查新　□FTO自由实施　□无效宣告　□侵权分析　□其他:___ |

---

## 二、检索范围
### 2.1 数据库覆盖
| 数据库 | 类型 | 覆盖范围 | 时间跨度 |
|--------|------|---------|---------|
| 中国专利文摘数据库(CNABS) | 专利 | 中国发明专利/实用新型/外观设计 | 1985至今 |
| 中国专利全文数据库(CNFULL) | 专利 | 中国专利全文文本 | 1985至今 |
| 德温特世界专利索引(DWPI) | 专利 | 全球178个国家地区专利 | 1963至今 |
| EPO Espacenet | 专利 | 全球1.5亿专利文献 | 至今 |
| USPTO Patent Full-Text | 专利 | 美国授权专利与申请公开 | 1790至今 |
| WIPO PATENTSCOPE | 专利 | PCT国际申请 + 各国专利 | 1978至今 |
| 中国知网(CNKI) | 非专利 | 中文期刊/学位论文/会议论文 | 至今 |
| IEEE Xplore | 非专利 | 英文期刊/会议/标准 | 1884至今 |
| Web of Science | 非专利 | SCI/EI核心期刊 | 1900至今 |

### 2.2 时间截止
**检索截止日**:____年____月____日

### 2.3 地域范围
**检索地域**:□ 中国　□ 美国　□ 欧洲(PCT)　□ 日本　□ 韩国　□ 全球

---

## 三、检索要点
### 3.1 关键词策略
| 类别 | 中文关键词 | 英文关键词 | 同义词/近义词 |
|------|-----------|-----------|-------------|
| **核心技术词1** | | | |
| **核心技术词2** | | | |
| **功能/效果词** | | | |
| **应用场景词** | | | |
| **排除词** | | | |

### 3.2 分类号(IPC/CPC)

| 分类体系 | 分类号 | 含义 |
|----------|--------|------|
| IPC主分类号 | | |
| IPC副分类号 | | |
| CPC扩展分类 | | |

### 3.3 检索式

\`\`\`
# 第一轮:宽泛检索(确保查全率)
(TIAB=(关键词1 OR 同义词1)) AND (TIAB=(关键词2 OR 同义词2))

# 第二轮:精确检索(聚焦核心技术)
(TI=(精确词1) AND TI=(精确词2)) AND (IPC=分类号)

# 第三轮:分类号扩展
IPC=(主分类号 OR 下位分类号)

# 第四轮:申请人追踪
PA=(竞争对手名称) AND (PD>=起始日期)
\`\`\`

---

## 四、检索结果
### 4.1 文献统计

| 数据库 | 初步命中量 | 筛选后相关量 | 高度相关(X/Y类) |
|--------|-----------|-------------|----------------|
| CNABS | | | |
| DWPI | | | |
| Espacenet | | | |
| 合计 | | | |

### 4.2 相关文献列表

| 编号 | 文献类型 | 公开号 | 公开日期 | 标题 | 相关度 | 影响类型 |
|------|---------|--------|---------|------|--------|---------|
| D1 | □专利　□非专利 | | | | ★★★★★ | □X □Y □A |
| D2 | □专利　□非专利 | | | | ★★★★☆ | □X □Y □A |
| D3 | □专利　□非专利 | | | | ★★★☆☆ | □Y □A |
| D4 | □专利　□非专利 | | | | ★★☆☆☆ | □A |

> **影响类型说明**:
> - **X类**:单独影响新颖性或创造性的文件(最危险!)
> - **Y类**:与其他Y类文件组合影响创造性的文件
> - **A类**:背景技术文件(仅作参考)
> - **E类**:抵触申请文件(同日申请在后公开)
> - **P类**:中间文件(优先权日期间公开)

### 4.3 重点文献详情

#### 文献D1:【最接近现有技术】
- **公开号**:
- **公开日期**:
- **标题**:
- **摘要/权利要求要点**:
- **与本发明的差异**:
  - 相同点:
  - 不同点:
- **影响分析**:□ 影响新颖性　□ 影响创造性　□ 不影响

#### 文献D2:(同上格式)

---

## 五、新颖性与创造性分析
### 5.1 新颖性评价(《专利法》第22条第2款)

| 权利要求 | D1对比 | D2对比 | 结论 |
|----------|--------|--------|------|
| 权利要求1(独权) | □相同 □相似 □不同 | □相同 □相似 □不同 | □具备新颖性 □不具备 |
| 权利要求2 | | | |
| 权利要求3 | | | |

### 5.2 创造性评价(《专利法》第22条第3款)

| 对比文件组合 | 技术启示判断 | 非显而易见性论证 | 结论 |
|-------------|-------------|-----------------|------|
| D1 alone | □有启示 □无启示 | | □具备创造性 □不具备 |
| D1 + D2 | □有结合启示 □无结合启示 | | □具备创造性 □不具备 |
| D1 + D2 + D3 | | | |

### 5.3 授权前景预判

| 维度 | 评级 | 说明 |
|------|------|------|
| **新颖性** | 🟢 高 / 🟡 中 / 🔴 低 | |
| **创造性** | 🟢 高 / 🟡 中 / 🔴 低 | |
| **实用性** | 🟢 高 / 🟡 中 / 🔴 低 | |
| **综合预判** | 🟢 推荐申请 / 🟡 需要修改 / 🔴 风险较高 | |

---

## 六、风险提示与建议

### 6.1 主要风险点
1.
2.

### 6.2 应对建议
- **权利要求调整建议**:
- **技术方案优化方案**:
- **规避设计建议**:

### 6.3 下一步行动计划
□ 提交正式查新申请(国家一级科技查新机构)
□ 调整权利要求范围后重新检索
□ 直接进入申请程序
□ 进行FTO深度排查

---

## 七、附录
- 附录A:完整检索式记录
- 附录B:筛选过程记录
- 附录C:对比文件全文/截图

---
*本报告由 IPClaw AI检索系统自动生成*
*检索依据:《专利法》第22条 + 《专利审查指南》第二部分第三章 + GB/T 相关标准*
*最后更新:2025年1月*`

const templateContent4 = `# 专利审查意见通知书答复模板
> **适用情形**:收到国家知识产权局发出的《第一次/第N次审查意见通知书》后,按照此框架准备答复材料。
> **重要时限**:自收到审查意见之日起**4个月内**(可延期1个月×2次=最迟6个月)必须答复,逾期视为撤回。

---

## 一、案件基本信息
| 项目 | 内容 |
|------|------|
| **申请号** | |
| **发明名称** | |
| **申请人** | |
| **审查员** | |
| **通知书发文日** | ____年__月__日 |
| **答复期限** | ____年__月__日(逾期视为撤回!) |
| **审查次数** | □第一次审查意见　□第二次 □第N次 |

---

## 二、审查意见概览
### 2.1 审查结论类型

| 类型 | 含义 | 应对难度 |
|------|------|---------|
| **全部驳回** | 所有权利要求均不可授权 | 较难 |
| **部分驳回** | 部分权利要求可授权 | 中等 |
| **形式补正** | 仅需修改格式问题 | 简单 |

本次审查结论:□ 全部驳回　□ 部分驳回　□ 形式补正

### 2.2 审查意见逐条梳理

| 序号 | 引用的权利要求 | 审查意见类型 | 审查员观点摘要 | 引用的对比文件 |
|------|---------------|-------------|----------------|---------------|
| 1 | 权利要求X | □新颖性 □创造性 □不支持 □不清楚 □不简要 | | D1: XXXXXXXX |
| 2 | 权利要求Y | | | D2: XXXXXXXX |
| 3 | | | | |

---

## 三、答复策略制定
### 3.1 总体策略选择

| 策略 | 适用场景 | 操作方式 |
|------|---------|---------|
| **争辩式** | 审查员理解偏差/事实认定错误 | 书面陈述争辩理由,不改权利要求 |
| **修改式** | 权利要求确实存在缺陷 | 修改权利要求(删除/合并/从属→独权) |
| **混合式**(推荐) | 大多数情况 | 争辩 + 修改相结合 |

本次选择策略:□ 争辩式　□ 修改式　□ 混合式

### 3.2 各条款答复计划
| 审查意见 | 答复方式 | 核心论点 | 计划修改内容 |
|---------|---------|---------|-------------|
| 意见1 | □争辩 □修改 □删除 | | |
| 意见2 | □争辩 □修改 □删除 | | |
| 意见3 | □争辩 □修改 □删除 | | |

---

## 四、答复正文模板
### 开头语

尊敬的审查员:
申请人收到了贵局于____年____月____日发出的关于申请号________的审查意见通知书。经过认真研究,申请人对审查意见陈述如下意见,并对申请文件进行了如下修改(如有修改)。恳请审查员在考虑下述意见的基础上继续审查本案。

---

### 正文一:关于修改说明(如有修改)
> 根据《专利法》第33条及《专利法实施细则》第51条第3款,申请人对权利要求书进行了如下修改:

**原权利要求X**(修改前原文):

**修改后**:

**修改依据**:□ 克服审查员指出的缺陷　□ 进一步明确保护范围
> 修改符合《专利法》第33条的规定,修改内容未超出原说明书和权利要求书记载的范围。

---

### 正文二:关于新颖性的争辩(针对第22条第2款)

**审查员认为**:[引用审查员的原文]

**申请人认为**:本申请权利要求X相对于对比文件X具备新颖性,理由如下:

**1. 技术方案不同**
- 本申请权利要求X限定了[技术特征A],而对比文件X未公开/未限定该特征...
- 本申请中[特征A]与[特征B]的连接关系为[具体方式],而对比文件X中...

**2. 解决的技术问题不同**
- 本申请要解决的是[技术问题A],而对比文件X解决的是[技术问题B]
- 两者虽然都涉及[某领域],但技术目的完全不同...

**3. 预期效果不同**
- 本申请实现了[有益效果A],而对比文件X无法实现该效果...

**结论**:本申请权利要求X与对比文件X不属于"同样的发明或实体",具备新颖性。

---

### 正文三:关于创造性的争辩(针对第22条第3款)⭐最重要
**审查员认为**:权利要求X相对于对比文件X+Y(或X+公知常识)不具备创造性。

**申请人认为**:本申请具备创造性,理由如下:

**1. 确定最接近的现有技术**
- 对比文件X披露了[技术特征...]
- 但对比文件X未披露[区别技术特征...]

**2. 确定区别技术特征和实际解决的技术问题**
- 本申请与对比文件X的区别在于:[区别特征列表]
- 基于上述区别特征,本申请实际解决的技术问题是:[技术问题]

**3. 判断是否显而易见(三步法反推)**

**第一步:对比文件X是否存在技术启示?**
- 对比文件X(或Y)中[是否]给出了将[区别特征]应用于[最接近现有技术]的技术启示。
- 对比文件X要解决的技术问题是[X问题],与本申请解决的[Y问题]不同。
- 因此,本领域技术人员**没有动机**将两者结合。

**第二步:是否有"事后诸葛亮"之嫌?**
- 审查意见中的结合方式是在**看到本申请之后**的反推。
- 在申请日之前,本领域技术人员面对对比文件X时,**不会自然而然地**想到...

**第三步:取得了何种预料不到的技术效果?**
- 本申请相比对比文件X,[量化指标]提升了[X%]
- 该效果是**非显而易见的**,属于预料不到的技术效果。

**结论**:权利要求X相对于对比文件X+Y具备创造性。

---

### 正文四:关于其他审查意见的答复
#### 关于"权利要求不清楚"
> 审查员认为:[具体不清楚之处]
>
> 申请人认为:[澄清说明,必要时修改措辞]

#### 关于"权利要求得不到说明书支持"
> 审查员认为:[具体不支持之处]
>
> 申请人认为:[引用说明书段落证明支持性]

#### 关于"缺乏单一性"
> 审查员认为:[具体单一性问题]
>
> 申请人认为:[论述同一发明构思/技术关联]

---

### 结尾语
综上所述,申请人认为,修改后的权利要求书已经克服了审查意见通知书中指出的全部缺陷,符合《专利法》及《专利法实施细则》的相关规定。恳请审查员在审阅上述意见的基础上,尽早授予本申请专利权。

如审查员对本答复有任何疑问,申请人愿意积极配合进一步沟通。

此致
敬礼!

**申请人**:________________
**代理机构**:________________
**代理人**:________________
**日期**:____年____月____日

---

## 五、答复质量自查清单
| 检查项 | 通过 |
|--------|------|
| □ 未超过4个月答复期限 | □ |
| □ 修改内容未超出原始公开范围(《专利法》第33条) | □ |
| □ 争辩理由有理有据,避免情绪化表达 | □ |
| □ 引用了具体的对比文件段落/权利要求编号 | □ |
| □ 创造性论述使用了正确的"三步法"逻辑 | □ |
| □ 提供了预料不到的技术效果的证据 | □ |
| □ 修改后的权利要求仍保持适当的保护范围 | □ |
| □ 答复信格式规范、语言专业 | □ |

---

## 六、常见审查意见类型速查

| 审查意见 | 法律依据 | 最佳应对策略 |
|---------|---------|-------------|
| **不具备新颖性(A22.2)** | 与对比文件相同 | 找区别特征,论证技术方案不同 |
| **不具备创造性(A22.3)** | 对比文件结合显而易见 | 三步法反推+预料不到的效果 |
| **权利要求不清楚(A26.4)** | 术语模糊/范围不清 | 修改措辞使其确定 |
| **得不到说明书支持(A26.4)** | 超出说明书记载范围 | 缩小范围或补充说明书依据 |
| **缺乏单一性(A31)** | 不属于一个总的发明构思 | 论述技术关联或删除/分案 |
| **不属于专利保护客体(A25)** | 智力活动规则/纯算法 | 结合技术手段重新表述 |
| **依赖关系错误** | 从属权利要求引用不当 | 修正引用编号 |

---
*本模板依据《专利法》第22/25/26/31/33/37条 + 《专利法实施细则》 + 《专利审查指南》第二部分第八章编制*
*最后更新:2025年1月*`

interface Template {
  icon: React.ElementType
  title: string
  desc: string
  content: string
}

const templates: Template[] = [
  { icon: PenTool, title: '技术交底书模板', desc: '标准技术交底书格式', content: templateContent1 },
  { icon: LayoutGrid, title: '权利要求书模板', desc: '权利要求层次结构模板', content: templateContent2 },
  { icon: Search, title: '新颖性检索报告模板', desc: '检索报告标准格式', content: templateContent3 },
  { icon: Reply, title: '审查意见答复模板', desc: '常见审查意见答复框架', content: templateContent4 },
]

export default function PatentBusiness() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  const handleServiceClick = (title: string) => {
    if (title === '专利检索') {
      navigate('/patent/search')
    } else if (title === '专利布局分析') {
      navigate('/patent/layout')
    } else if (title === '专利撰写') {
      navigate('/patent/drafting')
    } else if (title === 'FTO调查') {
      navigate('/patent/fto')
    } else if (title === '专利导航') {
      navigate('/patent/navigation')
    } else if (title === '年费管理') {
      navigate('/patent/fee')
    } else if (title === '专利维权') {
      navigate('/patent/rights')
    } else if (title === '审查意见答复') {
      navigate('/patent/response')
    }
  }

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTemplate(null)
    }
    if (selectedTemplate !== null) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [selectedTemplate])

  const handleCopy = useCallback(async () => {
    if (selectedTemplate === null) return
    try {
      await navigator.clipboard.writeText(templates[selectedTemplate].content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for non-secure contexts
      const textarea = document.createElement('textarea')
      textarea.value = templates[selectedTemplate].content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [selectedTemplate])

  const handleDownload = useCallback(() => {
    if (selectedTemplate === null) return
    const tmpl = templates[selectedTemplate]
    const blob = new Blob([tmpl.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IPClaw_${tmpl.title}_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [selectedTemplate])

  return (
    <Layout>
      <div className="p-6 pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--navy-600)] mb-4">
            <span>首页</span>
            <ChevronRight size={14} />
            <span className="text-[var(--text-primary)]">专利业务</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">专利业务中心</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                全生命周期专利服务,从撰写到维权的智能解决方案
              </p>
            </div>
            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
            >
              <PlusCircle size={16} />
              新建专利项目
            </button>
          </div>

          {/* Stat cards */}
          <div className="flex gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                }}
                className="flex-1 min-w-[180px] flex items-center gap-3.5 p-4 rounded-xl border border-[var(--navy-700)]"
                style={{
                  background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                  borderLeft: `2px solid ${stat.color}`,
                }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
                <div>
                  <div className="text-xl font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--navy-600)]">{stat.label}</div>
                  <div className="text-xs text-[#22C55E] mt-0.5">{stat.trend} 环比</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Service Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">服务概览</h2>
          <div className="grid grid-cols-3 gap-5">
            {services.map((service, i) => (
              <div key={service.title} onClick={() => handleServiceClick(service.title)} className="cursor-pointer">
                <ServiceCard
                  {...service}
                  accentColor={accentColor}
                  delay={i * 0.08}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity + Quick Start */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 grid grid-cols-5 gap-6"
        >
          {/* Recent Patents */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">最近专利项目</h3>
              <span className="text-xs text-[var(--gold-400)] cursor-pointer hover:underline">查看全部 →</span>
            </div>
            <div
              className="rounded-xl border border-[var(--navy-700)] overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--navy-700)] text-[var(--navy-600)]">
                    <th className="text-left px-4 py-3 font-medium">专利名称</th>
                    <th className="text-left px-4 py-3 font-medium">类型</th>
                    <th className="text-left px-4 py-3 font-medium">状态</th>
                    <th className="text-left px-4 py-3 font-medium">更新日期</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatents.map((patent, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--navy-700)] last:border-0 hover:bg-[rgba(250,204,21,0.02)]"
                    >
                      <td className="px-4 py-3 text-[var(--text-primary)]">{patent.name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patent.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            background: `${patent.statusColor}1A`,
                            color: patent.statusColor,
                            border: `1px solid ${patent.statusColor}33`,
                          }}
                        >
                          {patent.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patent.updated}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--gold-400)] cursor-pointer hover:underline">查看</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Start Templates */}
          <div className="col-span-2">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">快速开始</h3>
            <div className="flex flex-col gap-2.5">
              {templates.map((tmpl, i) => (
                <motion.div
                  key={tmpl.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08, duration: 0.4 }}
                  onClick={() => setSelectedTemplate(i)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--navy-700)] cursor-pointer hover:border-[var(--gold-400)] transition-colors"
                  style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accentColor}1A`, color: accentColor }}
                  >
                    <tmpl.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{tmpl.title}</div>
                    <div className="text-xs text-[var(--navy-600)]">{tmpl.desc}</div>
                  </div>
                  <span className="text-xs text-[var(--gold-400)] hover:underline flex-shrink-0">使用</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Template Modal */}
        <AnimatePresence>
          {selectedTemplate !== null && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedTemplate(null)}
              />

              {/* Modal Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
              >
                <div
                  className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--navy-700)] shadow-2xl pointer-events-auto flex flex-col"
                  style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Toolbar */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] truncate pr-4">
                      {templates[selectedTemplate].title}
                    </h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Copy Button */}
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          copied
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-navy-700/50 text-navy-300 border border-navy-600 hover:text-white hover:bg-navy-600/50'
                        }`}
                        title="复制到剪贴板"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? '已复制!' : '复制'}
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-700/50 text-navy-300 border border-navy-600 hover:text-white hover:bg-navy-600/50 transition-all duration-200"
                        title="下载Markdown文件"
                      >
                        <FileDown size={14} />
                        下载
                      </button>

                      {/* Close Button */}
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700/50 text-navy-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        title="关闭 (ESC)"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="overflow-y-auto flex-1 p-0">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed p-6 text-[var(--text-secondary)] font-mono m-0">
                      {templates[selectedTemplate].content}
                    </pre>
                  </div>

                  {/* Footer Hint */}
                  <div className="px-6 py-3 border-t border-[var(--navy-700)] flex items-center justify-between text-xs text-[var(--navy-600)] flex-shrink-0">
                    <span>按 ESC 关闭 · 点击遮罩层关闭</span>
                    <span>{templates[selectedTemplate].content.length.toLocaleString()} 字符</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Patent Project Wizard */}
      <PatentProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </Layout>
  )
}