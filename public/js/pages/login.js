import { h, mount, postJSON } from "../lib.js";
import { go } from "../main.js";

export function Login() {
    const err = h("div", { class: "err", id: "err" });

    const username = h("input", { name: "username", required: true, autocomplete: "username" });
    const password = h("input", { name: "password", type: "password", required: true, autocomplete: "current-password" });

    const showPw = h("input", { type: "checkbox", id: "showPw" });
    showPw.addEventListener("change", () => {
        password.type = showPw.checked ? "text" : "password";
    });

    const form = h("form", { class: "row", id: "loginForm" },
        field("บัญชีผู้ใช้ (Username) *", username, 12),
        field("รหัสผ่าน (Password) *", password, 12),
        h("div", { class: "col-12 actions" },
            h("label", { class: "show-pw" }, showPw, "แสดงรหัสผ่าน"),
            h("a", { class: "link", href: "#/forgot" }, "ลืมรหัสผ่าน ?")
        ),
        h("div", { class: "col-12 actions" },
            h("a", { class: "link", href: "#/register" }, "สมัครสมาชิก")
        ),
        h("div", { class: "col-12" }, h("button", { type: "submit", style: "width:100%" }, "เข้าสู่ระบบ")),
    );

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        err.style.display = "none";

        const data = Object.fromEntries(new FormData(form).entries());
        const { status, data: res } = await postJSON("/api/login", data);

        if (status === 0) return showErr(res.error || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        if (status >= 400) return showErr(res.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

        go("/profile");
    });

    function showErr(message) {
        err.style.display = "block";
        err.textContent = message;
    }

    mount(
        h("div", { class: "center-wrap" },
            h("div", { class: "card card-narrow" },
                h("div", { class: "h1" }, "เข้าสู่ระบบ"),
                h("div", { class: "subhead" }, "มองเห็นทุกการเคลื่อนไหว ธุรกิจไม่สะดุด"),
                h("div", { class: "badge-line" }, h("span", { class: "dot" }), "ทดลองใช้งานฟรี 6 เดือน"),
                err,
                form
            )
        )
    );
}

function field(labelEl, inputEl, col = 12) {
    return h("div", { class: `col-${col}` }, h("label", {}, labelEl), inputEl);
}
