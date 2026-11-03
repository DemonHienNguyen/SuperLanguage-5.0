
    (() => {
      interface LessonRecord { id: string; title: string; course: string; level: string; duration: number; description?: string }
      interface QuestionSetRecord { id: string; title: string; lessonId?: string; type: string; count: number; description?: string }
      interface AdminStudent { id: string; name: string; email: string; course: string; level: string; progress: number; status: "active" | "completed" | "inactive"; joined: string }

      // Dữ liệu mẫu được dùng khi trình duyệt chưa có danh sách học viên đã lưu.
      const storageKey = "superlanguage_students_v1";
      const initialStudents: AdminStudent[] = [
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
        students = initialStudents;
        localStorage.setItem(storageKey, JSON.stringify(students));
      }
      // Mã hóa nội dung trước khi chèn dữ liệu vào HTML để tránh diễn giải ký tự đặc biệt.
      const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      const statusText: Record<AdminStudent["status"], string> = { active: "Đang học", completed: "Hoàn thành", inactive: "Tạm nghỉ" };
      // Tính các chỉ số tổng quan từ dữ liệu học viên đã lưu.
      const total = students.length;
      const active = students.filter(student => student.status === "active").length;
      const completed = students.filter(student => student.status === "completed").length;
      const average = total ? Math.round(students.reduce((sum, student) => sum + Number(student.progress || 0), 0) / total) : 0;
      document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
      document.getElementById("totalStudents").textContent = String(total);
      document.getElementById("activeStudents").textContent = String(active);
      document.getElementById("averageProgress").textContent = average + "%";
      document.getElementById("completedStudents").textContent = String(completed);
      // Cập nhật phần trăm và độ dài thanh tiến độ của từng chỉ số.
      const setProgress = (labelId, barId, value) => {
        document.getElementById(labelId).textContent = value + "%";
        document.getElementById(barId).style.width = value + "%";
      };
      setProgress("activeRate", "activeBar", total ? Math.round(active / total * 100) : 0);
      setProgress("completedRate", "completedBar", total ? Math.round(completed / total * 100) : 0);
      setProgress("progressRate", "progressBar", average);
      // Tổng hợp số học viên theo cấp độ và vẽ biểu đồ cột.
      const levels = ["A1", "A2", "B1", "B2", "C1"];
      const levelCounts = levels.map(level => students.filter(student => student.level === level).length);
      const maxCount = Math.max(1, ...levelCounts);
      document.getElementById("levelChart").innerHTML = levels.map((level, index) => {
        const height = Math.max(8, Math.round(levelCounts[index] / maxCount * 128));
        return `<div class="bar-group"><span class="bar-value">${levelCounts[index]}</span><div class="bar" style="height:${height}px" title="${levelCounts[index]} học viên"></div><span class="bar-label">${level}</span></div>`;
      }).join("");
      // Sắp xếp theo ngày tham gia và hiển thị tối đa năm học viên mới nhất.
      const latest = [...students].sort((a, b) => String(b.joined).localeCompare(String(a.joined))).slice(0, 5);
      document.getElementById("recentStudents").innerHTML = latest.length ? latest.map(student => {
        const initials = String(student.name || "?").trim().split(/\s+/).slice(-2).map(part => part[0] || "").join("").toUpperCase();
        const joined = student.joined ? new Date(student.joined + "T00:00:00").toLocaleDateString("vi-VN") : "—";
        return `<tr><td><div class="student-cell"><span class="student-avatar">${esc(initials)}</span><span><strong>${esc(student.name)}</strong><small>${esc(student.email)}</small></span></div></td><td><span class="level-pill">${esc(student.level || "A1")}</span></td><td>${Math.max(0, Math.min(100, Number(student.progress) || 0))}%</td><td>${esc(student.course)}</td><td><span class="status-pill ${esc(student.status)}">${esc(statusText[student.status] || "Tạm nghỉ")}</span></td><td>${esc(joined)}</td></tr>`;
      }).join("") : '<tr><td class="empty-row" colspan="6">Chưa có dữ liệu học viên. <a class="text-link" href="../users/users.html">Thêm học viên</a></td></tr>';
      const layout = document.querySelector(".layout");
      const sidebar = document.getElementById("sidebar");
      const collapsedKey = "superlanguage_admin_sidebar_collapsed";
      // Khôi phục trạng thái thu gọn sidebar đã chọn ở lần truy cập trước.
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
      // Đổi trạng thái sidebar, lưu lựa chọn và cập nhật nhãn hỗ trợ truy cập của nút.
      document.getElementById("collapseToggle").addEventListener("click", () => {
        layout.classList.toggle("sidebar-collapsed");
        sidebar.classList.toggle("shrink", layout.classList.contains("sidebar-collapsed"));
        localStorage.setItem(collapsedKey, String(layout.classList.contains("sidebar-collapsed")));
        const collapsed = layout.classList.contains("sidebar-collapsed");
        document.getElementById("collapseToggle").setAttribute("aria-label", collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên");
        document.getElementById("collapseToggle").title = collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên";
        document.querySelector("#collapseToggle i").className = collapsed ? "fa-solid fa-angles-right" : "fa-solid fa-angles-left";
        window.requestAnimationFrame(() => moveNavIndicator(activeNavLink(), false));
      });
      // Mở menu trên màn hình nhỏ và đóng menu khi nhấn ra ngoài sidebar.
      document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
      document.addEventListener("click", event => {
        const target = event.target;
        if (window.innerWidth <= 700 && sidebar.classList.contains("open") && target instanceof Node && !sidebar.contains(target) && !(target instanceof Element && target.closest("#menuToggle"))) sidebar.classList.remove("open");
      });

      // Bài học và bộ câu hỏi được lưu riêng trong localStorage.
      const lessonKey = "superlanguage_lessons_v1";
      const questionKey = "superlanguage_question_sets_v1";
      let lessons: LessonRecord[] = JSON.parse(localStorage.getItem(lessonKey) || "[]") as LessonRecord[];
      let questionSets: QuestionSetRecord[] = JSON.parse(localStorage.getItem(questionKey) || "[]") as QuestionSetRecord[];
      if (!Array.isArray(lessons)) lessons = [];
      if (!Array.isArray(questionSets)) questionSets = [];
      let crudType: "lessons" | "questions" = "lessons";
      let toastTimer;
      const crudModal = document.getElementById("crudModal");
      const lessonCourses = ["Tiếng Anh", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Trung", "Tiếng Pháp"];
      const lessonLevels = ["A1", "A2", "B1", "B2", "C1"];
      const lessonTypes: Record<string, string> = { multiple: "Trắc nghiệm", fill: "Điền từ", translate: "Dịch câu" };
      // Ghi đồng bộ hai danh sách nội dung vào bộ nhớ trình duyệt.
      const saveContent = () => {
        localStorage.setItem(lessonKey, JSON.stringify(lessons));
        localStorage.setItem(questionKey, JSON.stringify(questionSets));
      };
      // Vẽ bảng tương ứng với tab đang chọn và hiển thị trạng thái rỗng nếu chưa có dữ liệu.
      function renderCrud() {
        const isLesson = crudType === "lessons";
        const items = isLesson ? lessons : questionSets;
        document.getElementById("crudTitle").textContent = isLesson ? "Quản lý bài học" : "Bộ câu hỏi";
        document.getElementById("crudDescription").textContent = isLesson
          ? "Tạo, chỉnh sửa và quản lý bài học trong chương trình."
          : "Tổ chức bộ câu hỏi theo bài học và dạng bài tập.";
        document.getElementById("crudAddButton").innerHTML = `<i class="fa-solid fa-plus"></i> Thêm ${isLesson ? "bài học" : "bộ câu hỏi"}`;
        document.getElementById("lessonsTab").classList.toggle("active", isLesson);
        document.getElementById("questionsTab").classList.toggle("active", !isLesson);
        document.getElementById("crudTableHead").innerHTML = isLesson
          ? "<tr><th>Tên bài học</th><th>Khóa học</th><th>Trình độ</th><th>Thời lượng</th><th>Mô tả</th><th>Thao tác</th></tr>"
          : "<tr><th>Tên bộ câu hỏi</th><th>Bài học</th><th>Dạng câu hỏi</th><th>Số câu</th><th>Mô tả</th><th>Thao tác</th></tr>";
        document.getElementById("crudTableBody").innerHTML = items.map(item => {
          const relatedLesson = lessons.find(lesson => lesson.id === item.lessonId);
          const cells = isLesson
            ? `<td><strong>${esc(item.title)}</strong></td><td>${esc(item.course)}</td><td>${esc(item.level)}</td><td>${esc(item.duration)} phút</td><td>${esc(item.description || "—")}</td>`
            : `<td><strong>${esc(item.title)}</strong></td><td>${esc(relatedLesson ? relatedLesson.title : "Chưa gắn bài học")}</td><td>${esc(lessonTypes[item.type] || item.type)}</td><td>${esc(item.count)}</td><td>${esc(item.description || "—")}</td>`;
          return `<tr>${cells}<td><div class="crud-actions"><button type="button" data-edit="${esc(item.id)}" aria-label="Sửa ${esc(item.title)}"><i class="fa-solid fa-pen"></i></button><button type="button" data-delete="${esc(item.id)}" aria-label="Xóa ${esc(item.title)}"><i class="fa-solid fa-trash"></i></button></div></td></tr>`;
        }).join("");
        const empty = document.getElementById("crudEmpty");
        empty.hidden = items.length > 0;
        empty.textContent = isLesson ? "Chưa có bài học. Hãy thêm bài học đầu tiên." : "Chưa có bộ câu hỏi. Hãy tạo bộ câu hỏi mới.";
      }
      // Đồng bộ nội dung trang, breadcrumb, tab đang chọn và điều hướng với hash URL.
      function updateRoute() {
        const route = location.hash.slice(1);
        const isContentPage = route === "lessons" || route === "questions";
        crudType = route === "questions" ? "questions" : "lessons";
        document.getElementById("dashboardView").hidden = isContentPage;
        document.getElementById("crudView").hidden = !isContentPage;
        document.getElementById("breadcrumbTitle").textContent = isContentPage ? (crudType === "lessons" ? "Bài học" : "Bộ câu hỏi") : "Tổng quan";
        document.querySelectorAll<HTMLAnchorElement>(".sidebar .nav-link").forEach(link => {
          const active = link.dataset.nav === (isContentPage ? crudType : "dashboard");
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
        if (isContentPage) renderCrud();
        moveNavIndicator(activeNavLink(), false);
      }
      // Tạo biểu mẫu thêm/sửa cho bài học hoặc bộ câu hỏi và điền dữ liệu hiện có khi sửa.
      function openCrudModal(item) {
        const fields = document.getElementById("crudFormFields");
        document.getElementById("crudModalTitle").textContent = `${item ? "Sửa" : "Thêm"} ${crudType === "lessons" ? "bài học" : "bộ câu hỏi"}`;
        document.getElementById("crudForm").dataset.recordId = item ? item.id : "";
        if (crudType === "lessons") {
          fields.innerHTML = `<div class="crud-field"><label for="contentTitle">Tên bài học</label><input id="contentTitle" name="title" maxlength="100" required value="${esc(item ? item.title : "")}"></div>
            <div class="crud-field"><label for="contentCourse">Khóa học</label><select id="contentCourse" name="course" required>${lessonCourses.map(course => `<option ${item && item.course === course ? "selected" : ""}>${course}</option>`).join("")}</select></div>
            <div class="crud-field"><label for="contentLevel">Trình độ</label><select id="contentLevel" name="level" required>${lessonLevels.map(level => `<option ${item && item.level === level ? "selected" : ""}>${level}</option>`).join("")}</select></div>
            <div class="crud-field"><label for="contentDuration">Thời lượng (phút)</label><input id="contentDuration" name="duration" type="number" min="1" max="600" value="${esc(item ? item.duration : "30")}" required></div>
            <div class="crud-field"><label for="contentDescription">Mô tả</label><textarea id="contentDescription" name="description" maxlength="500">${esc(item ? item.description : "")}</textarea></div>`;
        } else {
          fields.innerHTML = `<div class="crud-field"><label for="contentTitle">Tên bộ câu hỏi</label><input id="contentTitle" name="title" maxlength="100" required value="${esc(item ? item.title : "")}"></div>
            <div class="crud-field"><label for="contentLesson">Bài học liên kết</label><select id="contentLesson" name="lessonId"><option value="">Chưa gắn bài học</option>${lessons.map(lesson => `<option value="${esc(lesson.id)}" ${item && item.lessonId === lesson.id ? "selected" : ""}>${esc(lesson.title)}</option>`).join("")}</select></div>
            <div class="crud-field"><label for="contentType">Dạng câu hỏi</label><select id="contentType" name="type">${Object.entries(lessonTypes).map(([key, label]) => `<option value="${key}" ${item && item.type === key ? "selected" : ""}>${label}</option>`).join("")}</select></div>
            <div class="crud-field"><label for="contentCount">Số câu hỏi</label><input id="contentCount" name="count" type="number" min="1" max="500" value="${esc(item ? item.count : "10")}" required></div>
            <div class="crud-field"><label for="contentDescription">Mô tả</label><textarea id="contentDescription" name="description" maxlength="500">${esc(item ? item.description : "")}</textarea></div>`;
        }
        crudModal.classList.add("open");
        document.getElementById("contentTitle").focus();
      }
      // Đóng hộp thoại quản lý nội dung.
      function closeCrudModal() {
        crudModal.classList.remove("open");
      }
      // Hiển thị thông báo thao tác thành công rồi tự ẩn sau một khoảng thời gian.
      function showCrudToast(message) {
        document.getElementById("crudToastText").textContent = message;
        const toast = document.getElementById("crudToast");
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
      }
      // Gắn các nút thêm, đóng, hủy và đóng hộp thoại khi nhấn vùng nền.
      document.getElementById("crudAddButton").addEventListener("click", () => openCrudModal(null));
      document.getElementById("crudCloseButton").addEventListener("click", closeCrudModal);
      document.getElementById("crudCancelButton").addEventListener("click", closeCrudModal);
      crudModal.addEventListener("click", event => {
        if (event.target === crudModal) closeCrudModal();
      });
      // Lưu mới hoặc cập nhật bài học/bộ câu hỏi, sau đó làm mới bảng và thông báo kết quả.
      document.getElementById("crudForm").addEventListener("submit", event => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const id = form.dataset.recordId || "";
        const data = Object.fromEntries(formData.entries()) as Record<string, string>;
        if (crudType === "lessons") {
          const existing = lessons.find(lesson => lesson.id === id);
          const record: LessonRecord = {
            id: existing ? existing.id : `content-${Date.now()}`,
            title: data.title || "",
            course: data.course || "",
            level: data.level || "",
            duration: Number(data.duration),
            description: data.description || ""
          };
          lessons = existing ? lessons.map(lesson => lesson.id === id ? record : lesson) : [record, ...lessons];
        } else {
          const existing = questionSets.find(set => set.id === id);
          const record: QuestionSetRecord = {
            id: existing ? existing.id : `content-${Date.now()}`,
            title: data.title || "",
            lessonId: data.lessonId || "",
            type: data.type || "",
            count: Number(data.count),
            description: data.description || ""
          };
          questionSets = existing ? questionSets.map(set => set.id === id ? record : set) : [record, ...questionSets];
        }
        saveContent();
        renderCrud();
        closeCrudModal();
        showCrudToast(id ? "Đã cập nhật nội dung." : "Đã thêm nội dung mới.");
      });
      // Xử lý sửa/xóa theo nút trong bảng; khi xóa bài học, bỏ liên kết của bộ câu hỏi liên quan.
      document.getElementById("crudTableBody").addEventListener("click", event => {
        const target = event.target;
        const button = target instanceof Element ? target.closest<HTMLButtonElement>("button") : null;
        if (!button) return;
        const records = crudType === "lessons" ? lessons : questionSets;
        const id = button.dataset.edit || button.dataset.delete;
        const item = records.find(record => record.id === id);
        if (!item) return;
        if (button.dataset.edit) openCrudModal(item);
        else if (button.dataset.delete && window.confirm(`Xóa "${item.title}"?`)) {
          if (crudType === "lessons") {
            lessons = lessons.filter(lesson => lesson.id !== id);
            questionSets = questionSets.map(set => set.lessonId === id ? { ...set, lessonId: "" } : set);
          } else {
            questionSets = questionSets.filter(set => set.id !== id);
          }
          saveContent();
          renderCrud();
          showCrudToast("Đã xóa nội dung.");
        }
      });
      // Hỗ trợ đóng hộp thoại bằng Escape và cập nhật trang khi đổi tab qua URL.
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeCrudModal();
      });
      // Đổi route khi người dùng chuyển giữa các tab nội dung.
      window.addEventListener("hashchange", updateRoute);
      const sidebarNav = sidebar.querySelector("nav");
      // Định vị hiệu ứng chỉ báo ở mục điều hướng đang hoạt động.
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
      updateRoute();
      moveNavIndicator(activeNavLink(), false);
      window.addEventListener("pageshow", () => {
        updateRoute();
        moveNavIndicator(activeNavLink(), false);
      });
      window.addEventListener("resize", () => moveNavIndicator(activeNavLink(), false));
      // Đồng bộ route và chỉ báo khi URL có hash thay đổi.
      window.addEventListener("hashchange", () => moveNavIndicator(activeNavLink(), false));
    })();
  