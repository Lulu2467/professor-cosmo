# Gunther M. Roland · COSMO Academic Space  
## 产品手册（Product Manual）

| 项 | 内容 |
|---|---|
| 产品名 | Gunther M. Roland — SYMBION · COSMO Academic Space |
| 形态 | 静态高保真产品原型（HTML/CSS/JS，无后端） |
| 目标用户 | 学生、教授本人、研究协作者、平台侧 PM/设计/工程 |
| 文档用途 | 对齐现状能力、优先级、边界与下一阶段建设 |
| 版本基准 | `roland-cosmo/` 当前实现（2026-09） |
| UI 文案语言 | 英文（界面）；本手册中文 |

---

## 1. 产品定义（一句话）

面向物理教师个人的 **学术空间**：对外展示身份与研究；对内承接 **上课路径（Class）** 与 **教学数字人（Digital Twin）**；另有独立的 **研究工作台（Research · Citta）**。

**不是：** LMS、通用 Chatbot、MIT 官方站、真人教授本人。

---

## 2. 问题与价值

| 用户 | 今天的痛点 | 本产品提供 |
|---|---|---|
| 学生 | 课程材料分散；问不到人；答疑缺少出处 | Class 入口 + Twin 带证据/决策的答疑 |
| 教授 | 重复答疑；决策无法沉淀；身份易被冒用 | Professor desk、决策确认、表情包反馈、AI 披露 |
| 协作者 | 研究过程与版本散落 | Project + Citta + 路径化产出检视 |
| 平台 | Cosmo / Citta 能力难讲清 | 可演示的教学/研究双场景样板 |

**核心主张**

1. **空间，不是聊天框** — 教学与研究分轨，各有工作台。  
2. **披露优先** — Twin = Simulated AI；Research Citta ≠ Teaching Twin。  
3. **证据可追溯** — Evidence / Decision / Sources / Project record。  
4. **原型诚实** — 未接通的能力明确 toast：`Prototype only`。

---

## 3. 信息架构（锁定）

```
顶栏（全局）
├── Home
├── Enter Class
└── Research

Enter Class
├── Gate：Class | Digital Twin
├── Class → Online | Onsite → Class desk
└── Digital Twin → Professor desk | Student view

Research
├── Projects overview
└── Project workbench（Rail · Citta · Inspector）
```

**硬规则**

| # | 规则 |
|---|---|
| 1 | 顶栏永远是 Home / Enter Class / Research |
| 2 | Enter Class 先选 Class 或 Twin，再进入子流 |
| 3 | Class 的 Online/Onsite 工作室 **不再重复** Twin 入口 |
| 4 | Teaching Twin ≠ Research Citta |
| 5 | Twin 永远标注 Simulated AI，不得伪装成教授本人 |

---

## 4. 用户角色与场景

| 角色 | 主入口 | 典型任务 |
|---|---|---|
| 访客 / 招生向学生 | Home | 了解教授、研究、课程 |
| 选课学生 | Enter Class → Class | Online/Onsite、进入会话信息 |
| 答疑学生 | Enter Class → Twin · Student | 提问、看证据与决策 |
| 教授 | Twin · Professor desk | 审线程、确认决策、发贴纸回复 |
| 研究协作者 | Research | 打开 Project、与 Citta 协作、检视产出 |

**深链**

| URL | 行为 |
|---|---|
| `class.html` | Gate |
| `class.html?branch=class` | Class studio |
| `class.html?branch=twin` | Twin（默认 Professor） |
| `class.html?branch=twin&role=student` | Twin Student view |
| `research.html?project=pendulum` | Pendulum workbench |

---

## 5. 功能清单与优先级

### 优先级定义

| 级 | 含义 | 产品动作 |
|---|---|---|
| **P0** | 叙事/演示必须成立；去掉则产品立不住 | 必须可用、可演示 |
| **P1** | 强化可信度与工作闭环 | 当前原型应具备；下一阶段产品化 |
| **P2** | 体验与差异化 | 可迭代；不阻塞主路径 |
| **P3** | 占位 / 示意 | 标明边界，勿当已交付 |

---

### 5.1 Home（`index.html`）— 公共学术主页

| 功能 | 说明 | 优先级 | 现状 |
|---|---|---|---|
| 身份英雄区 | 姓名、职称、简介、FOCUS/FIELD | P0 | ✅ |
| 粒子肖像场 | 肖像 + 轨道粒子（主页专用视觉） | P1 | ✅ |
| Class / Research 双门 | `Enter class` / `Research hub` | P0 | ✅ |
| Research 摘要 | 主题卡 + 精选研究卡 | P1 | ✅ |
| Teaching 摘要 | Junior Lab 介绍与跳转 | P1 | ✅ |
| Publications | 三条 MIT 官方链出论文 | P1 | ✅ |
| Twin 预告卡 | 披露文案 + 进 Twin | P0 | ✅ |
| 页内 Course Companion 抽屉 | 本地确定性答疑 Demo | P2 | ✅ 原型 |
| 来源与免责声明 | MIT 来源列表 + 非官方说明 | P0 | ✅ |
| 玻璃顶栏 + 头像品牌 | 与 Hub 统一导航 | P1 | ✅ |

---

### 5.2 Enter Class · Gate（`class.html`）

| 功能 | 说明 | 优先级 | 现状 |
|---|---|---|---|
| Class / Twin 双卡选择 | Knowledge vs Intelligence | P0 | ✅ |
| Class 卡知识轨道视觉 | 交叉椭圆 + Physics/Data/Notebook 玻璃芯片 | P2 | ✅ |
| Twin 卡人物立绘 | Q 版 figure + 身份芯片 + Simulated AI | P1 | ✅ |
| 底部 Rail | 01 Knowledge / 02 Intelligence | P2 | ✅ |
| 深链 `?branch=` | 直达 Class / Twin | P1 | ✅ |

---

### 5.3 Class 路径（上课）

| 功能 | 说明 | 优先级 | 现状 |
|---|---|---|---|
| Online / Onsite 选择 | 会议形态分流 | P0 | ✅ |
| Online / Onsite 卡片 | 文案 + CTA（仅底部箭头） | P0 | ✅ |
| Upcoming / Next onsite / Class info | 右侧会话信息 | P1 | ✅ |
| Class desk | 下一场次条 + 班级列表 | P1 | ✅ 示意 |
| 进入房间 / Open link | 真实上课工具 | P0（产品） | ⚠️ Toast 占位 |
| 考勤 / 录像 / 材料库 | LMS 能力 | P1（产品） | ❌ 未建 |
| 日历同步 | 外部日历 | P2 | ❌ |

**步骤条：** `01 Type` → `02 Session`（Session 多为 pending 示意）

---

### 5.4 Digital Twin（教学数字人）

#### 结构

| 区域 | Professor desk | Student view |
|---|---|---|
| 左栏 | Student threads（active / resolved） | 隐藏 |
| 中栏 | 披露 + 对话 + Evidence/Decision + Composer | 同左，无贴纸托盘 |
| 右栏 | Student / Course context / Sources / Twin profile | 无 Student 卡 |

#### 功能表

| 功能 | 说明 | 优先级 | 现状 |
|---|---|---|---|
| AI Disclosure | 每会话顶部披露 Simulated AI | P0 | ✅ |
| Thread 列表切换 | 多学生问题线程 | P0 | ✅ |
| Twin 回答 | 结构化教学回复 | P0 | ✅ 脚本内容 |
| Evidence 卡 | 课程出处 + View source | P0 | ✅ 示意 |
| Decision 卡 | 决策 + 状态旗 + Confirm | P0 | ✅ 本地态 |
| Professor 确认气泡 | 确认后写入线程 | P0 | ✅ |
| Professor / Student 角色切换 | 双视角同屏演示 | P0 | ✅ |
| Composer 文本发送 | 本地插入消息 | P1 | ✅ 内存 |
| 表情包托盘（6 枚） | Thinking / Great / On it / Awesome / Hmm / Take your time | P1 | ✅ 教授端 |
| Course context | 课程条目跳转示意（箭头统一 →） | P1 | ✅ |
| Sources（3） | 引用列表 | P0 | ✅ |
| Twin 侧栏档案 | 头像 + 专长 + View profile | P1 | ✅ 示意 |
| 真实模型推理 / 检索 | 接 LLM + RAG | P0（产品） | ❌ |
| 持久化 / 多用户 | 账号与存储 | P0（产品） | ❌ 仅本页内存 |
| Thread 筛选 | Filter 按钮 | P2 | ⚠️ Toast |
| 在线状态绿点 | Presence | — | ❌ 明确不做 |

---

### 5.5 Research（`research.html`）— 研究工作台

| 功能 | 说明 | 优先级 | 现状 |
|---|---|---|---|
| Projects 总览 | Active + Recent activity | P0 | ✅ |
| Pendulum 可进工作台 | 唯一完整可点项目 | P0 | ✅ |
| 其他项目卡 | Implementability 示例，不可进 | P3 | ✅ 标明 |
| New Project | 新建 | P1（产品） | ⚠️ Toast |
| 左 Rail 路径 | Paper / Code / Run / Figure / Doc / Record / Matrix | P0 | ✅ |
| 中栏 Citta | 研究协作者对话（≠ Twin） | P0 | ✅ 示意 |
| 右 Inspector | 产出检视、版本、图表概念 | P0 | ✅ 示意 |
| 版本对比 / 图表交互 | 数据科学闭环 | P1（产品） | ⚠️ 示意/边界文案 |
| CSV 真数据 | 真实分析 | P0（产品） | ❌ `No CSV supplied` |
| 真 Citta Agent | 工具调用、写回 Project | P0（产品） | ❌ |

---

### 5.6 跨表面能力

| 功能 | 优先级 | 现状 |
|---|---|---|
| 统一玻璃顶栏 + 头像品牌 | P1 | ✅ |
| 响应式（~900 / ~820） | P1 | ✅ 基础 |
| Toast 原型边界提示 | P0 | ✅ |
| Reduced motion | P2 | ✅ 部分 |
| 登录 / 权限 / 计费 | P0（上线） | ❌ |
| 分析埋点 | P2 | ❌ |
| i18n 中文界面 | P3 | ❌ 锁定英文 UI |

---

## 6. 关键用户旅程

### 6.1 学生上课

`Home → Enter class → Class → Online/Onsite → Class desk →（目标）进会`

当前断点：进会为 Prototype toast。

### 6.2 学生问 Twin

`Home Twin 卡 / Gate Twin → Student view → 提问 → 读 Evidence/Decision`

当前：脚本线程；发送仅本地。

### 6.3 教授处理答疑

`Gate Twin → Professor desk → 选线程 → Confirm decision →（可选）贴纸/文字`

当前：确认与贴纸本地；无落库。

### 6.4 研究协作

`Research → Pendulum → Rail 切路径 ↔ Citta ↔ Inspector`

当前：演示闭环；非真实 Agent。

---

## 7. 对象模型（产品层）

| 对象 | 归属 | 关键字段（概念） |
|---|---|---|
| Professor Space | 全局 | 身份、顶栏、披露规则 |
| Class Offering | Class | mode(online/onsite)、时间、地点/链接 |
| Session | Class | 下一场次、进入动作 |
| Twin Thread | Twin | student、question、status、messages |
| Evidence | Twin | title、meta、source link |
| Decision | Twin | title、reason、flags、confirmed |
| Sticker | Twin | id、asset、professor-only |
| Project | Research | id、status、paths、activity |
| Artifact | Research | paper/code/run/figure/doc/record |
| Citta Turn | Research | 协作消息（非 Twin） |

---

## 8. AI 系统边界（必须对外一致）

| 智能体 | 场景 | 定位 | 披露 |
|---|---|---|---|
| **Digital Twin** | 教学答疑 | 教授知识的模拟教学助手 | 每会话披露；非本人、非 MIT |
| **Citta** | 研究工作台 | 研究协作者 / 工作助手 | 研究语境；≠ Twin |
| **Course Companion**（Home 抽屉） | 营销向 Demo | 本地规则回复 | 合成 AI 文案 |

**禁止**

- Twin 显示“教授在线/绿点”  
- Twin 与 Citta 共用同一人格文案  
- 无出处的课程结论当权威  

---

## 9. 当前原型能力矩阵

| 能力层 | Home | Class | Twin | Research |
|---|---|---|---|---|
| 信息展示 | ✅ | ✅ | ✅ | ✅ |
| 导航/分流 | ✅ | ✅ | ✅ | ✅ |
| 本地交互态 | 部分 | 部分 | ✅ 线程/决策/贴纸 | ✅ pane 切换 |
| 真实数据 | MIT 链出 | ❌ | ❌ | ❌ CSV |
| 模型/Agent | Demo 规则 | — | ❌ | ❌ |
| 账号与持久化 | ❌ | ❌ | ❌ | ❌ |
| 生产集成（Zoom 等） | — | ❌ | — | — |

**一句话现状：** 可演示的端到端 **产品叙事原型**；非可上线教学/研究系统。

---

## 10. 建设路线（建议）

### Phase A — 叙事冻结（已完成主轴）

- [x] IA：Home / Class / Twin / Research  
- [x] Twin 披露 + Evidence/Decision  
- [x] Class 与 Twin 入口去重  
- [x] Research Project 工作台壳  
- [x] 视觉与资产（玻璃顶栏、头像、表情包、轨道）

### Phase B — 教学闭环可试用（下一步 P0）

1. Twin 接检索（课程材料）+ LLM，保留 Evidence 结构  
2. Decision Confirm 落库；教授端线程真实化  
3. Class Online 接真实会议链（或日历深链）  
4. 学生身份（至少 demo 账号）

### Phase C — 研究闭环

1. Project 真文件/版本  
2. Citta 工具调用写回 Artifact  
3. Pendulum 类任务可复现跑数  

### Phase D — 平台化

权限、多 Cosmo 模板、审核、计量、内容安全。

---

## 11. 成功指标（上线后）

| 指标 | 定义 | 阶段 |
|---|---|---|
| Gate 分流清晰度 | Class vs Twin 点击占比符合预期、少回退 | B |
| Twin 有证据回复率 | 含 Evidence 的回复 / 总回复 | B |
| 教授确认率 | Confirm / 出示 Decision | B |
| 学生二次提问率 | 同线程 follow-up | B |
| 披露可见性 | Disclosure 曝光且无“真人教授”投诉 | 全程 |
| Research 路径完成 | 打开 Project 并切换 ≥3 个 path | C |

---

## 12. 风险与合规

| 风险 | 等级 | 缓解 |
|---|---|---|
| 被当成教授本人 | 高 | 强制披露；禁止 presence；文案锁定 |
| 被当成 MIT 官方 | 高 | Sources / 页脚非官方声明 |
| 幻觉教学建议 | 高 | Evidence 强制；关键决策需教授确认 |
| 学生隐私 | 中 | 原型无共享存储；上线需隔离与同意 |
| 版权材料 | 中 | 仅链出/授权课程源 |

---

## 13. 功能优先级总表（执行用）

### 立刻保住（P0 · 已有叙事）

1. 三栏 IA 与 Class/Twin 分流  
2. Twin 披露 + Evidence + Decision  
3. Professor / Student 双视角  
4. Research Project 壳与 Citta 分轨说明  
5. 非官方 / 来源声明  

### 下一迭代必做（P0/P1 · 产品化）

1. Twin RAG + 模型  
2. 决策与线程持久化  
3. Class 真实进会  
4. 基础账号  
5. Citta 真工具链（可晚于 Twin）  

### 体验增强（P2）

表情包扩展、轨道/动效、Companion 抽屉、筛选、埋点、无障碍增强。

### 明确延后 / 示意（P3）

不可进的 Research 示例卡、New Project toast、Filter/View profile toast、无 CSV 的图表概念。

---

## 14. 文件与模块对照

| 路径 | 职责 |
|---|---|
| `index.html` + `styles.css` + `particle-field.js` + `app.js` | 公共主页 |
| `class.html` + `class.js` + `hub.css` | Enter Class / Twin |
| `research.html` + `research.js` + `hub.css` | Research |
| `assets/roland-twin/` | Twin 头像、立绘、表情包 |
| `assets/gunther-roland-supplied.jpg` | 主页粒子肖像源图 |
| `DESIGN_SYSTEM.md` | 视觉与实现约束 |
| `SOURCES.md` | MIT 来源与肖像 provenance |
| `PRODUCT_MANUAL.md` | 本手册 |

---

## 15. 给研发 / 设计的验收清单

**每次改动后至少确认：**

- [ ] 顶栏三项未改名、未增第四项  
- [ ] Class studio 未再次塞入 Twin 大卡  
- [ ] Twin 页有 AI Disclosure  
- [ ] Teaching Twin 文案未出现在 Research Citta  
- [ ] 未使用高饱和电光蓝 / 未加“在线绿点”  
- [ ] 原型未接能力仍走 Toast，不装成已上线  
- [ ] 界面英文；出版物/来源外链可用  

---

## 16. 总结

| 维度 | 结论 |
|---|---|
| 产品类型 | 教师 Cosmo 学术空间（教学 + 研究双轨）样板 |
| 已验证 | IA、披露模型、Twin 工作台叙事、Class 分流、Research 壳 |
| 未验证 | 真实智能、真实开课、真实数据与账号 |
| 最近优先 | Twin 检索+模型+持久化；Class 真进会；账号最小集 |

**产品一句话路线：**  
先把 **可披露、有证据的教学 Twin** 做成可用；再把 **Class 进会** 接实；研究 Citta 作为第二条增长曲线，不与 Twin 人格混用。
