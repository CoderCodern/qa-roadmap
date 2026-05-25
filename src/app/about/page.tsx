import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'About the 8-week QA automation roadmap — what it is, who it\'s for, and how to use it.',
}

const sources = [
  { title: 'ISTQB Foundation Syllabus', url: 'https://www.istqb.org/' },
  { title: 'Ministry of Testing', url: 'https://www.ministryoftesting.com/' },
  { title: 'Test Automation University', url: 'https://testautomationu.applitools.com/' },
  { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
  { title: 'Real Python', url: 'https://realpython.com/' },
  { title: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com/' },
  { title: 'Playwright for Python', url: 'https://playwright.dev/python/' },
  { title: 'Postman Learning Center', url: 'https://learning.postman.com/' },
  { title: 'MDN Web Docs — HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  { title: 'requests library docs', url: 'https://requests.readthedocs.io/' },
  { title: 'The Test Pyramid (Martin Fowler)', url: 'https://martinfowler.com/articles/practical-test-pyramid.html' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        <span className="lang-en">About This Roadmap</span>
        <span className="lang-vi">Về Lộ Trình Này</span>
      </h1>

      <div className="prose prose-gray prose-lg dark:prose-invert max-w-none">
        <div className="lang-en">
          <h2>What is this?</h2>
          <p>
            This is a free, self-paced 8-week curriculum designed to take an absolute beginner from no testing
            experience to a job-ready QA automation engineer. It covers test fundamentals, Python programming,
            Playwright for browser automation, and API testing with Postman and <code>requests</code>.
          </p>
          <h2>Who is it for?</h2>
          <ul>
            <li>Manual testers wanting to level up to automation</li>
            <li>Developers curious about QA practices</li>
            <li>Career switchers entering software testing</li>
            <li>Students preparing for junior QA roles</li>
          </ul>
          <h2>How to use it</h2>
          <p>
            Open a lesson each day, read the concept, try the code demo, complete the exercise, and answer the
            quick quiz. Mark the lesson complete with the button in the right rail — your progress is saved
            locally in your browser, no account needed.
          </p>
          <p>
            Aim for ~1–2 hours per day. Some days (mini-projects) may take longer. The daily streak counter
            encourages consistency — it resets if you skip a calendar day.
          </p>
          <h2>Bilingual support</h2>
          <p>
            Toggle between English and Vietnamese using the <strong>EN / VI</strong> button in the header.
            Code blocks, file names, and technical terms always remain in English.
          </p>
          <h2>Tech stack</h2>
          <p>
            Built with Next.js 14 (App Router), TypeScript, Tailwind CSS v3, MDX, Zustand, and
            rehype-pretty-code for syntax highlighting. Deployed statically to Vercel.
          </p>
        </div>

        <div className="lang-vi">
          <h2>Đây là gì?</h2>
          <p>
            Đây là chương trình học 8 tuần miễn phí, tự học theo tốc độ cá nhân, được thiết kế để đưa người mới
            hoàn toàn không có kinh nghiệm kiểm thử trở thành kỹ sư QA automation sẵn sàng đi làm. Bao gồm kiến
            thức cơ bản về kiểm thử, lập trình Python, Playwright cho tự động hóa trình duyệt và kiểm thử API với
            Postman và <code>requests</code>.
          </p>
          <h2>Dành cho ai?</h2>
          <ul>
            <li>Tester thủ công muốn nâng cấp lên tự động hóa</li>
            <li>Developer tò mò về quy trình QA</li>
            <li>Người chuyển ngành muốn vào lĩnh vực kiểm thử phần mềm</li>
            <li>Sinh viên chuẩn bị cho vị trí QA junior</li>
          </ul>
          <h2>Cách sử dụng</h2>
          <p>
            Mở một bài học mỗi ngày, đọc khái niệm, thử demo code, hoàn thành bài tập và trả lời câu hỏi nhanh.
            Đánh dấu bài học hoàn thành bằng nút trong thanh bên phải — tiến độ của bạn được lưu cục bộ trong
            trình duyệt, không cần tài khoản.
          </p>
          <p>
            Mục tiêu ~1–2 giờ mỗi ngày. Một số ngày (dự án nhỏ) có thể mất nhiều hơn. Bộ đếm streak hàng ngày
            khuyến khích tính nhất quán — nó đặt lại nếu bạn bỏ qua một ngày lịch.
          </p>
          <h2>Hỗ trợ song ngữ</h2>
          <p>
            Chuyển đổi giữa tiếng Anh và tiếng Việt bằng nút <strong>EN / VI</strong> ở header.
            Code, tên file và thuật ngữ kỹ thuật luôn bằng tiếng Anh.
          </p>
          <h2>Tech stack</h2>
          <p>
            Được xây dựng bằng Next.js 14 (App Router), TypeScript, Tailwind CSS v3, MDX, Zustand và
            rehype-pretty-code để highlight cú pháp. Triển khai tĩnh lên Vercel.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">Trusted Sources</span>
          <span className="lang-vi">Nguồn Tham Khảo</span>
        </h2>
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.url} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 shrink-0 text-brand-500" />
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline dark:text-brand-400"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <span className="lang-en">View the Full Roadmap →</span>
          <span className="lang-vi">Xem lộ trình đầy đủ →</span>
        </Link>
      </div>
    </div>
  )
}
