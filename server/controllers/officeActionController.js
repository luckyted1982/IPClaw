import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export async function uploadOfficeActionFiles(req, res) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: '没有上传任何文件' });
    }

    const files = req.files;
    const extractedData = {};

    const extractTextFromPDF = async (file) => {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(file.data);
      return data.text;
    };

    if (files.officeAction) {
      extractedData.officeActionContent = await extractTextFromPDF(files.officeAction);
    }
    if (files.claims) {
      extractedData.claimsContent = await extractTextFromPDF(files.claims);
    }
    if (files.comparisonFiles) {
      const comparisonFiles = Array.isArray(files.comparisonFiles) ? files.comparisonFiles : [files.comparisonFiles];
      extractedData.comparisonFileContents = await Promise.all(
        comparisonFiles.map(f => extractTextFromPDF(f))
      );
      extractedData.comparisonFileNames = comparisonFiles.map(f => f.name);
    }
    if (files.otherFiles) {
      const otherFiles = Array.isArray(files.otherFiles) ? files.otherFiles : [files.otherFiles];
      extractedData.otherFileContents = await Promise.all(
        otherFiles.map(f => extractTextFromPDF(f))
      );
      extractedData.otherFileNames = otherFiles.map(f => f.name);
    }

    res.json({
      success: true,
      data: extractedData,
      message: '文件上传和解析成功'
    });
  } catch (error) {
    console.error('[OfficeAction] Upload error:', error);
    res.status(500).json({ error: '文件解析失败', details: error.message });
  }
}

export async function analyzeOfficeAction(req, res) {
  try {
    const { step, projectData } = req.body;

    if (!step || !projectData) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const prompts = {
      import: `你是一个专业的专利审查意见分析专家。请分析以下审查意见通知书内容，提取关键信息并进行结构化整理：

【审查意见通知书内容】
${projectData.officeActionContent || '暂无'}

【当前权利要求书】
${projectData.claimsContent || '暂无'}

【对比文件内容】
${projectData.comparisonFileContents?.join('\n---\n') || '暂无'}

请完成以下分析任务：
1. 提取案件基本信息（申请号、发明名称、申请人、审查员、发文日、答复期限）
2. 识别审查类型（第一次审查意见/第二次审查意见/驳回决定）
3. 梳理主要驳回理由及对应的法律条款
4. 提取审查员引用的对比文件列表
5. 识别审查员指出的关键问题和技术特征
6. 初步判断答复策略方向

请以JSON格式输出，包含以下字段：
- caseInfo: 案件基本信息对象
- rejectionReasons: 驳回理由数组
- comparisonFiles: 对比文件列表
- keyIssues: 关键问题数组
- responseStrategy: 答复策略建议`,

      featureCompare: `你是一个专业的专利技术特征分析专家。请基于以下信息进行技术特征拆解和对比分析：

【本申请权利要求书】
${projectData.claimsContent || '暂无'}

【对比文件1内容】
${projectData.comparisonFileContents?.[0] || '暂无'}

【对比文件2内容】
${projectData.comparisonFileContents?.[1] || '暂无'}

请完成以下分析：
1. 对本申请权利要求进行技术特征拆解，列出每个权利要求的所有技术特征
2. 对对比文件1进行技术特征拆解
3. 创建技术特征对比表，逐项对比本申请与对比文件1的技术特征
4. 分析特征之间的协同作用关系
5. 识别关键区别技术特征

请以JSON格式输出，包含以下字段：
- claimFeatures: 本申请权利要求特征拆解
- comparisonFile1Features: 对比文件1特征拆解
- featureComparisonTable: 特征对比表数组
- synergyAnalysis: 协同作用分析
- keyDistinguishingFeatures: 关键区别特征`,

      closestPriorArt: `你是一个专业的专利创造性分析专家。请分析以下内容，论证对比文件1是否适合作为最接近现有技术：

【本申请权利要求书】
${projectData.claimsContent || '暂无'}

【本申请技术方案描述】
${projectData.officeActionContent || '暂无'}

【对比文件1内容】
${projectData.comparisonFileContents?.[0] || '暂无'}

请完成以下分析：
1. 分析对比文件1的实际技术领域和要解决的技术问题
2. 分析本申请的实际技术领域和要解决的技术问题
3. 对比二者的技术问题差异
4. 论证对比文件1是否适合作为最接近现有技术
5. 如果不适合，请说明理由并建议更合适的最接近现有技术

请以JSON格式输出，包含以下字段：
- comparisonFile1Analysis: 对比文件1分析
- applicationAnalysis: 本申请分析
- technicalProblemDiff: 技术问题差异分析
- conclusion: 是否适合作为最接近现有技术
- reasoning: 论证理由
- suggestedPriorArt: 建议的最接近现有技术`,

      distinguishingFeatures: `你是一个专业的专利创造性分析专家。请分析以下内容，核对审查员关于区别技术特征的认定：

【审查意见内容】
${projectData.officeActionContent || '暂无'}

【本申请权利要求书】
${projectData.claimsContent || '暂无'}

【对比文件2内容】
${projectData.comparisonFileContents?.[1] || '暂无'}

【对比文件3内容】
${projectData.comparisonFileContents?.[2] || '暂无'}

请完成以下分析：
1. 摘录审查员认定的区别技术特征
2. 核对事实认定是否准确
3. 分析对比文件2/3是否能提供技术启示
4. 分析审查员是否存在特征割裂判断问题
5. 判断对比文件2/3能否提供相应的技术启示

请以JSON格式输出，包含以下字段：
- examinerDistinguishingFeatures: 审查员认定的区别特征
- factChecking: 事实认定核对结果
- secondaryReferenceAnalysis: 对比文件2/3技术启示分析
- featureSeparationIssue: 特征割裂问题分析
- conclusion: 技术启示结论`,

      commonKnowledge: `你是一个专业的专利法律分析专家。请分析审查意见中"公知常识"和"常规技术手段"的使用情况：

【审查意见内容】
${projectData.officeActionContent || '暂无'}

【本申请权利要求书】
${projectData.claimsContent || '暂无'}

请完成以下分析：
1. 汇总审查意见中所有"公知常识"或"常规技术手段"的表述
2. 分析审查员是否提供了相应的证据支持
3. 分析是否存在滥用"常规技术手段"的问题
4. 提供针对性的评述策略和法律依据
5. 准备对公知常识认定的反驳意见

请以JSON格式输出，包含以下字段：
- commonKnowledgeInstances: 公知常识表述汇总表
- evidenceAnalysis: 证据支持分析
- abuseAnalysis: 滥用问题分析
- responseStrategy: 评述策略
- legalBasis: 法律依据`,

      hindsight: `你是一个专业的专利创造性分析专家。请分析审查员评述中是否存在"事后诸葛亮"问题：

【审查意见内容】
${projectData.officeActionContent || '暂无'}

【本申请权利要求书】
${projectData.claimsContent || '暂无'}

【对比文件1内容】
${projectData.comparisonFileContents?.[0] || '暂无'}

【对比文件2内容】
${projectData.comparisonFileContents?.[1] || '暂无'}

请完成以下分析：
1. 梳理审查员从对比文件到本申请的推理逻辑
2. 分析审查员是否采用了"事后诸葛亮"的倒推方法
3. 从发明人视角还原正向研发过程
4. 分析审查员推理是否违背三步法原则
5. 准备对"事后诸葛亮"问题的评述意见

请以JSON格式输出，包含以下字段：
- examinerReasoning: 审查员推理过程分析
- hindsightDetection: 事后诸葛亮问题识别
- forwardDevelopmentProcess: 正向研发过程还原
- violationAnalysis: 违背三步法原则分析
- responseContent: 评述意见`,

      valueAnalysis: `你是一个专业的专利价值评估专家。请分析以下专利的社会价值和经济价值：

【本申请权利要求书】
${projectData.claimsContent || '暂无'}

【发明名称】
${projectData.inventionName || '未提供'}

请完成以下分析：
1. 分析本专利是否涉及卡脖子技术领域
2. 分析自主知识产权程度和核心技术自主可控情况
3. 分析是否有助于实现国产替代
4. 分析对企业出海战略的支撑作用
5. 分析是否有助于打破国外技术垄断
6. 评估市场竞争力提升和商业价值

请以JSON格式输出，包含以下字段：
- socialValue: 社会价值分析
- economicValue: 经济价值分析
- techBreakthrough: 技术突破分析
- domesticSubstitution: 国产替代分析
- marketCompetitive: 市场竞争力分析
- strategicValue: 战略价值评估`,

      writeResponse: `你是一个专业的专利代理师和审查意见答复专家。请基于以下所有分析结果，撰写正式的审查意见答复文件：

【案件基本信息】
- 案件编号：${projectData.caseNumber || ''}
- 申请号：${projectData.applicationNumber || ''}
- 发明名称：${projectData.inventionName || ''}
- 申请人：${projectData.applicant || ''}
- 发文日：${projectData.officeActionDate || ''}
- 答复期限：${projectData.deadline || ''}
- 审查员：${projectData.examinerName || ''}

【审查意见内容】
${projectData.officeActionContent || '暂无'}

【当前权利要求书】
${projectData.claimsContent || '暂无'}

【各步骤分析结果】
1. 技术特征对比分析：${projectData.featureComparison || '暂无'}
2. 最接近现有技术分析：${projectData.closestPriorArtAnalysis || '暂无'}
3. 区别技术特征分析：${projectData.distinguishingFeatures || '暂无'}
4. 公知常识评述：${projectData.commonKnowledgePoints || '暂无'}
5. 事后诸葛亮评述：${projectData.hindsightAnalysis || '暂无'}
6. 价值分析：${projectData.socialValue || '暂无'}

请完成以下任务：
1. 撰写正式的审查意见答复书（符合国知局格式要求）
2. 撰写意见陈述书正文，包含对所有驳回理由的反驳
3. 撰写修改说明（如需要修改权利要求书）
4. 生成修改后的权利要求书
5. 确保逻辑清晰、引用法律依据准确

请以JSON格式输出，包含以下字段：
- responseDocument: 审查意见答复书全文
- opinionStatement: 意见陈述书正文
- modificationDescription: 修改说明
- amendedClaims: 修改后的权利要求书
- legalReferences: 引用的法律依据`,
    };

    const prompt = prompts[step];
    if (!prompt) {
      return res.status(400).json({ error: '无效的步骤ID' });
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('[OfficeAction] AI API error:', errorData);
      return res.status(500).json({ error: 'AI分析失败', details: errorData.error });
    }

    const result = await response.json();
    const aiContent = result.choices?.[0]?.message?.content || '';

    let parsedResult;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)```/i);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[1].trim());
      } else {
        parsedResult = JSON.parse(aiContent);
      }
    } catch {
      parsedResult = { rawContent: aiContent };
    }

    res.json({
      success: true,
      data: parsedResult,
      rawContent: aiContent,
    });
  } catch (error) {
    console.error('[OfficeAction] Analyze error:', error);
    res.status(500).json({ error: '分析失败', details: error.message });
  }
}

export async function generateFeatureTable(req, res) {
  try {
    const { claimsContent, comparisonFileContents } = req.body;

    const prompt = `你是一个专业的专利技术特征分析专家。请基于以下信息生成技术特征对比表：

【本申请权利要求书】
${claimsContent || '暂无'}

【对比文件1】
${comparisonFileContents?.[0] || '暂无'}

【对比文件2】
${comparisonFileContents?.[1] || '暂无'}

请完成以下任务：
1. 对本申请独立权利要求进行详细的技术特征拆解
2. 对每个对比文件进行技术特征拆解
3. 创建详细的技术特征对比表
4. 分析每个特征的异同和差异点

输出格式要求：
- 本申请特征拆解：表格形式（特征编号、技术特征、特征类型、技术效果）
- 对比文件特征拆解：表格形式
- 特征对比表：表格形式（本申请特征、对比文件1对应特征、对比文件2对应特征、是否相同、差异分析）

请以JSON格式输出。`;

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      return res.status(500).json({ error: '生成特征对比表失败', details: errorData.error });
    }

    const result = await response.json();
    const aiContent = result.choices?.[0]?.message?.content || '';

    let parsedResult;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)```/i);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[1].trim());
      } else {
        parsedResult = JSON.parse(aiContent);
      }
    } catch {
      parsedResult = { rawContent: aiContent };
    }

    res.json({
      success: true,
      data: parsedResult,
      rawContent: aiContent,
    });
  } catch (error) {
    console.error('[OfficeAction] Feature table error:', error);
    res.status(500).json({ error: '生成特征对比表失败', details: error.message });
  }
}

export default {
  uploadOfficeActionFiles,
  analyzeOfficeAction,
  generateFeatureTable,
};