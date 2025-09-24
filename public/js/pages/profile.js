import { h, mount } from "../lib.js";
import { go } from "../main.js";

export function Profile() {
    const err = h("div", { class: "err", id: "err" });
    const ok = h("div", { class: "ok", id: "ok" });
    const grid = h("div", { class: "row", id: "profileGrid" });

    const f = (label, value, col = 6) =>
        h("div", { class: `col-${col}` },
            h("label", {}, label),
            h("input", { value: value ?? "", readonly: true })
        );

    (async () => {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (res.status === 401) {
            err.style.display = "block";
            err.textContent = "กรุณาเข้าสู่ระบบก่อน";
            setTimeout(() => go("/login"), 700);
            return;
        }
        if (!res.ok) {
            err.style.display = "block";
            err.textContent = "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ";
            return;
        }
        const p = await res.json();

        grid.append(
            h("div", { class: "col-12 section-title" }, "ข้อมูลบริษัท"),
            f("ชื่อ-สกุล/ชื่อบริษัท *", p.company_name, 6),
            f("เลขบัตรประชาชน/เลขที่ผู้เสียภาษี *", p.tax_id, 6),

            f("ที่อยู่เลขที่ *", p.house_no, 4),
            f("หมู่", p.moo, 4),
            f("หมู่บ้าน/อาคาร", p.building, 4),

            f("ซอย", p.alley, 6),
            f("ถนน *", p.road, 6),

            f("ตำบล/แขวง *", p.subdistrict, 6),
            f("อำเภอ/เขต *", p.district, 6),

            f("จังหวัด *", p.province, 6),
            f("รหัสไปรษณีย์ *", p.postal_code, 6),
        );

        ok.style.display = "block";
        ok.textContent = "โหลดข้อมูลสำเร็จ";
    })();

    const logoutBtn = h("button", { type: "button", style: "width:100%" }, "ออกจากระบบ");
    logoutBtn.addEventListener("click", async () => {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
        go("/login");
    });

    mount(
        h("div", { class: "center-wrap" },             
            h("div", { class: "card card-wide" },        
                h("div", { class: "h1" }, "ข้อมูลโปรไฟล์"),
                err, ok,
                grid,
                h("div", { class: "col-12", style: "margin-top:12px" }, logoutBtn)
            )
        )
    );
}
