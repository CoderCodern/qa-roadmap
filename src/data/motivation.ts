const messages = [
  { en: 'Every expert was once a beginner. Keep going!', vi: 'Mọi chuyên gia đều từng là người mới bắt đầu. Tiếp tục nào!' },
  { en: 'One lesson a day keeps the bugs at bay.', vi: 'Mỗi ngày một bài học, bug sẽ dần xa bạn.' },
  { en: "You're building real skills that employers pay for.", vi: 'Bạn đang xây dựng kỹ năng thực sự mà nhà tuyển dụng trả tiền.' },
  { en: 'The best time to learn testing was yesterday. Today is second best.', vi: 'Thời điểm tốt nhất để học testing là hôm qua. Hôm nay là tốt thứ hai.' },
  { en: 'A tested codebase is a confident codebase.', vi: 'Codebase được kiểm thử là codebase tự tin.' },
  { en: 'Small consistent steps beat big erratic leaps.', vi: 'Những bước nhỏ đều đặn thắng những bước nhảy lớn thất thường.' },
  { en: 'Finding bugs before users do — that\'s your superpower.', vi: 'Tìm bug trước người dùng — đó là siêu năng lực của bạn.' },
  { en: 'Automation lets you sleep while your tests work.', vi: 'Tự động hóa giúp bạn ngủ trong khi test vẫn đang chạy.' },
  { en: "Today's confusion is tomorrow's clarity.", vi: 'Sự bối rối hôm nay là sự rõ ràng của ngày mai.' },
  { en: 'Quality is not an act, it is a habit.', vi: 'Chất lượng không phải là một hành động, đó là một thói quen.' },
  { en: 'You\'ve got this. Open the lesson.', vi: 'Bạn làm được. Mở bài học thôi.' },
  { en: 'Each completed day is a skill permanently in your toolkit.', vi: 'Mỗi ngày hoàn thành là một kỹ năng mãi mãi trong bộ công cụ của bạn.' },
  { en: 'The test pyramid won\'t build itself!', vi: 'Kim tự tháp test sẽ không tự xây đâu!' },
  { en: 'Consistency compounds. Show up again today.', vi: 'Tính nhất quán tích lũy. Hãy xuất hiện thêm một lần nữa hôm nay.' },
  { en: 'Every green test run is a tiny victory. Collect them all.', vi: 'Mỗi lần test pass là một chiến thắng nhỏ. Thu thập tất cả chúng.' },
]

export function getDailyMotivation(lang: 'en' | 'vi' = 'en', seed?: number): string {
  const idx = (seed ?? new Date().getDate()) % messages.length
  return messages[idx][lang]
}

export function getCompletionMotivation(lang: 'en' | 'vi' = 'en'): string {
  const completionMessages = {
    en: [
      '🎉 Lesson complete! You\'re one step closer to your goal.',
      '✅ Great work! Keep that streak alive.',
      '🚀 Another day done. The journey continues!',
      '⭐ You showed up. That\'s what matters most.',
    ],
    vi: [
      '🎉 Hoàn thành bài học! Bạn đang tiến gần hơn đến mục tiêu.',
      '✅ Làm tốt lắm! Hãy giữ streak của bạn.',
      '🚀 Thêm một ngày nữa hoàn thành. Hành trình vẫn tiếp tục!',
      '⭐ Bạn đã xuất hiện. Đó là điều quan trọng nhất.',
    ],
  }
  const arr = completionMessages[lang]
  const idx = new Date().getDate() % arr.length
  return arr[idx]
}
