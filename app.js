/* 花田待办 · 大脑：点一下发生什么 */
const KEY = "flower-todo-v1";

const listEl = document.getElementById("todo-list");
const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const counterEl = document.getElementById("counter");
const emptyTip = document.getElementById("empty-tip");
const filterBtns = document.querySelectorAll(".filters button");

let todos = load();   // 打开先从"小仓库"里读出来
let filter = "all";   // 当前筛选：all / active / done

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(todos)); // 存进手机本地小仓库
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* 添加：回车或点"种下" */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: uid(), text, done: false });
  input.value = "";
  save();
  render();          // 界面立刻重画，不等任何人
  input.focus();
});

/* 列表里的点击：打勾 / 编辑 / 删除 */
listEl.addEventListener("click", (e) => {
  const li = e.target.closest(".todo");
  if (!li) return;
  const t = todos.find((x) => x.id === li.dataset.id);
  if (!t) return;

  if (e.target.closest(".check")) {
    t.done = !t.done;   // 打勾只改状态，不挪位置
    save(); render();
  } else if (e.target.closest(".del")) {
    todos = todos.filter((x) => x.id !== t.id);
    save(); render();
  } else if (e.target.closest(".edit")) {
    startEdit(li, t);
  }
});

/* 编辑：把文字变成输入框，回车保存 */
function startEdit(li, t) {
  const span = li.querySelector(".text");
  const ed = document.createElement("input");
  ed.className = "edit-input";
  ed.value = t.text;
  ed.maxLength = 100;
  span.replaceWith(ed);
  ed.focus();
  ed.select();
  let done = false;
  const commit = (cancel) => {
    if (done) return;
    done = true;
    if (!cancel) {
      const v = ed.value.trim();
      if (v) t.text = v;
      save();
    }
    render();
  };
  ed.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit(false);
    if (e.key === "Escape") commit(true);
  });
  ed.addEventListener("blur", () => commit(false));
}

/* 筛选按钮 */
filterBtns.forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    filterBtns.forEach((x) => x.classList.toggle("active", x === b));
    render();
  })
);

/* 把数据画成界面 */
function render() {
  const shown = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );
  listEl.innerHTML = "";
  for (const t of shown) {
    const li = document.createElement("li");
    li.className = "todo" + (t.done ? " done" : "");
    li.dataset.id = t.id;
    li.innerHTML =
      '<button class="check" aria-label="完成">' + (t.done ? "✓" : "") + "</button>" +
      '<span class="text"></span>' +
      '<button class="icon-btn edit" aria-label="编辑">✏️</button>' +
      '<button class="icon-btn del" aria-label="删除">🗑️</button>';
    li.querySelector(".text").textContent = t.text; // textContent 防注入
    listEl.appendChild(li);
  }
  const left = todos.filter((t) => !t.done).length;
  counterEl.textContent = todos.length ? "还剩 " + left + " 件事待完成" : "";
  emptyTip.style.display = todos.length ? "none" : "block";
}

/* PWA：注册 service worker，实现离线可用 */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
