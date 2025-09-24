import { h, mount, postJSON } from "../lib.js";
import { go } from "../main.js";

export function Register() {
  const err = h("div", { class: "err", id: "err" });

  const username = h("input", { name: "username", required: true, placeholder: "เช่น dodo1234", autocomplete: "username" });

  const pass = h("input", { name: "password", type: "password", required: true, placeholder: "8–20 ตัวอักษร/ตัวเลข", autocomplete: "new-password" });
  const eye = h("button", { type: "button", class: "eye", title: "แสดง/ซ่อนรหัสผ่าน" }, "👁");
  eye.addEventListener("click", () => { pass.type = pass.type === "password" ? "text" : "password"; });

  const passGroup = h("div", { class: "input-group" }, pass, eye);
  const pwHints = h("ul", { class: "pw-hints" },
    h("li", {}, "มีตัวอักษรพิมพ์ใหญ่"),
    h("li", {}, "มีตัวอักษรพิมพ์เล็ก"),
    h("li", {}, "มีตัวเลข"),
    h("li", {}, "มีจำนวนตัวอักษรและตัวเลขรวมกัน 8–20 ตัวอักษร"),
  );

  
  const form = h("form", { class: "row", id: "regForm" },
    field("บัญชีผู้ใช้ (Username)*", username, 12),
    field("รหัสผ่าน (Password)*", h("div", {}, passGroup, pwHints), 12),

    field("ประเภท*", sel(["--- เลือก ---", "บุคคลธรรมดา", "นิติบุคคล"], { name: "member_type", required: true }), 12),
    field("ชื่อ-สกุล/ชื่อบริษัท*", h("input", { name: "company_name", required: true }), 12),

    field("ที่อยู่เลขที่*", h("input", { name: "house_no", required: true }), 4),
    field("หมู่", h("input", { name: "moo" }), 4),
    field("หมู่บ้าน/อาคาร", h("input", { name: "building" }), 4),

    field("ซอย", h("input", { name: "alley" }), 6),
    field("ถนน*", h("input", { name: "road", required: true }), 6),

    field("ตำบล/แขวง*", h("input", { name: "subdistrict", required: true }), 6),
    field("อำเภอ/เขต*", h("input", { name: "district", required: true }), 6),

    field("จังหวัด*", h("input", { name: "province", required: true }), 6),
    field("รหัสไปรษณีย์*", h("input", { name: "postal_code", required: true }), 6),

    field("คำนำหน้าผู้ติดต่อ*", sel(["--- เลือก ---", "คุณ", "นาย", "นาง", "นางสาว"], { name: "contact_title", required: true }), 4),
    field("ชื่อผู้ติดต่อ*", h("input", { name: "contact_fname", required: true }), 4),
    field("สกุลผู้ติดต่อ*", h("input", { name: "contact_lname", required: true }), 4),

    field("เบอร์โทรศัพท์*", h("input", { name: "phone", required: true, placeholder: "เช่น 0812345678", inputmode: "numeric" }), 6),
    field("อีเมล*", h("input", { name: "email", type: "email", required: true, placeholder: "name@example.com" }), 6),

    field("โค้ดแนะนำ (REF)", h("input", { name: "ref_code" }), 12),

    h("div", { class: "col-12" }, h("button", { type: "submit", style: "width:100%" }, "สมัครสมาชิก")),
  );

 
  const getData = () => {
    const raw = Object.fromEntries(new FormData(form).entries());
    for (const k in raw) raw[k] = String(raw[k]).trim();
    return raw;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.style.display = "none";
    form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const data = getData();
    const messages = validateForm(form, data);
    if (messages.length) { showErrors(messages); return; }

    const { status, data: res } = await postJSON("/api/register", data);

    if (status === 400 && Array.isArray(res.errors)) {
      const msg = res.errors.map(e => `• ${e.path || e.param}: ${e.msg || "ไม่ถูกต้อง"}`);
      res.errors.forEach(e => form.querySelector(`[name="${e.path || e.param}"]`)?.classList.add("invalid"));
      return showErrors(msg);
    }

    if (status === 409) { form.username.classList.add("invalid"); return showErrors(["• username นี้ถูกใช้แล้ว"]); }
    if (status === 0 || status >= 400) {
      const msg = res.detail ? `${res.error || 'Server error'}: ${res.detail}` : (res.error || 'กรอกข้อมูลไม่ครบ/ไม่ถูกต้อง');
      return showErrors([msg]);
    }

    go("/profile");
  });

  function showErrors(list) {
    err.style.display = "block";
    err.innerHTML = list.join("<br>");
  }

  
  mount(
    h("div", { class: "container" },
      h("div", { class: "card" },
        h("div", { class: "h1" }, "สมัครสมาชิก"),
        h("div", { class: "badge-line" }, h("span", { class: "dot" }), "ทดลองใช้งานฟรี 6 เดือน"),
        err,
        form
      )
    )
  );
}

function field(labelEl, inputEl, col = 6) {
  return h("div", { class: `col-${col}` }, h("label", {}, labelEl), inputEl);
}
function sel(options, attrs) {
  const [first, ...rest] = options;
  return h("select", attrs,
    h("option", { value: "" }, first ?? "— เลือก —"),
    ...rest.map(o => h("option", {}, o))
  );
}


function validateForm(form, d) {
  const errs = [];
  if (!/^[A-Za-z][A-Za-z0-9_]{3,19}$/.test(d.username)) {
    errs.push("• username: ต้องเป็นภาษาอังกฤษ 4–20 ตัว และขึ้นต้นด้วยตัวอักษร");
    form.username.classList.add("invalid");
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(d.password)) {
    errs.push("• password: ต้องมีพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และยาว 8–20 ตัว");
    form.querySelector('[name="password"]').classList.add("invalid");
  }
  const required = [
    "member_type", "company_name", "house_no", "road", "subdistrict", "district",
    "province", "postal_code", "contact_title", "contact_fname", "contact_lname", "phone", "email"
  ];
  required.forEach(n => {
    if (!d[n]) { errs.push(`• ${n}: จำเป็นต้องกรอก`); form.querySelector(`[name="${n}"]`)?.classList.add("invalid"); }
  });
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    errs.push("• email: รูปแบบอีเมลไม่ถูกต้อง"); form.email.classList.add("invalid");
  }
  return errs;
}
