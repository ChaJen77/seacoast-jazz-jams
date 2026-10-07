const schedule = window.jamSchedule;
const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});
const shortDateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric"
});

function dateAtLocalTime(dateString, timeString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hourText, minuteText] = timeString.split(":");
  const [minute, meridiem] = minuteText.split(" ");
  let hour = Number(hourText) % 12;
  if (meridiem === "PM") hour += 12;
  return new Date(year, month - 1, day, hour, Number(minute));
}

function upcomingPressRoomDate() {
  const now = new Date();
  return schedule.pressRoom.dates
    .map((event) => ({ ...event, startDate: dateAtLocalTime(event.date, event.start) }))
    .filter((event) => {
      const endDate = dateAtLocalTime(event.date, event.end);
      return endDate >= now;
    })
    .sort((first, second) => first.startDate - second.startDate)[0];
}

function nextLeeMonday() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let daysUntil = (schedule.lee.weekdayIndex - now.getDay() + 7) % 7;
  next.setDate(next.getDate() + daysUntil);
  next.setHours(schedule.lee.endHour, schedule.lee.endMinute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 7);
  }
  return next;
}

function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function renderPressRoomHero(event) {
  const panel = document.querySelector("#next-press-room");
  if (!event) {
    panel.innerHTML = `
      <p class="event-label">Press Room · Next date</p>
      <h2>No next date announced yet</h2>
      <p class="event-footnote">The Press Room schedule varies. Check back here for the next confirmed night.</p>
    `;
    return;
  }

  const eventDate = dateAtLocalTime(event.date, event.start);
  const address = schedule.pressRoom.address;
  panel.innerHTML = `
    <p class="event-label">Next Press Room night</p>
    <h2>${schedule.pressRoom.title}</h2>
    <p class="event-date">${dateFormat.format(eventDate)}</p>
    <p class="event-time">${event.start}–${event.end}</p>
    <a class="event-place" href="${mapsUrl(address)}" target="_blank" rel="noopener">${address} <span aria-hidden="true">↗</span></a>
    <p class="event-footnote">One confirmed return date. Later Press Room nights depend on the venue's schedule.</p>
  `;
}

function renderPressRoomCard(event) {
  if (!event) {
    return `
      <article class="jam-empty">
        <h3>Press Room · Next date to come</h3>
        <p>No later date has been confirmed yet. This jam's schedule varies; check back here before heading to Portsmouth.</p>
      </article>
    `;
  }
  const eventDate = dateAtLocalTime(event.date, event.start);
  const address = schedule.pressRoom.address;
  return `
    <article class="jam-card featured">
      <p class="card-tag">Confirmed return date</p>
      <h3>${schedule.pressRoom.title}</h3>
      <p class="card-date">${dateFormat.format(eventDate)}</p>
      <p class="card-time">${event.start}–${event.end}</p>
      <p class="card-place"><a href="${mapsUrl(address)}" target="_blank" rel="noopener">${address} ↗</a></p>
      <p class="card-note">Later Press Room dates vary and will be added when announced.</p>
    </article>
  `;
}

function renderLeeCard() {
  const nextDate = nextLeeMonday();
  const locationText = `${schedule.lee.venue} · ${schedule.lee.town}`;
  return `
    <article class="jam-card">
      <p class="card-tag">Every ${schedule.lee.weekday}</p>
      <h3>${schedule.lee.title}</h3>
      <p class="card-date">Next: ${shortDateFormat.format(nextDate)}</p>
      <p class="card-time">${schedule.lee.start}–${schedule.lee.end}</p>
      <p class="card-place">${locationText}</p>
      <p class="card-note">${schedule.lee.note} <a href="${schedule.lee.contactUrl}">Contact Charlie ↗</a></p>
    </article>
  `;
}

renderPressRoomHero(upcomingPressRoomDate());
document.querySelector("#jam-list").innerHTML = [
  renderPressRoomCard(upcomingPressRoomDate()),
  renderLeeCard()
].join("");