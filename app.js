(function () {
  "use strict";

  const data = window.LEARNING_DATA;
  if (!data || !Array.isArray(data.lessons)) {
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
    studentMeta: document.querySelector("#student-meta"),
    studentGoal: document.querySelector("#student-goal"),
    lessonCount: document.querySelector("#lesson-count"),
    latestDate: document.querySelector("#latest-date"),
    averageProgress: document.querySelector("#average-progress"),
    averageProgressBar: document.querySelector("#average-progress-bar"),
    searchInput: document.querySelector("#search-input"),
    subjectFilters: document.querySelector("#subject-filters"),
    resultCount: document.querySelector("#result-count"),
    recordList: document.querySelector("#record-list"),
    emptyState: document.querySelector("#empty-state"),
    footerName: document.querySelector("#footer-name"),
  };

  const sortedLessons = [...data.lessons].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  );

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(dateString, includeYear = true) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("zh-CN", {
      year: includeYear ? "numeric" : undefined,
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function getWeekday(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);
  }

  function initializeProfile() {
    const student = data.student;
    const average = sortedLessons.length
      ? Math.round(
          sortedLessons.reduce((sum, lesson) => sum + Number(lesson.progress || 0), 0) /
            sortedLessons.length,
        )
      : 0;

    document.title = `${student.name} · 学习记录`;
    elements.updateTime.textContent = `更新于 ${formatDate(data.lastUpdated, false)}`;
    elements.studentAvatar.textContent = student.name.slice(0, 1);
    elements.studentTitle.textContent = student.name;
    elements.studentMeta.textContent = `${student.grade} · ${student.subjects.join(" / ")}`;
    elements.studentGoal.textContent = student.goal;
    elements.lessonCount.innerHTML = `${sortedLessons.length}<small> 次</small>`;
    elements.latestDate.textContent = sortedLessons.length ? formatDate(sortedLessons[0].date, false) : "暂无";
    elements.averageProgress.innerHTML = `${average}<small>%</small>`;
    elements.averageProgressBar.style.width = `${average}%`;
    elements.footerName.textContent = data.siteName;
  }

  function initializeFilters() {
    const subjects = ["全部", ...new Set(sortedLessons.map((lesson) => lesson.subject))];
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

  function createRecordCard(lesson) {
    const progress = Math.min(100, Math.max(0, Number(lesson.progress) || 0));
    return `
      <article class="record-card">
        <div class="record-date">
          <strong>${escapeHtml(formatDate(lesson.date, false))}</strong>
          <span>${escapeHtml(getWeekday(lesson.date))}</span>
          <span class="subject-tag">${escapeHtml(lesson.subject)}</span>
        </div>
        <div class="record-body">
          <h3>${escapeHtml(lesson.content)}</h3>
          <div class="record-details">
            <div>
              <span class="detail-label">主要问题</span>
              <p class="detail-text">${escapeHtml(lesson.problem)}</p>
            </div>
            <div class="teacher-note">
              <span class="detail-label">老师评价</span>
              <p class="detail-text">${escapeHtml(lesson.evaluation)}</p>
            </div>
            <div>
              <span class="detail-label">解决进度</span>
              <div class="record-progress-row">
                <div class="progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
                <strong>${progress}%</strong>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderRecords() {
    const lessons = getFilteredLessons();
    elements.resultCount.textContent = `显示 ${lessons.length} 条记录`;
    elements.recordList.innerHTML = lessons.map(createRecordCard).join("");
    elements.emptyState.hidden = lessons.length > 0;
  }

  initializeProfile();
  initializeFilters();
  renderRecords();
})();
