# 家教学习记录网站

这是一个不需要数据库、可以免费部署到 GitHub Pages 的静态网站。

## 本地查看

直接双击 `index.html`，浏览器就能打开。因为数据通过 `data.js` 载入，不需要安装开发环境。

## 每次课后如何更新

打开 `data.js`，在 `lessons: [` 的下一行粘贴一条新记录：

```js
{
  date: "2026-08-01",
  subject: "数学",
  content: "今天讲了什么",
  problem: "学生目前的主要问题",
  progress: 70,
  evaluation: "老师对本节课表现和后续安排的评价",
},
```

注意：

- 最新记录放最上面，最后的英文逗号不要漏掉。
- 日期固定写成 `年-月-日`，例如 `2026-08-01`。
- 进度只填 `0` 到 `100` 的数字，不加百分号。
- 同时把文件顶部的 `lastUpdated` 改成当天日期。
- 保存后重新打开或刷新网页检查内容。

## 发布到 GitHub Pages

电脑目前还没有识别到 Git 命令。第一次操作建议使用 GitHub Desktop：

1. 注册并登录 [GitHub](https://github.com/)。
2. 安装 [GitHub Desktop](https://desktop.github.com/)，登录同一个账号。
3. 在 GitHub Desktop 中选择 **File → Add local repository**，目录选择本项目文件夹。
4. 如果提示不是仓库，点击 **create a repository**。仓库名可填 `learning-report`。
5. 在左下角 Summary 填 `创建学习记录网站`，点击 **Commit to main**。
6. 点击顶部 **Publish repository**。如果使用免费 GitHub Pages，不要勾选 `Keep this code private`。
7. 浏览器进入该 GitHub 仓库，打开 **Settings → Pages**。
8. 在 **Build and deployment** 中选择 `Deploy from a branch`，分支选择 `main` 和 `/ (root)`，点击 **Save**。
9. 等待一两分钟，Pages 页面会显示网站地址，通常是 `https://你的用户名.github.io/learning-report/`。

以后每次更新只需修改 `data.js`，然后在 GitHub Desktop 里填写本次说明，依次点击 **Commit to main** 和 **Push origin**。网站通常会在一两分钟后自动更新。

也可以不打开 VS Code，直接在 GitHub 网页更新：进入仓库，点开 `data.js`，点击右上角铅笔图标，添加记录后点击 **Commit changes**。这个方法在手机浏览器里也能用，但提交前要仔细检查逗号、引号和日期格式。

目前选择 `data.js` 而不是 Excel 或 Word，是因为静态网页能直接读取它，格式也足够简单。等记录较多、学生人数增加后，再升级为在线表格或带登录的后台会更合适。

## 隐私提醒

免费 GitHub Pages 网站和公开仓库里的内容任何人都可能看到。请只使用“林同学”这样的称呼，不要上传真实姓名、学校、电话、住址、成绩单照片等敏感信息。如果必须限制访问，需要改用带登录和权限控制的服务，不能仅依靠“网址不告诉别人”。
