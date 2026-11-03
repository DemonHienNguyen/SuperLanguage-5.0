
    (() => {
      interface AdminStudent { id: string; name: string; email: string; course: string; level: string; progress: number; status: "active" | "completed" | "inactive"; joined: string }

      // Nạp danh sách học viên đã lưu; khởi tạo dữ liệu mẫu nếu đây là lần truy cập đầu.
      const storageKey = "superlanguage_students_v1";
      const seedStudents: AdminStudent[] = [
        { id: "sl-1", name: "Ngô Thảo Vy", email: "thaovy.ngo@example.com", course: "Tiếng Anh", level: "A1", progress: 93, status: "active", joined: "2025-03-06" },
        { id: "sl-2", name: "Bùi Quang Huy", email: "quanghuy.bui@example.com", course: "Tiếng Nhật", level: "B1", progress: 49, status: "active", joined: "2025-06-01" },
        { id: "sl-3", name: "Trần Minh Anh", email: "minhanh.tran@example.com", course: "Tiếng Hàn", level: "A2", progress: 72, status: "active", joined: "2025-05-18" },
        { id: "sl-4", name: "Lê Gia Bảo", email: "giabao.le@example.com", course: "Tiếng Anh", level: "B2", progress: 100, status: "completed", joined: "2025-04-20" },
        { id: "sl-5", name: "Phạm Khánh Linh", email: "khanhlinh.pham@example.com", course: "Tiếng Trung", level: "A1", progress: 38, status: "active", joined: "2025-06-10" },
        { id: "sl-6", name: "Đỗ Nhật Nam", email: "nhatnam.do@example.com", course: "Tiếng Nhật", level: "C1", progress: 100, status: "completed", joined: "2025-02-14" },
        { id: "sl-7", name: "Võ Ngọc Hà", email: "ngocha.vo@example.com", course: "Tiếng Pháp", level: "B1", progress: 0, status: "inactive", joined: "2025-01-30" },
        { id: "sl-8", name: "Đặng Đức Minh", email: "ducminh.dang@example.com", course: "Tiếng Anh", level: "B2", progress: 61, status: "active", joined: "2025-06-12" }
      ];
      let students: AdminStudent[] | null = JSON.parse(localStorage.getItem(storageKey) || "null") as AdminStudent[] | null;
      if (!Array.isArray(students)) {
        students = seedStudents;
        saveStudents();
      }
      const statusText: Record<AdminStudent["status"], string> = { active: "Đang học", completed: "Hoàn thành", inactive: "Tạm nghỉ" };
      const elements = {
        body: document.getElementById("studentTableBody") as HTMLTableSectionElement,
        noStudents: document.getElementById("noStudents") as HTMLDivElement,
        search: document.getElementById("searchInput") as HTMLInputElement,
        filter: document.getElementById("statusFilter") as HTMLSelectElement,
        modal: document.getElementById("studentModal") as HTMLDivElement,
        form: document.getElementById("studentForm") as HTMLFormElement
      };
      let toastTimer;
      // Lưu danh sách học viên hiện tại vào localStorage.
      function saveStudents() {
        localStorage.setItem(storageKey, JSON.stringify(students));
      }
      // Mã hóa dữ liệu động trước khi chèn vào HTML.
      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      }
      // Lấy chữ cái đầu của tối đa hai từ cuối để tạo avatar học viên.
      function initials(name) {
        return String(name || "?").trim().split(/\s+/).slice(-2).map(part => part[0] || "").join("").toUpperCase();
      }
      // Định dạng ngày theo ngôn ngữ Việt Nam.
      function formatDate(date) {
        return date ? new Date(date + "T00:00:00").toLocaleDateString("vi-VN") : "—";
      }
      // Lọc theo từ khóa/trạng thái, cập nhật thẻ thống kê và vẽ lại bảng học viên.
      function render() {
        const query = elements.search.value.trim().toLocaleLowerCase("vi");
        const status = elements.filter.value;
        const filtered = students.filter(student => {
          const matchesQuery = `${student.name} ${student.email}`.toLocaleLowerCase("vi").includes(query);
          return matchesQuery && (status === "all" || student.status === status);
        });
        document.getElementById("totalCount").textContent = String(students.length);
        document.getElementById("activeCount").textContent = String(students.filter(student => student.status === "active").length);
        document.getElementById("completedCount").textContent = String(students.filter(student => student.status === "completed").length);
        document.getElementById("resultCount").textContent = `Hiển thị ${filtered.length}/${students.length} học viên`;
        elements.noStudents.hidden = filtered.length !== 0;
        elements.body.innerHTML = filtered.map(student => {
          const progress = Math.max(0, Math.min(100, Number(student.progress) || 0));
          return `<tr>
            <td><div class="student-cell"><span class="student-avatar">${escapeHtml(initials(student.name))}</span><span><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.email)}</small></span></div></td>
            <td>${escapeHtml(student.course)}</td>
            <td><span class="level-pill">${escapeHtml(student.level || "A1")}</span></td>
            <td class="progress-cell"><div class="progress-label"><span>Hoàn thành</span><strong>${progress}%</strong></div><div class="progress-track"><span style="width:${progress}%"></span></div></td>
            <td><span class="status-pill ${escapeHtml(student.status)}">${escapeHtml(statusText[student.status] || "Tạm nghỉ")}</span></td>
            <td>${escapeHtml(formatDate(student.joined))}</td>
            <td><div class="actions"><button type="button" class="action-btn" data-action="edit" data-id="${escapeHtml(student.id)}" aria-label="Sửa ${escapeHtml(student.name)}"><i class="fa-solid fa-pen"></i></button><button type="button" class="action-btn delete" data-action="delete" data-id="${escapeHtml(student.id)}" aria-label="Xóa ${escapeHtml(student.name)}"><i class="fa-solid fa-trash"></i></button></div></td>
          </tr>`;
        }).join("");
      }
      // Hiển thị thông báo thao tác rồi tự ẩn.
      function showToast(message) {
        document.getElementById("toastMessage").textContent = message;
        const toast = document.getElementById("toast");
        toast.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
      }
      // Đóng hộp thoại thêm/sửa học viên.
      function closeModal() {
        elements.modal.classList.remove("open");
      }
      // Mở biểu mẫu thêm mới hoặc điền thông tin học viên để chỉnh sửa.
      function openModal(student) {
        elements.form.reset();
        (document.getElementById("studentId") as HTMLInputElement).value = student ? student.id : "";
        document.getElementById("modalTitle").textContent = student ? "Cập nhật học viên" : "Thêm học viên";
        (document.getElementById("fullName") as HTMLInputElement).value = student ? student.name : "";
        (document.getElementById("email") as HTMLInputElement).value = student ? student.email : "";
        (document.getElementById("course") as HTMLSelectElement).value = student ? student.course : "";
        (document.getElementById("level") as HTMLSelectElement).value = student ? student.level || "A1" : "A1";
        (document.getElementById("progress") as HTMLInputElement).value = String(student ? student.progress : 0);
        (document.getElementById("status") as HTMLSelectElement).value = student ? student.status : "active";
        elements.modal.classList.add("open");
        document.getElementById("fullName").focus();
      }
      // Điều khiển mở/đóng biểu mẫu và đóng khi nhấn ra vùng nền bên ngoài.
      document.getElementById("addStudentBtn").addEventListener("click", () => openModal(null));
      document.getElementById("closeModalBtn").addEventListener("click", closeModal);
      document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
      elements.modal.addEventListener("click", event => {
        if (event.target === elements.modal) closeModal();
      });
      // Xác thực theo quy tắc của form, thêm/cập nhật dữ liệu, lưu và làm mới bảng.
      elements.form.addEventListener("submit", event => {
        event.preventDefault();
        const id = (document.getElementById("studentId") as HTMLInputElement).value;
        const existing = students.find(student => student.id === id);
        const progress = Number((document.getElementById("progress") as HTMLInputElement).value);
        const status = (document.getElementById("status") as HTMLSelectElement).value as AdminStudent["status"];
        const student = {
          id: existing ? existing.id : `student-${Date.now()}`,
          name: (document.getElementById("fullName") as HTMLInputElement).value.trim(),
          email: (document.getElementById("email") as HTMLInputElement).value.trim(),
          course: (document.getElementById("course") as HTMLSelectElement).value,
          level: (document.getElementById("level") as HTMLSelectElement).value,
          progress,
          status: progress === 100 && status === "active" ? "completed" : status,
          joined: existing ? existing.joined : new Date().toISOString().slice(0, 10)
        };
        if (existing) {
          students = students.map(item => item.id === existing.id ? student : item);
        } else {
          students.unshift(student);
        }
        saveStudents();
        render();
        closeModal();
        showToast(existing ? "Đã cập nhật thông tin học viên." : "Đã thêm học viên mới.");
      });
      // Xử lý sửa hoặc xóa học viên từ các nút thao tác trong bảng.
      elements.body.addEventListener("click", event => {
        const target = event.target;
        const button = target instanceof Element ? target.closest<HTMLButtonElement>("button[data-action]") : null;
        if (!button) return;
        const student = students.find(item => item.id === button.dataset.id);
        if (!student) return;
        if (button.dataset.action === "edit") {
          openModal(student);
        } else if (button.dataset.action === "delete" && window.confirm(`Bạn có chắc muốn xóa học viên ${student.name}?`)) {
          students = students.filter(item => item.id !== student.id);
          saveStudents();
          render();
          showToast("Đã xóa học viên.");
        }
      });
      // Làm mới kết quả ngay khi nhập từ khóa hoặc thay đổi bộ lọc trạng thái.
      elements.search.addEventListener("input", render);
      elements.filter.addEventListener("change", render);
      const layout = document.querySelector(".layout");
      const sidebar = document.getElementById("sidebar");
      const collapsedKey = "superlanguage_admin_sidebar_collapsed";
      // Khôi phục trạng thái sidebar từ lần truy cập trước.
      if (localStorage.getItem(collapsedKey) === "true") {
        layout.classList.add("sidebar-collapsed");
        sidebar.classList.add("shrink");
      }
      if (layout.classList.contains("sidebar-collapsed")) {
        const button = document.getElementById("collapseToggle");
        button.setAttribute("aria-label", "Mở rộng thanh bên");
        button.title = "Mở rộng thanh bên";
        button.querySelector("i").className = "fa-solid fa-angles-right";
      }
      // Thu gọn/mở rộng sidebar, ghi nhớ lựa chọn và cập nhật biểu tượng nút.
      document.getElementById("collapseToggle").addEventListener("click", () => {
        layout.classList.toggle("sidebar-collapsed");
        sidebar.classList.toggle("shrink", layout.classList.contains("sidebar-collapsed"));
        localStorage.setItem(collapsedKey, String(layout.classList.contains("sidebar-collapsed")));
        const collapsed = layout.classList.contains("sidebar-collapsed");
        const button = document.getElementById("collapseToggle");
        button.setAttribute("aria-label", collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên");
        button.title = collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên";
        button.querySelector("i").className = collapsed ? "fa-solid fa-angles-right" : "fa-solid fa-angles-left";
        window.requestAnimationFrame(() => moveNavIndicator(activeNavLink(), false));
      });
      // Mở menu mobile và đóng menu khi người dùng nhấn ra ngoài.
      document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
      document.addEventListener("click", event => {
        const target = event.target;
        if (window.innerWidth <= 700 && sidebar.classList.contains("open") && target instanceof Node && !sidebar.contains(target) && !(target instanceof Element && target.closest("#menuToggle"))) sidebar.classList.remove("open");
      });
      // Cho phép đóng hộp thoại bằng phím Escape.
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeModal();
      });
      // Vẽ bảng lần đầu sau khi đã gắn các sự kiện tương tác.
      render();
      const sidebarNav = sidebar.querySelector("nav");
      // Lấy mục điều hướng đang chọn và đặt chỉ báo chuyển động bên dưới mục đó.
      const activeNavLink = () => sidebarNav.querySelector<HTMLAnchorElement>(".nav-link.active");
      // Cập nhật vị trí chỉ báo và tùy chọn chạy hiệu ứng chuyển động.
      const moveNavIndicator = (link: HTMLAnchorElement | null, animate = true) => {
        if (!link) return;
        sidebarNav.style.setProperty("--indicator-y", `${link.getBoundingClientRect().top - sidebarNav.getBoundingClientRect().top}px`);
        sidebarNav.dataset.hasIndicator = "true";
        if (animate) {
          sidebarNav.dataset.animating = "false";
          void sidebarNav.offsetWidth;
          sidebarNav.dataset.animating = "true";
        }
      };
      sidebarNav.querySelectorAll<HTMLAnchorElement>(".nav-link").forEach(link => {
        link.dataset.label = link.querySelector("span").textContent.trim();
      });
      sidebarNav.addEventListener("animationend", event => {
        if (event.target === sidebarNav && event.animationName === "gooeyEffect") {
          sidebarNav.dataset.animating = "false";
        }
      });
      moveNavIndicator(activeNavLink(), false);
      window.addEventListener("resize", () => moveNavIndicator(activeNavLink(), false));
      window.addEventListener("pageshow", () => moveNavIndicator(activeNavLink(), false));
    })();
  