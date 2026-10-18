const memberSelect = document.getElementById("member-select");
const daySelect = document.getElementById("day-select");
const timeSelect = document.getElementById("time-select");
const memberResult = document.getElementById("member-result");
const timeResult = document.getElementById("time-result");
const table = document.getElementById("availability-table");

const { members, days, times } = AVAILABILITY_DATA;

document.getElementById("member-count").textContent = members.length;

const normalize = (value) => (value || "").toLocaleLowerCase("tr-TR").trim();
const initials = (name) => name.split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toLocaleUpperCase("tr-TR");

members
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "tr"))
  .forEach(member => {
    const option = document.createElement("option");
    option.value = member.name;
    option.textContent = member.name;
    memberSelect.appendChild(option);
  });

days.forEach(day => {
  const option = document.createElement("option");
  option.value = day;
  option.textContent = day;
  daySelect.appendChild(option);
});

times.forEach(time => {
  const option = document.createElement("option");
  option.value = time;
  option.textContent = time;
  timeSelect.appendChild(option);
});

function setEmpty(target, icon, title, message) {
  target.className = "result-box empty-state";
  target.replaceChildren();
  const iconEl = document.createElement("span");
  iconEl.className = "empty-icon";
  iconEl.textContent = icon;
  const strong = document.createElement("strong");
  strong.textContent = title;
  const p = document.createElement("p");
  p.textContent = message;
  target.append(iconEl, strong, p);
}

function showMemberAvailability() {
  const selectedName = memberSelect.value;
  if (!selectedName) {
    setEmpty(memberResult, "⌕", "Bir üye seçin", "Seçtiğiniz kişinin müsait gün ve saatleri burada listelenecek.");
    return;
  }

  const member = members.find(item => item.name === selectedName);
  const available = [];
  times.forEach(time => {
    (member.availability[time] || []).forEach(day => {
      let entry = available.find(item => item.day === day);
      if (!entry) {
        entry = { day, times: [] };
        available.push(entry);
      }
      entry.times.push(time);
    });
  });
  available.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));

  memberResult.className = "result-box";
  memberResult.replaceChildren();
  const title = document.createElement("div");
  title.className = "result-title";
  const name = document.createElement("strong");
  name.textContent = member.name;
  const count = document.createElement("span");
  count.className = "count-pill";
  count.textContent = `${available.length} müsait gün`;
  title.append(name, count);
  memberResult.appendChild(title);

  if (!available.length) {
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "Bu üye için işaretlenmiş bir müsaitlik bulunamadı.";
    memberResult.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "availability-list";
  available.forEach(entry => {
    const row = document.createElement("div");
    row.className = "day-row";
    const top = document.createElement("div");
    top.className = "day-row-top";
    const day = document.createElement("strong");
    day.textContent = entry.day;
    const count = document.createElement("span");
    count.textContent = `${entry.times.length} saat aralığı`;
    top.append(day, count);
    const chips = document.createElement("div");
    chips.className = "chips";
    entry.times.forEach(time => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = time;
      chips.appendChild(chip);
    });
    row.append(top, chips);
    list.appendChild(row);
  });
  memberResult.appendChild(list);
}

function showTimeAvailability() {
  const day = daySelect.value;
  const time = timeSelect.value;
  if (!day || !time) {
    setEmpty(timeResult, "◷", "Gün ve saat seçin", "Bu zaman aralığında müsait olan üyeler görüntülenecek.");
    return;
  }

  const availableMembers = members.filter(member => (member.availability[time] || []).includes(day));
  timeResult.className = "result-box";
  timeResult.replaceChildren();

  const title = document.createElement("div");
  title.className = "result-title";
  const heading = document.createElement("strong");
  heading.textContent = `${day} · ${time}`;
  const count = document.createElement("span");
  count.className = "count-pill";
  count.textContent = `${availableMembers.length} müsait üye`;
  title.append(heading, count);
  timeResult.appendChild(title);

  if (!availableMembers.length) {
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "Bu gün ve saat aralığında müsait olduğunu belirten üye yok.";
    timeResult.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "availability-list";
  availableMembers
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
    .forEach(member => {
      const item = document.createElement("div");
      item.className = "member-item";
      const avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.textContent = initials(member.name);
      const info = document.createElement("div");
      info.className = "member-info";
      const name = document.createElement("strong");
      name.textContent = member.name;
      const role = document.createElement("small");
      role.textContent = member.role && member.role !== "nan" ? member.role : "Topluluk üyesi";
      info.append(name, role);
      item.append(avatar, info);
      list.appendChild(item);
    });
  timeResult.appendChild(list);
}

function buildTable() {
  const theadRow = table.querySelector("thead tr");
  times.forEach(time => {
    const th = document.createElement("th");
    th.textContent = time;
    theadRow.appendChild(th);
  });

  const tbody = table.querySelector("tbody");
  days.forEach(day => {
    const row = document.createElement("tr");
    const dayHeader = document.createElement("th");
    dayHeader.scope = "row";
    dayHeader.textContent = day;
    row.appendChild(dayHeader);

    times.forEach(time => {
      const cell = document.createElement("td");
      const availableCount = members.filter(member => (member.availability[time] || []).includes(day)).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `slot-button${availableCount ? "" : " none"}`;
      button.textContent = availableCount ? `${availableCount} üye` : "—";
      button.disabled = !availableCount;
      button.setAttribute("aria-label", `${day}, ${time}: ${availableCount} müsait üye`);
      button.addEventListener("click", () => {
        daySelect.value = day;
        timeSelect.value = time;
        showTimeAvailability();
        document.querySelector(".search-panel").scrollIntoView({ behavior: "smooth", block: "center" });
      });
      cell.appendChild(button);
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
}

memberSelect.addEventListener("change", showMemberAvailability);
daySelect.addEventListener("change", showTimeAvailability);
timeSelect.addEventListener("change", showTimeAvailability);
buildTable();
