// DOM helper
export const h = (tag, props = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) el.append(c?.nodeType ? c : document.createTextNode(c ?? ""));
  return el;
};

export const mount = (node) => {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.append(node);
};

export async function postJSON(url, data) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    let json = {};
    try { json = await res.json(); } catch {}
    return { status: res.status, data: json };
  } catch (err) {
    return { status: 0, data: { error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้: " + err.message } };
  }
}

export async function getJSON(url) {
  const res = await fetch(url, { credentials: "include" });
  return res.json();
}
