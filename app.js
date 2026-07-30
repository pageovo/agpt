(function () {
  "use strict";

  const data = window.LEARNING_DATA;
  if (!data || !data.student || !Array.isArray(data.lessons)) {
    document.body.innerHTML = "<p style='padding:24px'>数据文件读取失败，请检查 data.js。</p>";
    return;
  }

  const MONTHS = [
    { year: 2026, month: 6 },
    { year: 2026, month: 7 },
  ];
  const SCHOOL_START_DATE = "2026-09-01";

  const WEEKDAY_EN = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const state = { monthIndex: 0, selectedDate: data.lastUpdated };
  const startDate = parseDate(data.student.startDate);
  const snapshotDate = parseDate(data.lastUpdated);
  const subjectOrder = new Map(data.student.subjects.map((subject, index) => [subject, index]));
  const lessonsByDate = groupLessons(data.lessons);
  const sortedLessons = [...data.lessons].sort((first, second) => {
    const dateDifference = parseDate(second.date) - parseDate(first.date);
    if (dateDifference !== 0) return dateDifference;
    return (subjectOrder.get(first.subject) ?? 99) - (subjectOrder.get(second.subject) ?? 99);
  });

  const elements = {
    brandName: document.querySelector("#brand-name"),
    updateTime: document.querySelector("#update-time"),
    countdownValue: document.querySelector("#countdown-value"),
    studentTitle: document.querySelector("#student-title"),
    studentGrade: document.querySelector("#student-grade"),
    studentSubjects: document.querySelector("#student-subjects"),
    studentStart: document.querySelector("#student-start"),
    studentGoal: document.querySelector("#student-goal"),
    studyDayCount: document.querySelector("#study-day-count"),
    lessonCount: document.querySelector("#lesson-count"),
    weekCount: document.querySelector("#week-count"),
    averageProgress: document.querySelector("#average-progress"),
    monthSwitch: document.querySelector("#month-switch"),
    calendarMonthLabel: document.querySelector("#calendar-month-label"),
    calendarMonthSummary: document.querySelector("#calendar-month-summary"),
    calendarGrid: document.querySelector("#calendar-grid"),
    selectedWeekday: document.querySelector("#selected-weekday"),
    selectedDate: document.querySelector("#selected-date"),
    selectedStatus: document.querySelector("#selected-status"),
    selectedContent: document.querySelector("#selected-content"),
    resultCount: document.querySelector("#result-count"),
    recordList: document.querySelector("#record-list"),
    footerName: document.querySelector("#footer-name"),
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function parseDate(dateString) {
    return new Date(`${dateString}T00:00:00`);
  }

  function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString, options = {}) {
    const date = parseDate(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: options.year ? "numeric" : undefined,
      month: "long",
      day: "numeric",
      weekday: options.weekday ? "long" : undefined,
    }).format(date);
  }

  function groupLessons(lessons) {
    return lessons.reduce((groups, lesson) => {
      if (!groups.has(lesson.date)) groups.set(lesson.date, []);
      groups.get(lesson.date).push(lesson);
      return groups;
    }, new Map());
  }

  function isPending(value) {
    return value === null || value === undefined || String(value).trim().toLowerCase() === "none" || String(value).trim() === "";
  }

  function getProgress(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return Math.min(100, Math.max(0, value));
  }

  function getDateStatus(dateString) {
    const date = parseDate(dateString);
    if (lessonsByDate.has(dateString)) return "attended";
    if (date.getDay() === 0 || date.getDay() === 6) return "rest";
    if (date < startDate) return "before";
    return "missed";
  }

  function getStatusLabel(status) {
    return { attended: "已上课", missed: "未上课", rest: "周末休息", before: "尚未开课" }[status];
  }

  function initializeProfile() {
    const uniqueDates = [...lessonsByDate.keys()];
    const validProgress = sortedLessons.map((lesson) => getProgress(lesson.progress)).filter((value) => value !== null);
    const average = validProgress.length
      ? Math.round(validProgress.reduce((total, value) => total + value, 0) / validProgress.length)
      : null;
    const weekStart = new Date(snapshotDate);
    const day = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - day + 1);
    const weekCount = uniqueDates.filter((dateString) => {
      const date = parseDate(dateString);
      return date >= weekStart && date <= snapshotDate;
    }).length;

    document.title = `${data.student.name} · 暑期学习记录`;
    elements.brandName.textContent = data.siteName;
    elements.updateTime.textContent = `更新于 ${formatDate(data.lastUpdated)}`;
    const countdownDays = Math.ceil((parseDate(SCHOOL_START_DATE) - snapshotDate) / 86400000);
    elements.countdownValue.textContent = countdownDays > 0 ? `${countdownDays}天` : "已开学";
    elements.studentTitle.textContent = `${data.student.name}的学习记录`;
    elements.studentGrade.textContent = data.student.grade;
    elements.studentSubjects.textContent = data.student.subjects.join(" · ");
    elements.studentStart.textContent = `${formatDate(data.student.startDate)}开始`;
    elements.studentGoal.textContent = data.student.goal;
    elements.studyDayCount.innerHTML = `${uniqueDates.length}<small> 天</small>`;
    elements.lessonCount.innerHTML = `${sortedLessons.length}<small> 节</small>`;
    elements.weekCount.innerHTML = `${weekCount}<small> 天</small>`;
    elements.averageProgress.innerHTML = average === null ? "待填写" : `${average}<small>%</small>`;
    elements.footerName.textContent = data.siteName;
  }

  function initializeMonthSwitch() {
    elements.monthSwitch.innerHTML = MONTHS.map(
      (item, index) => `<button type="button" data-month-index="${index}">${item.month + 1}月</button>`,
    ).join("");
    elements.monthSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-month-index]");
      if (!button) return;
      showMonth(Number(button.dataset.monthIndex));
    });
  }

  function showMonth(index) {
    state.monthIndex = (index + MONTHS.length) % MONTHS.length;
    const month = MONTHS[state.monthIndex];
    const selected = parseDate(state.selectedDate);
    if (selected.getFullYear() !== month.year || selected.getMonth() !== month.month) {
      const monthLessons = [...lessonsByDate.keys()]
        .filter((dateString) => {
          const date = parseDate(dateString);
          return date.getFullYear() === month.year && date.getMonth() === month.month;
        })
        .sort();
      state.selectedDate = monthLessons[monthLessons.length - 1] || toDateString(new Date(month.year, month.month, 1));
    }
    renderCalendar();
    renderSelectedDay();
  }

  function renderCalendar() {
    const { year, month } = MONTHS[state.monthIndex];
    const firstDate = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingCells = (firstDate.getDay() + 6) % 7;
    const attendedDays = [...lessonsByDate.keys()].filter((dateString) => {
      const date = parseDate(dateString);
      return date.getFullYear() === year && date.getMonth() === month;
    }).length;

    elements.calendarMonthLabel.textContent = `${year}年${month + 1}月`;
    elements.calendarMonthSummary.textContent = `${attendedDays} 个上课日 · ${attendedDays * data.student.subjects.length} 节记录`;
    elements.monthSwitch.querySelectorAll("button").forEach((button, index) => {
      button.classList.toggle("active", index === state.monthIndex);
      button.setAttribute("aria-pressed", String(index === state.monthIndex));
    });

    const cells = [];
    for (let index = 0; index < leadingCells; index += 1) {
      cells.push('<span class="calendar-cell empty" aria-hidden="true"></span>');
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const dateString = toDateString(date);
      const status = getDateStatus(dateString);
      const isSelected = dateString === state.selectedDate;
      const isSnapshot = dateString === data.lastUpdated;
      const shortLabel = status === "attended" ? `${lessonsByDate.get(dateString).length}节` : status === "rest" ? "休息" : status === "missed" ? "未上" : "";
      cells.push(`
        <button class="calendar-cell ${status}${isSelected ? " selected" : ""}${isSnapshot ? " snapshot" : ""}"
          type="button" role="gridcell" data-date="${dateString}"
          aria-label="${month + 1}月${day}日，${getStatusLabel(status)}" aria-selected="${isSelected}">
          <span class="cell-day">${day}</span>
          <span class="cell-label">${shortLabel}</span>
        </button>
      `);
    }
    const totalCells = Math.ceil((leadingCells + daysInMonth) / 7) * 7;
    while (cells.length < totalCells) {
      cells.push('<span class="calendar-cell empty" aria-hidden="true"></span>');
    }
    elements.calendarGrid.innerHTML = cells.join("");
    elements.calendarGrid.onclick = (event) => {
      const button = event.target.closest("button[data-date]");
      if (!button) return;
      state.selectedDate = button.dataset.date;
      renderCalendar();
      renderSelectedDay();
    };
  }

  function createProgress(progressValue) {
    const progress = getProgress(progressValue);
    if (progress === null) return '<span class="pending-value">待填写</span>';
    return `
      <div class="progress-row">
        <div class="progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
        <strong>${progress}%</strong>
      </div>
    `;
  }

  function createSelectedLesson(lesson) {
    const subjectClass = lesson.subject === "物理" ? "physics" : "math";
    return `
      <article class="selected-lesson ${subjectClass}">
        <div class="selected-subject-row">
          <span class="subject-badge"><i></i>${escapeHtml(lesson.subject)}</span>
          ${createProgress(lesson.progress)}
        </div>
        <h4>${isPending(lesson.content) ? '<span class="pending-value">待填写课程内容</span>' : escapeHtml(lesson.content)}</h4>
        <dl>
          <div><dt>需要巩固</dt><dd>${isPending(lesson.problem) ? '<span class="pending-value">待填写</span>' : escapeHtml(lesson.problem)}</dd></div>
          <div><dt>老师评价</dt><dd>${isPending(lesson.evaluation) ? '<span class="pending-value">待填写</span>' : escapeHtml(lesson.evaluation)}</dd></div>
        </dl>
      </article>
    `;
  }

  function renderSelectedDay() {
    const date = parseDate(state.selectedDate);
    const status = getDateStatus(state.selectedDate);
    const lessons = lessonsByDate.get(state.selectedDate) || [];
    elements.selectedWeekday.textContent = WEEKDAY_EN[date.getDay()];
    elements.selectedDate.textContent = formatDate(state.selectedDate);
    elements.selectedStatus.className = `day-status ${status}`;
    elements.selectedStatus.textContent = getStatusLabel(status);

    if (status === "attended") {
      elements.selectedContent.innerHTML = lessons.map(createSelectedLesson).join("");
      return;
    }

    const messages = {
      rest: ["今天休息", "周六、周日不安排课程，适当放松，也可以简单回顾本周内容。"],
      before: ["课程尚未开始", `暑期课程从${formatDate(data.student.startDate)}开始，这一天没有课程记录。`],
      missed: date > snapshotDate
        ? ["尚未上课", "这是后续学习日，完成课程后会在这里更新当天记录。"]
        : ["当天未上课", "这一天没有安排课程，日历中已单独标记。"],
    };
    const [title, description] = messages[status];
    elements.selectedContent.innerHTML = `
      <div class="no-lesson-state ${status}">
        <span class="state-symbol" aria-hidden="true">${status === "rest" ? "休" : "—"}</span>
        <strong>${title}</strong>
        <p>${description}</p>
      </div>
    `;
  }

  function createArchiveDay(dateString, lessons) {
    const date = parseDate(dateString);
    const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);
    return `
      <article class="archive-day">
        <header>
          <time datetime="${dateString}"><strong>${date.getDate()}</strong><span>${weekday}</span></time>
          <button type="button" data-open-date="${dateString}" aria-label="在日历查看${formatDate(dateString)}" title="在日历中查看">↑</button>
        </header>
        <div class="archive-lessons">
          ${lessons.map((lesson) => `
            <section class="archive-entry ${lesson.subject === "物理" ? "physics" : "math"}">
              <div class="archive-subject"><span class="subject-badge"><i></i>${escapeHtml(lesson.subject)}</span>${createProgress(lesson.progress)}</div>
              <h3>${isPending(lesson.content) ? '<span class="pending-value">待填写课程内容</span>' : escapeHtml(lesson.content)}</h3>
              <p><span>课堂观察</span>${isPending(lesson.evaluation) ? '<span class="pending-value">待填写</span>' : escapeHtml(lesson.evaluation)}</p>
            </section>
          `).join("")}
        </div>
      </article>
    `;
  }

  function renderArchive() {
    const groups = groupLessons(sortedLessons);
    elements.resultCount.textContent = `${groups.size} 个上课日 · ${sortedLessons.length} 节课程`;
    elements.recordList.innerHTML = [...groups.entries()].map(([dateString, lessons]) => createArchiveDay(dateString, lessons)).join("");
    elements.recordList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-open-date]");
      if (!button) return;
      state.selectedDate = button.dataset.openDate;
      const date = parseDate(state.selectedDate);
      const monthIndex = MONTHS.findIndex((item) => item.year === date.getFullYear() && item.month === date.getMonth());
      if (monthIndex >= 0) state.monthIndex = monthIndex;
      renderCalendar();
      renderSelectedDay();
      document.querySelector("#calendar-heading").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  initializeProfile();
  initializeMonthSwitch();
  const initialMonthIndex = MONTHS.findIndex((item) => item.year === snapshotDate.getFullYear() && item.month === snapshotDate.getMonth());
  showMonth(initialMonthIndex >= 0 ? initialMonthIndex : 0);
  renderArchive();
})();
