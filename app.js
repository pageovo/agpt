(function () {
  "use strict";

  const data = window.LEARNING_DATA;
  if (!data || !data.student || !Array.isArray(data.lessons)) {
    document.body.innerHTML = "<p style='padding:24px'>数据文件读取失败，请检查 data.js。</p>";
    return;
  }

  const state = {
    subject: "全部",
    keyword: "",
  };

  const elements = {
    updateTime: document.querySelector("#update-time"),
    studentAvatar: document.querySelector("#student-avatar"),
    studentTitle: document.querySelector("#student-title"),
    studentGrade: document.querySelector("#student-grade"),
    studentSubjects: document.querySelector("#student-subjects"),
    studentStart: document.querySelector("#student-start"),
    studentGoal: document.querySelector("#student-goal"),
    studyDayCount: document.querySelector("#study-day-count"),
    lessonCount: document.querySelector("#lesson-count"),
    latestDate: document.querySelector("#latest-date"),
    averageProgress: document.querySelector("#average-progress"),
    searchInput: document.querySelector("#search-input"),
    subjectFilters: document.querySelector("#subject-filters"),
    resultCount: document.querySelector("#result-count"),
    recordList: document.querySelector("#record-list"),
    emptyState: document.querySelector("#empty-state"),
    footerName: document.querySelector("#footer-name"),
  };

  const subjectOrder = new Map(data.student.subjects.map((subject, index) => [subject, index]));
  const sortedLessons = [...data.lessons].sort((first, second) => {
    const dateDifference = new Date(second.date) - new Date(first.date);
    if (dateDifference !== 0) return dateDifference;
    return (subjectOrder.get(first.subject) ?? 99) - (subjectOrder.get(second.subject) ?? 99);
  });

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isPending(value) {
    return value === null || value === undefined || String(value).trim().toLowerCase() === "none" || String(value).trim() === "";
  }

  function getProgress(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return Math.min(100, Math.max(0, value));
  }

  function displayValue(value) {
    return isPending(value)
      ? '<span class="pending-value">待填写</span>'
      : escapeHtml(value);
  }

  function parseDate(dateString) {
    return new Date(`${dateString}T00:00:00`);
  }

  function formatDate(dateString, includeYear = false) {
    const date = parseDate(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("zh-CN", {
      year: includeYear ? "numeric" : undefined,
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function getWeekday(dateString) {
    const date = parseDate(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);
  }

  function getGroupedLessons(lessons) {
    return lessons.reduce((groups, lesson) => {
      if (!groups.has(lesson.date)) groups.set(lesson.date, []);
      groups.get(lesson.date).push(lesson);
      return groups;
    }, new Map());
  }

  function initializeProfile() {
    const student = data.student;
    const uniqueDates = new Set(sortedLessons.map((lesson) => lesson.date));
    const validProgress = sortedLessons
      .map((lesson) => getProgress(lesson.progress))
      .filter((progress) => progress !== null);
    const average = validProgress.length
      ? Math.round(validProgress.reduce((sum, progress) => sum + progress, 0) / validProgress.length)
      : null;

    document.title = `${student.name} · 学习记录`;
    elements.updateTime.textContent = `更新于 ${formatDate(data.lastUpdated)}`;
    elements.studentAvatar.textContent = student.name.slice(0, 1);
    elements.studentTitle.textContent = student.name;
    elements.studentGrade.textContent = student.grade;
    elements.studentSubjects.textContent = student.subjects.join(" · ");
    elements.studentStart.textContent = `${formatDate(student.startDate)}开始`;
    elements.studentGoal.textContent = student.goal;
    elements.studyDayCount.innerHTML = `${uniqueDates.size}<small> 天</small>`;
    elements.lessonCount.innerHTML = `${sortedLessons.length}<small> 条</small>`;
    elements.latestDate.textContent = sortedLessons.length ? formatDate(sortedLessons[0].date) : "暂无";
    elements.averageProgress.innerHTML = average === null ? "待填写" : `${average}<small>%</small>`;
    elements.footerName.textContent = data.siteName;
  }

  function initializeFilters() {
    const subjects = ["全部", ...data.student.subjects];
    elements.subjectFilters.innerHTML = subjects
      .map(
        (subject) =>
          `<button class="filter-button${subject === state.subject ? " active" : ""}" type="button" data-subject="${escapeHtml(subject)}">${escapeHtml(subject)}</button>`,
      )
      .join("");

    elements.subjectFilters.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-subject]");
      if (!button) return;
      state.subject = button.dataset.subject;
      elements.subjectFilters.querySelectorAll("button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderRecords();
    });

    elements.searchInput.addEventListener("input", (event) => {
      state.keyword = event.target.value.trim().toLowerCase();
      renderRecords();
    });
  }

  function getFilteredLessons() {
    return sortedLessons.filter((lesson) => {
      const matchesSubject = state.subject === "全部" || lesson.subject === state.subject;
      const searchableText = [lesson.content, lesson.problem, lesson.evaluation, lesson.subject]
        .join(" ")
        .toLowerCase();
      return matchesSubject && searchableText.includes(state.keyword);
    });
  }

  function createProgress(progressValue) {
    const progress = getProgress(progressValue);
    if (progress === null) {
      return '<span class="pending-value">待填写</span>';
    }

    return `
      <div class="record-progress-row">
        <div class="progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
        <strong>${progress}%</strong>
      </div>
    `;
  }

  function createSubjectEntry(lesson) {
    const subjectClass = lesson.subject === "物理" ? "subject-physics" : "subject-math";
    return `
      <section class="subject-entry ${subjectClass}" aria-label="${escapeHtml(lesson.subject)}课程记录">
        <div class="subject-heading">
          <span class="subject-name"><i aria-hidden="true"></i>${escapeHtml(lesson.subject)}</span>
          <span class="entry-state">${isPending(lesson.content) ? "待完善" : "已记录"}</span>
        </div>
        <div class="lesson-content">
          <span class="detail-label">上课内容</span>
          <h3>${displayValue(lesson.content)}</h3>
        </div>
        <div class="record-details">
          <div>
            <span class="detail-label">主要问题</span>
            <p>${displayValue(lesson.problem)}</p>
          </div>
          <div>
            <span class="detail-label">解决进度</span>
            ${createProgress(lesson.progress)}
          </div>
          <div class="teacher-note">
            <span class="detail-label">老师评价</span>
            <p>${displayValue(lesson.evaluation)}</p>
          </div>
        </div>
      </section>
    `;
  }

  function createDayCard(date, lessons) {
    return `
      <article class="day-card">
        <header class="day-header">
          <div class="date-day">${escapeHtml(parseDate(date).getDate())}</div>
          <div>
            <strong>${escapeHtml(formatDate(date))}</strong>
            <span>${escapeHtml(getWeekday(date))}</span>
          </div>
        </header>
        <div class="day-lessons">
          ${lessons.map(createSubjectEntry).join("")}
        </div>
      </article>
    `;
  }

  function renderRecords() {
    const lessons = getFilteredLessons();
    const groups = getGroupedLessons(lessons);
    elements.resultCount.textContent = `${groups.size} 个上课日 · ${lessons.length} 条记录`;
    elements.recordList.innerHTML = [...groups.entries()]
      .map(([date, dayLessons]) => createDayCard(date, dayLessons))
      .join("");
    elements.emptyState.hidden = lessons.length > 0;
  }

  initializeProfile();
  initializeFilters();
  renderRecords();
})();
