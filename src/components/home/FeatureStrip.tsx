import { GraduationCap, Globe2, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: GraduationCap,
    enTitle: 'Beginner Friendly',
    viTitle: 'Thân Thiện Với Người Mới',
    enDesc: 'No prior testing experience needed. We start from absolute zero and build up to advanced patterns.',
    viDesc: 'Không cần kinh nghiệm kiểm thử trước đó. Chúng ta bắt đầu từ đầu và xây dựng lên các mô hình nâng cao.',
  },
  {
    icon: Globe2,
    enTitle: 'Bilingual Content',
    viTitle: 'Nội Dung Song Ngữ',
    enDesc: 'Toggle between English and Vietnamese. Code, file names, and technical terms remain in English.',
    viDesc: 'Chuyển đổi giữa tiếng Anh và tiếng Việt. Code, tên file và thuật ngữ kỹ thuật vẫn bằng tiếng Anh.',
  },
  {
    icon: BarChart3,
    enTitle: 'Track Your Progress',
    viTitle: 'Theo Dõi Tiến Độ',
    enDesc: 'Mark lessons complete, maintain a daily streak, and earn milestone badges as you advance.',
    viDesc: 'Đánh dấu bài học hoàn thành, duy trì streak hàng ngày và nhận huy hiệu cột mốc khi tiến bộ.',
  },
]

export function FeatureStrip() {
  return (
    <section className="border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            <span className="lang-en">Why This Roadmap?</span>
            <span className="lang-vi">Tại Sao Chọn Lộ Trình Này?</span>
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.enTitle} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/30">
                  <Icon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                  <span className="lang-en">{f.enTitle}</span>
                  <span className="lang-vi">{f.viTitle}</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  <span className="lang-en">{f.enDesc}</span>
                  <span className="lang-vi">{f.viDesc}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
