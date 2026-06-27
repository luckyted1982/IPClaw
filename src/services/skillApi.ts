/**
 * IPClaw V2 通用任务模块 - 技能API
 *
 * 提供Skill的查询、调用、收藏等操作，模拟技能执行过程。
 */

import type { Skill } from './types';
import { mockSkills, delay } from './mockData';

// 内存中维护技能数据
let skills = [...mockSkills];

/**
 * 获取技能列表，可按分类筛选
 * @param category 技能分类（可选）
 * @returns 技能列表Promise
 */
export async function getSkills(category?: string): Promise<Skill[]> {
  await delay(300);
  if (category && category !== 'all') {
    return skills.filter((s) => s.category === category);
  }
  return [...skills];
}

/**
 * 获取最近使用的技能列表
 * @returns 最近使用的技能列表
 */
export async function getRecentSkills(): Promise<Skill[]> {
  await delay(200);
  return skills
    .filter((s) => s.isRecent)
    .sort((a, b) => b.downloads - a.downloads);
}

/**
 * 获取收藏的技能列表
 * @returns 收藏的技能列表
 */
export async function getFavoriteSkills(): Promise<Skill[]> {
  await delay(200);
  return skills.filter((s) => s.isFavorite);
}

/**
 * 调用技能并返回执行结果
 * @param skillId 技能ID
 * @param params 技能调用参数
 * @returns 技能执行结果文本
 */
export async function invokeSkill(
  skillId: string,
  params: Record<string, any>
): Promise<string> {
  await delay(1500);

  const skill = skills.find((s) => s.id === skillId);
  if (!skill) {
    throw new Error(`技能 "${skillId}" 不存在`);
  }

  // 标记为最近使用
  skill.isRecent = true;

  // 根据技能类型返回不同的Mock结果
  return generateSkillResult(skill, params);
}

/**
 * 切换技能的收藏状态
 * @param skillId 技能ID
 */
export async function toggleFavorite(skillId: string): Promise<void> {
  await delay(200);
  const skill = skills.find((s) => s.id === skillId);
  if (!skill) {
    throw new Error(`技能 "${skillId}" 不存在`);
  }
  skill.isFavorite = !skill.isFavorite;
}

/**
 * 获取技能详情
 * @param skillId 技能ID
 * @returns 技能详情
 */
export async function getSkillDetail(skillId: string): Promise<Skill> {
  await delay(200);
  const skill = skills.find((s) => s.id === skillId);
  if (!skill) {
    throw new Error(`技能 "${skillId}" 不存在`);
  }
  return { ...skill };
}

// ───────────────────────────────────────────────
// 内部辅助：生成技能执行结果
// ───────────────────────────────────────────────

function generateSkillResult(
  skill: Skill,
  params: Record<string, any>
): string {
  const paramDesc = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  switch (skill.category) {
    case 'patent':
      return generatePatentSkillResult(skill, paramDesc);
    case 'trademark':
      return generateTrademarkSkillResult(skill, paramDesc);
    case 'copyright':
      return generateCopyrightSkillResult(skill, paramDesc);
    case 'assessment':
      return generateAssessmentSkillResult(skill, paramDesc);
    case 'law':
      return generateLawSkillResult(skill, paramDesc);
    case 'general':
      return generateGeneralSkillResult(skill, paramDesc);
    default:
      return `【${skill.name}】技能执行完成。\n\n输入参数：${paramDesc || '无参数'}\n\n执行结果：技能已成功运行，请查看详细输出。`;
  }
}

function generatePatentSkillResult(skill: Skill, paramDesc: string): string {
  const results: Record<string, string> = {
    'skill-patent-draft': `【专利撰写助手】执行完成\n\n输入参数：${paramDesc || '技术交底书'}\n\n✅ 已生成以下文件：\n1. 说明书摘要（300字）\n2. 权利要求书（1项独立权利要求 + 5项从属权利要求）\n3. 说明书（技术领域、背景技术、发明内容、附图说明、具体实施方式）\n4. 摘要附图说明\n\n📋 关键权利要求布局：\n- 独立权利要求1：保护核心方法的整体流程\n- 从属权利要求2-3：限定具体算法实现\n- 从属权利要求4-5：保护系统架构和装置\n- 从属权利要求6：保护应用场景\n\n⚠️ 注意事项：\n- 请在实施例部分补充具体实验数据\n- 权利要求中的功能性限定需要对应说明书中的具体实现\n- 建议增加1-2个替代实施例以增强保护范围`,

    'skill-prior-art': `【prior art检索分析】执行完成\n\n输入参数：${paramDesc || '技术方案'}\n\n📊 检索结果摘要：\n- 检索数据库：CNABS、DWPI、USTXT、EPOQUE\n- 检索式：共构建12组检索策略\n- 检索结果：命中相关专利文献 156 篇\n\n🔴 高相关度文献（X类）：\n1. CN2021XXXXXX.X - 一种基于机器学习的温控方法（新颖性风险：高）\n2. US2019/XXXXXXXX - Adaptive temperature control system using neural networks\n3. WO2020/XXXXXX - Intelligent HVAC control method\n\n🟡 中等相关度文献（Y类）：\n- 共发现 23 篇可能破坏创造性的组合文献\n\n📋 初步评估意见：\n- 新颖性：存在一定风险，建议调整技术特征表述\n- 创造性：技术效果数据充分，创造性高度中等偏上\n- 建议：针对高相关文献进行规避设计或强调区别技术特征`,

    'skill-claim-analysis': `【权利要求分析】执行完成\n\n输入参数：${paramDesc || '权利要求书'}\n\n📊 分析结果：\n\n1️⃣ 保护范围评估：\n- 独立权利要求的保护范围适中，未引入非必要技术特征\n- 建议：可考虑将步骤(c)的具体参数限定移除以扩大保护范围\n\n2️⃣ 技术特征完整性：\n- 必要技术特征基本齐全\n- ⚠️ 缺少对"用户行为模式"的具体定义，可能导致保护范围不清\n\n3️⃣ 引用关系检查：\n- 引用关系正确，无跳引或重引问题\n- 从属权利要求的附加特征与独立权利要求的衔接合理\n\n4️⃣ 修改建议：\n- 建议增加一项从属权利要求保护具体的深度学习模型类型\n- 建议补充方法权利要求对应的装置权利要求\n- 考虑增加一项系统权利要求保护整体架构`,

    'skill-patent-invalid': `【专利无效宣告】执行完成\n\n输入参数：${paramDesc || '目标专利号'}\n\n📋 无效理由分析：\n\n1️⃣ 无效理由一：缺乏新颖性（《专利法》第22条第2款）\n- 证据1：CN2018XXXXXX（公开日早于优先权日）\n- 分析：目标专利的权利要求1的全部技术特征被证据1公开\n\n2️⃣ 无效理由二：缺乏创造性（《专利法》第22条第3款）\n- 证据组合：证据1 + 证据2（CN2019XXXXXX）\n- 分析：本领域技术人员容易将两者结合得到目标专利技术方案\n\n3️⃣ 无效理由三：公开不充分（《专利法》第26条第3款）\n- 说明书未充分说明"自适应算法"的具体实现方式\n\n📎 建议附件：\n- 无效宣告请求书（草稿）\n- 证据清单及对比分析表\n- 口审程序预案`,
  };

  return (
    results[skill.id] ||
    `【${skill.name}】执行完成\n\n输入参数：${paramDesc || '无参数'}\n\n专利分析结果已生成，请查看详细报告。`
  );
}

function generateTrademarkSkillResult(
  skill: Skill,
  paramDesc: string
): string {
  const results: Record<string, string> = {
    'skill-trademark-reg': `【商标注册申请】执行完成\n\n输入参数：${paramDesc || '商标信息'}\n\n📋 注册分析结果：\n\n1️⃣ 商标查询结果：\n- 相同商标：未发现完全相同的在先注册\n- 近似商标：发现 3 个可能构成近似的商标\n  * "智联云通"（42类，2019年注册）\n  * "智联云服"（42类，2020年注册）\n  * "智云联"（42类，2021年注册）\n\n2️⃣ 尼斯分类建议：\n- 核心类别：第42类（计算机软件设计、SaaS服务）\n- 关联类别：第9类（可下载的软件）、第35类（商业管理辅助）\n- 防御类别：第38类（信息传输）\n\n3️⃣ 注册风险评估：\n- 整体风险：中等（约65%成功率）\n- 主要风险：与"智联云通"的近似度较高\n- 建议：可考虑增加显著性设计元素或调整商标文字\n\n4️⃣ 申请材料清单：\n- 商标图样（清晰电子版，300dpi以上）\n- 申请人身份证明\n- 商品/服务清单\n- 代理委托书`,

    'skill-trademark-monitor': `【商标监测预警】执行完成\n\n输入参数：${paramDesc || '注册商标'}\n\n📊 监测结果（近30天）：\n\n🔴 高风险预警：\n1. 初步审定公告商标 "智联云智"（42类）\n   - 相似度：85%\n   - 异议期限：2025-02-15前\n   - 建议：建议提出异议申请\n\n🟡 中风险关注：\n- 发现 2 个具有一定相似度的商标进入形式审查\n\n🟢 安全状态：\n- 您的核心商标 "智联云" 权利状态稳定\n- 续展期限：2034年12月（尚无需处理）\n\n📋 建议行动：\n1. 对高风险商标及时提出异议（需准备异议申请书和证据）\n2. 关注中风险商标的审查进展\n3. 考虑在关联类别进行防御性注册`,

    'skill-trademark-dispute': `【商标争议解决】执行完成\n\n输入参数：${paramDesc || '争议信息'}\n\n📋 争议策略分析：\n\n1️⃣ 案件评估：\n- 争议类型：商标侵权纠纷\n- 您的商标权利基础：注册有效，权利稳定\n- 对方使用情况：在相同商品上使用近似商标\n- 胜算评估：较高（约75%）\n\n2️⃣ 证据准备清单：\n- 商标注册证及续展证明\n- 商标使用证据（销售合同、发票、广告等）\n- 侵权证据（网页截图、购买公证、产品实物）\n- 知名度证据（获奖证书、媒体报道、市场份额数据）\n\n3️⃣ 法律途径选择：\n- 首选：行政投诉（市场监管部门）- 速度快、成本低\n- 备选：民事诉讼 - 可主张赔偿\n- 辅助：电商平台投诉 - 快速下架侵权商品\n\n4️⃣ 赔偿估算：\n- 根据侵权规模和持续时间，预估赔偿范围：10-50万元`,
  };

  return (
    results[skill.id] ||
    `【${skill.name}】执行完成\n\n输入参数：${paramDesc || '无参数'}\n\n商标服务已完成，请查看详细报告。`
  );
}

function generateCopyrightSkillResult(
  skill: Skill,
  paramDesc: string
): string {
  const results: Record<string, string> = {
    'skill-copyright-reg': `【版权登记助手】执行完成\n\n输入参数：${paramDesc || '软件信息'}\n\n📋 登记材料检查：\n\n1️⃣ 源代码检查：\n- 页数：前30页 + 后30页 = 60页 ✓\n- 每页行数：平均52行 ✓\n- 页眉：已标注软件名称和版本号 ✓\n- 格式：连续页码 ✓\n\n2️⃣ 软件说明书检查：\n- 功能概述：已填写 ✓\n- 技术架构：需要补充系统架构图\n- 操作流程：需要补充界面截图\n\n3️⃣ 申请表信息：\n- 软件全称：数据分析平台V2.0\n- 开发完成日期：2024年12月\n- 著作权人：XX科技有限公司\n- 权利范围：全部权利\n\n⚠️ 需要补充的材料：\n1. 补充系统架构图到说明书\n2. 补充主要功能界面截图\n3. 提供营业执照副本复印件（加盖公章）\n\n预计办理时间：30-45个工作日`,

    'skill-copyright-monitor': `【版权侵权监测】执行完成\n\n输入参数：${paramDesc || '监测作品'}\n\n📊 监测结果（全网扫描）：\n\n🔴 确认侵权：\n1. 某网站未经授权转载您的文章《深度学习在专利分析中的应用》\n   - URL：example.com/article/12345\n   - 侵权类型：全文转载\n   - 证据已固定：网页截图 + 时间戳认证\n\n2. 某电商平台销售盗版软件\n   - 店铺名称：XX软件折扣店\n   - 侵权商品：数据分析平台破解版\n   - 销量：已售 156 件\n\n🟡 疑似侵权（需进一步确认）：\n- 发现 5 个网站使用了与您作品高度相似的内容\n\n📋 维权建议：\n1. 发送律师函/警告信\n2. 向平台投诉下架（DMCA/通知删除）\n3. 证据保全公证\n4. 如需诉讼，预估赔偿：5-20万元`,
  };

  return (
    results[skill.id] ||
    `【${skill.name}】执行完成\n\n输入参数：${paramDesc || '无参数'}\n\n版权服务已完成，请查看详细报告。`
  );
}

function generateAssessmentSkillResult(
  skill: Skill,
  paramDesc: string
): string {
  const results: Record<string, string> = {
    'skill-patent-valuation': `【专利价值评估】执行完成\n\n输入参数：${paramDesc || '专利信息'}\n\n📊 多维度价值评估报告：\n\n1️⃣ 法律价值（权重30%，得分：82/100）\n- 权利稳定性：权利要求表述清晰，无无效风险 ✓\n- 保护范围：独立权利要求保护范围适中\n- 剩余保护期：15年（价值折减系数：0.85）\n- 地域布局：中国+美国+欧洲，覆盖面广 ✓\n\n2️⃣ 技术价值（权重35%，得分：88/100）\n- 技术先进性：处于行业领先水平\n- 技术成熟度：已通过中试验证\n- 可替代性：替代难度较高\n- 技术生命周期：成长期（预计5-8年）\n\n3️⃣ 经济价值（权重35%，得分：75/100）\n- 市场应用前景：目标市场规模约50亿元\n- 许可收益预测：年许可费收入约200-500万元\n- 成本节约价值：年节约成本约300万元\n\n📈 综合评估价值：\n- 收益法评估值：2,850万元\n- 市场法参考值：2,200-3,500万元\n- 成本法基准值：1,800万元\n- **推荐评估值：2,600万元**`,

    'skill-ip-portfolio': `【专利组合分析】执行完成\n\n输入参数：${paramDesc || '企业专利组合'}\n\n📊 专利组合分析报告：\n\n1️⃣ 组合概况：\n- 专利总量：156件（发明89件，实用新型52件，外观设计15件）\n- 有效专利：142件（91%存活率）\n- 海外布局：美国12件，欧洲8件，日本5件\n\n2️⃣ 技术布局分析：\n- 核心技术A：45件（占比29%）- 布局充分 ✓\n- 核心技术B：38件（占比24%）- 布局充分 ✓\n- 外围技术C：28件（占比18%）- 可加强\n- 新兴技术D：15件（占比10%）- 需关注趋势\n\n3️⃣ 竞争对标：\n- vs 竞争对手A：数量领先20%，但质量指数低15%\n- vs 竞争对手B：核心技术覆盖更全面\n\n4️⃣ 风险提示：\n- 12件专利将在未来3年内到期\n- 5件专利存在被无效风险\n\n📋 战略建议：\n1. 加强新兴技术D的专利申请\n2. 对高风险专利进行权利要求补强\n3. 考虑在东南亚市场增加布局`,

    'skill-tech-transfer': `【技术转让评估】执行完成\n\n输入参数：${paramDesc || '技术信息'}\n\n📊 技术转让评估报告：\n\n1️⃣ 技术概况：\n- 技术领域：人工智能/智能控制\n- 技术成熟度：TRL 7（系统在实际环境中完成验证）\n- 知识产权保护：中国发明专利（已授权）+ PCT申请\n\n2️⃣ 市场评估：\n- 目标市场：智能家居/智能建筑控制系统\n- 市场规模：预计2028年达到200亿元\n- 竞争格局：市场上3-5家主要竞争者\n\n3️⃣ 转让定价分析：\n\n| 评估方法 | 估值区间 | 权重 |\n|---------|---------|------|\n| 成本法 | 800-1200万元 | 20% |\n| 市场法 | 1500-2500万元 | 35% |\n| 收益法 | 1800-3000万元 | 45% |\n\n📈 **推荐转让价格区间：1,600 - 2,400万元**\n\n4️⃣ 交易结构建议：\n- 方案A：一次性转让（价格偏低，但风险小）\n- 方案B：入门费+里程碑付款+销售提成（推荐，双方风险共担）\n- 方案C：合资设立新公司（长期收益最大）`,
  };

  return (
    results[skill.id] ||
    `【${skill.name}】执行完成\n\n输入参数：${paramDesc || '无参数'}\n\n评估分析已完成，请查看详细报告。`
  );
}

function generateLawSkillResult(skill: Skill, paramDesc: string): string {
  const results: Record<string, string> = {
    'skill-ip-litigation': `【专利诉讼策略】执行完成\n\n输入参数：${paramDesc || '诉讼信息'}\n\n📋 诉讼策略分析报告：\n\n1️⃣ 案件评估：\n- 案由：专利侵权纠纷\n- 涉案专利：ZL2020XXXXXXXX.X\n- 被告：XX科技有限公司\n- 侵权行为：制造、销售、许诺销售侵权产品\n\n2️⃣ 侵权比对分析：\n- 权利要求1的技术特征分解：6个必要技术特征\n- 被控侵权产品覆盖情况：全部覆盖 ✓\n- 等同侵权可能性：较高\n- 侵权成立概率：约80%\n\n3️⃣ 赔偿计算方案：\n\n| 计算方式 | 赔偿金额 |\n|---------|---------|\n| 权利人实际损失 | 500万元 |\n| 侵权人违法所得 | 800万元 |\n| 合理许可费倍数 | 600万元 |\n| 法定赔偿 | 100-500万元 |\n\n📈 建议索赔金额：800万元\n\n4️⃣ 诉讼策略建议：\n- 管辖法院：建议选择XX知识产权法院\n- 证据保全：建议申请诉前证据保全和财产保全\n- 时间规划：一审约12-18个月\n- 费用预算：律师费+诉讼费+鉴定费约80-120万元`,

    'skill-freedom-operate': `【自由实施分析(FTO)】执行完成\n\n输入参数：${paramDesc || '产品技术方案'}\n\n📊 FTO分析报告：\n\n1️⃣ 检索范围：\n- 检索数据库：CNABS、DWPI、USTXT、EPOQUE、JPO\n- 时间范围：近20年\n- 检索关键词：12组，覆盖核心技术特征\n\n2️⃣ 障碍专利识别：\n\n🔴 高风险专利（需规避或获得许可）：\n1. ZL2018XXXXXXXX - 温控方法及系统\n   - 权利要求保护范围：较宽\n   - 规避难度：中等\n   - 建议：设计规避方案或联系专利权人洽谈许可\n\n🟡 中风险专利（需持续监控）：\n- 共发现 3 件可能构成障碍的在审专利申请\n\n🟢 低风险/无障碍：\n- 其余技术特征未发现明显障碍专利\n\n3️⃣ 规避设计建议：\n- 将特征X替换为替代方案Y可避开专利1的权利要求\n- 增加特征Z可增强差异化，降低侵权风险\n\n4️⃣ 结论：\n- 整体FTO风险：中等\n- 建议：实施规避设计后风险可控，可正常上市`,

    'skill-ip-agreement': `【IP合同审查】执行完成\n\n输入参数：${paramDesc || '合同文本'}\n\n📋 合同审查意见：\n\n1️⃣ 合同基本信息：\n- 合同类型：专利实施许可合同\n- 许可方式：独占许可\n- 许可范围：中国大陆地区\n- 许可期限：5年\n\n2️⃣ 风险审查结果：\n\n🔴 高风险条款：\n1. 第3.2条：许可费支付条款\n   - 问题：未约定逾期付款的违约金\n   - 建议：增加"逾期付款按日万分之五支付违约金"\n\n2. 第5.1条：知识产权归属\n   - 问题：改进技术成果的归属约定不明确\n   - 建议：明确约定改进成果归改进方所有，但另一方有优先许可权\n\n🟡 中风险条款：\n- 第7条：保密条款的保密期限过短\n- 第9条：争议解决方式建议增加仲裁备选\n\n3️⃣ 修改建议总结：\n- 共发现 2 处高风险问题\n- 共发现 4 处中低风险问题\n- 整体合同质量：中等，修改后可使用`,
  };

  return (
    results[skill.id] ||
    `【${skill.name}】执行完成\n\n输入参数：${paramDesc || '无参数'}\n\n法律服务已完成，请查看详细报告。`
  );
}

function generateGeneralSkillResult(
  skill: Skill,
  paramDesc: string
): string {
  const results: Record<string, string> = {
    'skill-ip-consult': `【IP战略咨询】执行完成\n\n输入参数：${paramDesc || '企业信息'}\n\n📊 IP战略规划报告：\n\n1️⃣ 企业IP现状诊断：\n- 专利储备：156件，发明占比57%，结构合理\n- 商标布局：核心商标已注册，关联类别有缺口\n- 软著登记：32件，与产品数量匹配\n- 管理制度：有基本制度，执行力度需加强\n\n2️⃣ SWOT分析：\n- 优势(S)：研发投入稳定，技术积累扎实\n- 劣势(W)：海外布局薄弱，IP管理人员不足\n- 机会(O)：行业技术迭代快，新进入者需专利许可\n- 威胁(T)：竞争对手专利壁垒增强，NPE诉讼风险\n\n3️⃣ 三年战略目标：\n\n| 年度 | 专利申请 | 商标注册 | 软著登记 |\n|------|---------|---------|---------|\n| 2025 | 60件 | 15件 | 20件 |\n| 2026 | 80件 | 20件 | 25件 |\n| 2027 | 100件 | 25件 | 30件 |\n\n4️⃣ 重点行动项：\n1. 建立IP管理委员会，由CTO直接领导\n2. 设立IP专项预算，占研发费用的5-8%\n3. 启动海外布局（优先美国、欧洲）\n4. 建立IP风险预警机制\n5. 开展全员IP培训`,

    'skill-tech-competitor': `【竞争对手分析】执行完成\n\n输入参数：${paramDesc || '竞争对手'}\n\n📊 竞争对手专利情报报告：\n\n分析对象：XX科技有限公司\n\n1️⃣ 专利概况：\n- 专利总量：287件（发明198件，实用新型67件，外观设计22件）\n- 年申请量趋势：2022年45件 → 2023年62件 → 2024年78件（快速增长）\n- 海外布局：美国28件，欧洲15件，PCT申请40件\n\n2️⃣ 技术布局分析：\n- 核心技术1：智能算法（85件，占比30%）\n- 核心技术2：数据处理（67件，占比23%）\n- 核心技术3：用户交互（45件，占比16%）\n- 新兴技术：边缘计算（15件，近2年增长快）\n\n3️⃣ 关键专利（高引用、宽保护）：\n1. ZL2020XXXXXXXX - 核心基础专利，被引用56次\n2. ZL2021XXXXXXXX - 高价值专利，涉及核心收入来源\n\n4️⃣ 合作与引用关系：\n- 与高校合作：清华大学、浙江大学\n- 主要被引用方：您的公司（被引用23次）\n\n5️⃣ 风险预警：\n- 对方在您的核心技术A方向近期申请了12件专利\n- 建议关注可能的侵权风险和市场挤压`,

    'skill-ip-training': `【IP知识培训】执行完成\n\n输入参数：${paramDesc || '培训需求'}\n\n📚 知识产权培训课程大纲：\n\n**课程名称**：企业知识产权基础与实务\n**培训对象**：研发人员、产品经理、管理层\n**培训时长**：1天（6课时）\n\n**课程模块**：\n\n模块一：知识产权概述（1课时）\n- 什么是知识产权？\n- 知识产权的类型和保护客体\n- 知识产权对企业的重要性\n- 案例分析：苹果 vs 三星专利大战\n\n模块二：专利基础（2课时）\n- 专利的三性：新颖性、创造性、实用性\n- 专利申请流程详解\n- 技术交底书的撰写方法\n- 实操练习：撰写一份简单的技术交底书\n\n模块三：商标与版权（1课时）\n- 商标的注册与使用规范\n- 软件著作权的登记流程\n- 品牌保护策略\n\n模块四：知识产权管理（1课时）\n- 企业IP管理制度建设\n- 技术秘密保护\n- 知识产权风险防范\n\n模块五：案例研讨（1课时）\n- 典型专利纠纷案例分析\n- 小组讨论：本公司的IP风险点\n\n**培训材料已生成**，包括PPT课件、学员手册、测试题库。`,

    'skill-auto-classify': `【专利自动分类】执行完成\n\n输入参数：${paramDesc || '专利文献'}\n\n📊 分类结果：\n\n1️⃣ IPC分类号：\n- **主分类号**：G05D23/19（控制温度，专门适用于房间或建筑物的）\n- **副分类号**：G06N3/08（基于神经网络的学习方法）\n- **补充分类号**：F24F11/30（空调系统的控制，基于传感器输入）\n\n2️⃣ CPC分类号：\n- G05D23/1931（温度控制，使用神经网络）\n- G06N3/084（深度学习用于控制系统）\n\n3️⃣ 分类依据：\n- 技术主题：基于深度学习的室内温度自适应控制\n- 核心技术特征：神经网络模型 + 传感器数据融合 + 温控执行\n- 技术效果：节能优化、舒适度提升\n\n4️⃣ 技术聚类结果：\n- 所属技术集群：智能建筑/智能家居控制\n- 相关技术领域：IoT、边缘计算、能源管理\n- 技术成熟度：TRL 6-7（接近商业化）\n\n5️⃣ 专利地图坐标：\n- X轴（技术深度）：7.2/10\n- Y轴（应用广度）：6.5/10`,
  };

  return (
    results[skill.id] ||
    `【${skill.name}】执行完成\n\n输入参数：${paramDesc || '无参数'}\n\n通用服务已完成，请查看详细报告。`
  );
}
