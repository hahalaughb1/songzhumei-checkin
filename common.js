// 共用：賽程資料整理、Firebase 初始化、畫面小工具
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./config.js";

const M = window.MEET;
export const EVENTS = M.events;

function toMin(s) { const [h, m] = s.split(":"); return +h * 60 + +m; }
function fmt(m) { m = Math.round(m); return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }

// 每一組：項次、組次、總組數、預估時間（把該項時段平均分給各組）、道次
export const HEATS = M.heats.map(([ev, heat, of, lanes]) => {
  const [, s, e] = EVENTS[ev];
  const t0 = toMin(s), t1 = toMin(e);
  return {
    ev, heat, of,
    est: fmt(t0 + (t1 - t0) * (heat - 1) / of),
    lanes: lanes.map(([lane, name, school, time, v]) => ({ lane, name, school, time, v: !!v }))
  };
});

export const title = (n) => EVENTS[n][0];
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const hhmm = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

export const configured = !!(firebaseConfig.apiKey && firebaseConfig.databaseURL);
export const app = configured ? initializeApp(firebaseConfig) : null;
export const db = configured ? getDatabase(app) : null;
export const statusRef = configured ? ref(db, "status") : null;

export function lanesHtml(h) {
  return '<ul class="lanes">' + h.lanes.map((l) =>
    `<li><span class="ln">${l.lane}</span><span class="nm">${esc(l.name || l.school)}</span>` +
    (l.v ? '<span class="v">表演</span>' : "") +
    (l.name ? `<span class="sc">${esc(l.school)}</span>` : "") + "</li>").join("") + "</ul>";
}

// 看板：現在檢錄＋下兩組＋公告
export function boardHtml(st) {
  const cur = typeof st?.cur === "number" ? st.cur : -1;
  const note = st?.note ? `<div class="note">${esc(st.note)}</div>` : "";
  const stamp = st?.updated ? `<div class="stamp">檢錄處更新於 ${hhmm(st.updated)}</div>` : "";
  const next = (ix, labels) => {
    const parts = ix.filter((i) => i >= 0 && i < HEATS.length).map((i, k) => {
      const h = HEATS[i];
      return `<div><span class="label">${labels[k]}</span><b>${h.ev}. ${esc(title(h.ev))}</b><span>第 ${h.heat}/${h.of} 組・預計 ${h.est}</span></div>`;
    });
    return parts.length ? `<div class="next">${parts.join("")}</div>` : "";
  };
  if (cur < 0 || cur >= HEATS.length) {
    const done = cur >= HEATS.length;
    return `<span class="label">檢錄狀態</span><div class="idle"><h2>${done ? "全部項目已檢錄完畢" : "檢錄尚未開始"}</h2>` +
      `<p class="label">${done ? "感謝參賽，辛苦了！" : "上午 08:00 開賽，請提早到檢錄處報到"}</p></div>` +
      (done ? "" : next([0, 1], ["第一組", "第二組"])) + note + stamp;
  }
  const h = HEATS[cur];
  return `<span class="live"><i></i>現在檢錄</span>` +
    `<div class="now-row"><div class="evno">${h.ev}<small>項</small></div><div class="now-title"><h2>${esc(title(h.ev))}</h2>` +
    `<div class="heat">第 ${h.heat} 組 <span>/ 共 ${h.of} 組・預計 ${h.est}</span></div></div></div>` +
    lanesHtml(h) + next([cur + 1, cur + 2], ["下一組・請準備", "再下一組"]) + note + stamp;
}
