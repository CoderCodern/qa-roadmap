export type Day = {
  id: number
  title: string
  titleVi: string
  blurb: string
  blurbVi: string
  estMinutes: number
  tags: string[]
  /** false = content not ready yet; omit or true = published to users */
  available?: boolean
}

export type Phase = {
  id: number
  title: string
  titleVi: string
  weekRange: string
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  iconName: string
  /** Min lessons to complete in THIS phase before the next phase unlocks. */
  unlockThreshold: number
  days: Day[]
}

export const PHASES: Phase[] = [
  {
    id: 1,
    title: 'Test Fundamentals',
    titleVi: 'Kiến Thức Cơ Bản',
    weekRange: 'Week 1',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconName: 'BookOpen',
    unlockThreshold: 5,
    days: [
      { id: 1, title: 'What is software testing?', titleVi: 'Kiểm thử phần mềm là gì?', blurb: 'Manual vs automated — understand the why before the how.', blurbVi: 'Thủ công vs tự động — hiểu lý do trước khi biết cách.', estMinutes: 60, tags: ['fundamentals', 'theory'] },
      { id: 2, title: 'Test types', titleVi: 'Các loại kiểm thử', blurb: 'Functional, regression, smoke, sanity, exploratory.', blurbVi: 'Chức năng, hồi quy, khói, tỉnh táo, khám phá.', estMinutes: 60, tags: ['fundamentals', 'types'] },
      { id: 3, title: 'Test case design', titleVi: 'Thiết kế test case', blurb: 'Equivalence partitioning & boundary values.', blurbVi: 'Phân vùng tương đương & giá trị biên.', estMinutes: 75, tags: ['fundamentals', 'design'] },
      { id: 4, title: 'Bug lifecycle', titleVi: 'Vòng đời của bug', blurb: 'Severity vs priority — write bug reports that get fixed.', blurbVi: 'Mức độ nghiêm trọng vs ưu tiên — viết báo cáo bug hiệu quả.', estMinutes: 60, tags: ['fundamentals', 'bugs'] },
      { id: 5, title: 'SDLC & STLC overview', titleVi: 'Tổng quan SDLC & STLC', blurb: 'Where testing fits in the software development lifecycle.', blurbVi: 'Kiểm thử nằm ở đâu trong vòng đời phát triển phần mềm.', estMinutes: 60, tags: ['fundamentals', 'process'] },
      { id: 6, title: 'The test pyramid', titleVi: 'Kim tự tháp kiểm thử', blurb: 'Unit, integration, E2E — and why the ratio matters.', blurbVi: 'Unit, tích hợp, E2E — tại sao tỷ lệ quan trọng.', estMinutes: 60, tags: ['fundamentals', 'strategy'] },
      { id: 7, title: 'Week 1 review', titleVi: 'Ôn tập tuần 1', blurb: 'Quiz, reflection, and write 5 test cases for a login form.', blurbVi: 'Kiểm tra, suy ngẫm và viết 5 test case cho form đăng nhập.', estMinutes: 90, tags: ['review', 'practice'] },
    ],
  },
  {
    id: 2,
    title: 'Python Basics',
    titleVi: 'Python Cơ Bản',
    weekRange: 'Weeks 2–3',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    iconName: 'Code2',
    unlockThreshold: 10,
    days: [
      { id: 8, title: 'Install Python & VS Code', titleVi: 'Cài Python & VS Code', blurb: 'Get your environment ready and run hello world.', blurbVi: 'Thiết lập môi trường và chạy chương trình đầu tiên.', estMinutes: 60, tags: ['python', 'setup'] },
      { id: 9, title: 'Variables & type hints', titleVi: 'Biến & type hints', blurb: 'Primitives, naming, and why type hints matter.', blurbVi: 'Kiểu nguyên thủy, đặt tên và tại sao type hints quan trọng.', estMinutes: 60, tags: ['python', 'basics'] },
      { id: 10, title: 'Strings & f-strings', titleVi: 'Chuỗi & f-strings', blurb: 'String operations, formatting, and f-string magic.', blurbVi: 'Thao tác chuỗi, định dạng và sức mạnh của f-string.', estMinutes: 60, tags: ['python', 'strings'] },
      { id: 11, title: 'Operators & expressions', titleVi: 'Toán tử & biểu thức', blurb: 'Arithmetic, comparison, logical — the building blocks.', blurbVi: 'Số học, so sánh, logic — những khối nền tảng.', estMinutes: 60, tags: ['python', 'basics'] },
      { id: 12, title: 'if / elif / else', titleVi: 'if / elif / else', blurb: 'Decision-making in Python — control flow fundamentals.', blurbVi: 'Ra quyết định trong Python — nền tảng luồng điều khiển.', estMinutes: 60, tags: ['python', 'control-flow'] },
      { id: 13, title: 'for and while loops', titleVi: 'Vòng lặp for và while', blurb: 'Iterate, repeat, and avoid infinite loops.', blurbVi: 'Lặp, lặp lại và tránh vòng lặp vô hạn.', estMinutes: 60, tags: ['python', 'loops'] },
      { id: 14, title: 'Functions', titleVi: 'Hàm', blurb: 'Define, call, pass params, and return values cleanly.', blurbVi: 'Định nghĩa, gọi, truyền tham số và trả về giá trị rõ ràng.', estMinutes: 75, tags: ['python', 'functions'] },
      { id: 15, title: 'Modules & pip', titleVi: 'Module & pip', blurb: 'Import built-ins, install packages, manage dependencies.', blurbVi: 'Import thư viện có sẵn, cài package, quản lý phụ thuộc.', estMinutes: 60, tags: ['python', 'modules'] },
      { id: 16, title: 'Exception handling', titleVi: 'Xử lý ngoại lệ', blurb: 'try / except / finally — fail gracefully.', blurbVi: 'try / except / finally — thất bại một cách khéo léo.', estMinutes: 60, tags: ['python', 'errors'] },
      { id: 17, title: 'Lists & tuples', titleVi: 'Danh sách & tuple', blurb: 'Ordered collections, indexing, slicing, and iteration.', blurbVi: 'Tập hợp có thứ tự, chỉ mục, cắt lát và lặp.', estMinutes: 60, tags: ['python', 'collections'] },
      { id: 18, title: 'Dicts & sets', titleVi: 'Dict & set', blurb: 'Key-value pairs and unique collections — used everywhere in testing.', blurbVi: 'Cặp key-value và tập hợp duy nhất — dùng nhiều trong kiểm thử.', estMinutes: 60, tags: ['python', 'collections'] },
      { id: 19, title: 'File I/O', titleVi: 'Đọc/Ghi file', blurb: 'Read and write .txt and .json files with context managers.', blurbVi: 'Đọc và ghi file .txt và .json bằng context manager.', estMinutes: 75, tags: ['python', 'files'] },
      { id: 20, title: 'Classes & OOP intro', titleVi: 'Class & OOP cơ bản', blurb: 'Objects, attributes, methods — the basis of Page Object Model.', blurbVi: 'Đối tượng, thuộc tính, phương thức — nền tảng của Page Object Model.', estMinutes: 75, tags: ['python', 'oop'] },
      { id: 21, title: 'Mini project: CLI calculator', titleVi: 'Dự án nhỏ: Máy tính CLI', blurb: 'Build a calculator and write 5 pytest unit tests for it.', blurbVi: 'Xây dựng máy tính và viết 5 unit test bằng pytest.', estMinutes: 120, tags: ['python', 'pytest', 'project'] },
    ],
  },
  {
    id: 3,
    title: 'Playwright',
    titleVi: 'Playwright',
    weekRange: 'Weeks 4–5',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-200 dark:border-green-800',
    iconName: 'Monitor',
    unlockThreshold: 10,
    days: [
      { id: 22, title: 'Browser automation overview', titleVi: 'Tổng quan tự động hóa trình duyệt', blurb: 'Why Playwright, and how to install it.', blurbVi: 'Tại sao dùng Playwright và cách cài đặt.', estMinutes: 60, tags: ['playwright', 'setup'] },
      { id: 23, title: 'First Playwright test', titleVi: 'Test Playwright đầu tiên', blurb: 'page.goto, expect, and your first green test.', blurbVi: 'page.goto, expect và test xanh đầu tiên của bạn.', estMinutes: 60, tags: ['playwright', 'basics'] },
      { id: 24, title: 'Locators', titleVi: 'Locator', blurb: 'Role, text, CSS, XPath — and which to prefer.', blurbVi: 'Role, text, CSS, XPath — và nên dùng cái nào.', estMinutes: 75, tags: ['playwright', 'locators'] },
      { id: 25, title: 'Actions', titleVi: 'Thao tác', blurb: 'click, fill, type, hover, check — all the interactions.', blurbVi: 'click, fill, type, hover, check — tất cả các tương tác.', estMinutes: 60, tags: ['playwright', 'actions'] },
      { id: 26, title: 'Waiting strategies', titleVi: 'Chiến lược chờ', blurb: 'Auto-wait, expect conditions, and avoiding flakiness.', blurbVi: 'Tự động chờ, điều kiện expect và tránh test lỏng.', estMinutes: 75, tags: ['playwright', 'waiting'] },
      { id: 27, title: 'Screenshots & traces', titleVi: 'Ảnh chụp & trace', blurb: 'Capture evidence, record videos, inspect the trace viewer.', blurbVi: 'Thu thập bằng chứng, quay video, kiểm tra trace viewer.', estMinutes: 60, tags: ['playwright', 'debugging'] },
      { id: 28, title: 'Multiple pages & frames', titleVi: 'Nhiều trang & frame', blurb: 'Handle tabs, popups, iframes, and browser contexts.', blurbVi: 'Xử lý tab, popup, iframe và browser context.', estMinutes: 75, tags: ['playwright', 'advanced'] },
      { id: 29, title: 'Page Object Model — concept', titleVi: 'Page Object Model — khái niệm', blurb: 'Why POM makes tests readable and maintainable.', blurbVi: 'Tại sao POM giúp test dễ đọc và bảo trì hơn.', estMinutes: 60, tags: ['playwright', 'pom', 'design'] },
      { id: 30, title: 'Build your first POM', titleVi: 'Xây dựng POM đầu tiên', blurb: 'Implement LoginPage and DashboardPage classes.', blurbVi: 'Triển khai class LoginPage và DashboardPage.', estMinutes: 90, tags: ['playwright', 'pom', 'practice'] },
      { id: 31, title: 'Pytest fixtures & hooks', titleVi: 'Pytest fixture & hook', blurb: 'Setup, teardown, conftest.py — clean test lifecycle.', blurbVi: 'Setup, teardown, conftest.py — vòng đời test sạch.', estMinutes: 75, tags: ['pytest', 'fixtures'] },
      { id: 32, title: 'Data-driven tests', titleVi: 'Test theo dữ liệu', blurb: '@pytest.mark.parametrize — run one test with many inputs.', blurbVi: '@pytest.mark.parametrize — chạy một test với nhiều đầu vào.', estMinutes: 60, tags: ['pytest', 'parametrize'] },
      { id: 33, title: 'Headed vs headless & debugging', titleVi: 'Headed vs headless & debug', blurb: 'Toggle UI, use --headed, pause, and Playwright Inspector.', blurbVi: 'Bật/tắt UI, dùng --headed, tạm dừng và Playwright Inspector.', estMinutes: 60, tags: ['playwright', 'debugging'] },
      { id: 34, title: 'CI with GitHub Actions', titleVi: 'CI với GitHub Actions', blurb: 'Run your tests automatically on every push.', blurbVi: 'Chạy test tự động khi push code.', estMinutes: 75, tags: ['playwright', 'ci', 'github-actions'] },
      { id: 35, title: 'Mini project: 10-test suite', titleVi: 'Dự án nhỏ: bộ 10 test', blurb: 'Write a complete suite against practicesoftwaretesting.com.', blurbVi: 'Viết bộ test hoàn chỉnh cho practicesoftwaretesting.com.', estMinutes: 120, tags: ['playwright', 'project'] },
    ],
  },
  {
    id: 4,
    title: 'API Testing',
    titleVi: 'Kiểm Thử API',
    weekRange: 'Weeks 6–7',
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-800',
    iconName: 'Globe',
    unlockThreshold: 10,
    days: [
      { id: 36, title: 'HTTP basics', titleVi: 'Cơ bản HTTP', blurb: 'Methods, status codes, headers — the language of the web.', blurbVi: 'Phương thức, mã trạng thái, header — ngôn ngữ của web.', estMinutes: 60, tags: ['api', 'http', 'fundamentals'] },
      { id: 37, title: 'REST & JSON', titleVi: 'REST & JSON', blurb: 'REST principles and how JSON structures data.', blurbVi: 'Nguyên tắc REST và cách JSON cấu trúc dữ liệu.', estMinutes: 60, tags: ['api', 'rest', 'json'] },
      { id: 38, title: 'Postman: first request', titleVi: 'Postman: request đầu tiên', blurb: 'Send GET and POST, organize into collections.', blurbVi: 'Gửi GET và POST, tổ chức thành collection.', estMinutes: 60, tags: ['postman', 'api'] },
      { id: 39, title: 'Postman environments', titleVi: 'Postman environment', blurb: 'Variables and environments for dev/staging/prod.', blurbVi: 'Biến và môi trường cho dev/staging/prod.', estMinutes: 60, tags: ['postman', 'variables'] },
      { id: 40, title: 'Postman tests with Chai', titleVi: 'Postman test với Chai', blurb: 'Write assertions in the Tests tab using pm.expect.', blurbVi: 'Viết assertion trong tab Tests bằng pm.expect.', estMinutes: 75, tags: ['postman', 'assertions'] },
      { id: 41, title: 'Newman CLI', titleVi: 'Newman CLI', blurb: 'Data-driven runs and running Postman collections from the terminal.', blurbVi: 'Chạy theo dữ liệu và chạy collection Postman từ terminal.', estMinutes: 60, tags: ['postman', 'newman', 'cli'] },
      { id: 42, title: 'Python requests library', titleVi: 'Thư viện requests Python', blurb: 'GET, POST, headers, params — all in Python.', blurbVi: 'GET, POST, header, param — tất cả trong Python.', estMinutes: 75, tags: ['python', 'requests', 'api'] },
      { id: 43, title: 'pytest + requests', titleVi: 'pytest + requests', blurb: 'Combine requests with pytest to build a proper test suite.', blurbVi: 'Kết hợp requests với pytest để xây dựng bộ test hoàn chỉnh.', estMinutes: 75, tags: ['pytest', 'requests', 'api'] },
      { id: 44, title: 'Schema validation', titleVi: 'Xác thực schema', blurb: 'Validate API response shapes with jsonschema.', blurbVi: 'Xác thực cấu trúc response API bằng jsonschema.', estMinutes: 60, tags: ['api', 'validation', 'jsonschema'] },
      { id: 45, title: 'Authentication', titleVi: 'Xác thực', blurb: 'Basic auth, Bearer tokens, and intro to OAuth2.', blurbVi: 'Basic auth, Bearer token và giới thiệu OAuth2.', estMinutes: 75, tags: ['api', 'auth', 'security'] },
      { id: 46, title: 'Negative testing', titleVi: 'Kiểm thử tiêu cực', blurb: 'Edge cases, invalid input, and error response testing.', blurbVi: 'Trường hợp biên, đầu vào không hợp lệ và kiểm thử response lỗi.', estMinutes: 60, tags: ['api', 'negative-testing'] },
      { id: 47, title: 'Mocking', titleVi: 'Mock', blurb: 'Stub third-party APIs using responses or WireMock.', blurbVi: 'Giả lập API bên thứ ba bằng responses hoặc WireMock.', estMinutes: 75, tags: ['api', 'mocking', 'advanced'] },
      { id: 48, title: 'Combining API + UI tests', titleVi: 'Kết hợp test API + UI', blurb: 'Set state via API, then verify UI — the power move.', blurbVi: 'Thiết lập trạng thái qua API rồi kiểm tra UI — chiêu thức mạnh.', estMinutes: 90, tags: ['playwright', 'api', 'integration'] },
      { id: 49, title: 'Mini project: JSONPlaceholder', titleVi: 'Dự án nhỏ: JSONPlaceholder', blurb: 'Build a complete API test suite for JSONPlaceholder.', blurbVi: 'Xây dựng bộ test API hoàn chỉnh cho JSONPlaceholder.', estMinutes: 120, tags: ['api', 'project', 'pytest'] },
    ],
  },
  {
    id: 5,
    title: 'Capstone & Career',
    titleVi: 'Dự Án Cuối & Sự Nghiệp',
    weekRange: 'Week 8',
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
    iconName: 'Trophy',
    unlockThreshold: 7,
    days: [
      { id: 50, title: 'Framework structure', titleVi: 'Cấu trúc framework', blurb: 'Best practices for organising a real automation framework.', blurbVi: 'Thực hành tốt nhất để tổ chức framework automation thực tế.', estMinutes: 75, tags: ['framework', 'best-practices'] },
      { id: 51, title: 'Allure reports', titleVi: 'Báo cáo Allure', blurb: 'Beautiful test reports that stakeholders can read.', blurbVi: 'Báo cáo test đẹp mà stakeholder có thể đọc.', estMinutes: 60, tags: ['reporting', 'allure'] },
      { id: 52, title: 'Test plans & strategy', titleVi: 'Kế hoạch & chiến lược test', blurb: 'Read and write the documents that guide a QA team.', blurbVi: 'Đọc và viết tài liệu định hướng cho nhóm QA.', estMinutes: 75, tags: ['documentation', 'process'] },
      { id: 53, title: 'Capstone kickoff', titleVi: 'Khởi động dự án cuối', blurb: 'Choose a public demo app and plan your test strategy.', blurbVi: 'Chọn ứng dụng demo công khai và lên kế hoạch chiến lược test.', estMinutes: 60, tags: ['capstone', 'planning'] },
      { id: 54, title: 'Capstone: UI flows', titleVi: 'Capstone: luồng UI', blurb: 'Implement Playwright tests for all critical user journeys.', blurbVi: 'Triển khai Playwright test cho tất cả hành trình người dùng quan trọng.', estMinutes: 120, tags: ['capstone', 'playwright'] },
      { id: 55, title: 'Capstone: API + integration', titleVi: 'Capstone: API + tích hợp', blurb: 'Add API tests and wire the full suite with CI.', blurbVi: 'Thêm test API và kết nối toàn bộ bộ test với CI.', estMinutes: 120, tags: ['capstone', 'api', 'ci'] },
      { id: 56, title: 'Wrap-up & next steps', titleVi: 'Tổng kết & bước tiếp theo', blurb: 'Portfolio tips, certifications, and what to learn next.', blurbVi: 'Mẹo portfolio, chứng chỉ và những gì cần học tiếp theo.', estMinutes: 60, tags: ['career', 'portfolio'] },
    ],
  },
]

export function getAllDays(): Day[] {
  return PHASES.flatMap((p) => p.days)
}

export function getDayById(id: number): Day | undefined {
  return getAllDays().find((d) => d.id === id)
}

export function getPhaseForDay(id: number): Phase | undefined {
  return PHASES.find((p) => p.days.some((d) => d.id === id))
}

export function getPrevDay(id: number): Day | undefined {
  return id > 1 ? getDayById(id - 1) : undefined
}

export function getNextDay(id: number): Day | undefined {
  return id < 56 ? getDayById(id + 1) : undefined
}
