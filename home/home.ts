/**
 * Slanguage - Learner Dashboard TypeScript Logic
 * Manages dynamic language switching (English, Japanese, Vietnamese),
 * flashcard interactions, XP tracker, streak logic, and lesson preview modal.
 */

// Interface for language specific data
interface LanguageData {
  id: 'en' | 'ja' | 'vi';
  name: string;
  nativeName: string;
  flag: string;
  flagImg: string;
  courseTitle: string;
  currentLesson: string;
  lessonProgress: number;
  totalWordsLearned: number;
  level: string;
  flashcard: {
    tag: string;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
  };
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

// Language database for English, Japanese, Vietnamese
const languagesDB: Record<string, LanguageData> = {
  ja: {
    id: 'ja',
    name: 'Tiếng Nhật',
    nativeName: '日本語',
    flag: '🇯🇵',
    flagImg: '../assets/flags/flag-jp.png',
    courseTitle: 'Tiếng Nhật Sơ Cấp JLPT N5',
    currentLesson: 'Bài 14: Gọi món trong quán ăn Tokyo & Mẫu câu V-tai desu',
    lessonProgress: 72,
    totalWordsLearned: 380,
    level: 'Sơ Cấp N5',
    flashcard: {
      tag: 'Kanji & Từ Vựng N5',
      word: '美味しい (Oishii)',
      phonetic: '/oɪ.ʃiː/ - [Tính từ đuôi い]',
      meaning: 'Ngon miệng, thơm ngon',
      example: '「このラーメンはとても美味しいですね！」(Món ramen này thực sự rất ngon!)'
    },
    quizQuestion: {
      question: 'Chọn từ tiếng Nhật đúng nghĩa với: "Cảm ơn rất nhiều"',
      options: ['Arigatou gozaimasu', 'Konnichiwa', 'Sayounara', 'Sumimasen'],
      correctIndex: 0
    }
  },
  en: {
    id: 'en',
    name: 'Tiếng Anh',
    nativeName: 'English',
    flag: '🇬🇧',
    flagImg: '../assets/flags/flag-en.png',
    courseTitle: 'English for Global Workplace & Fluency',
    currentLesson: 'Unit 9: Business Negotiation & Idiomatic Expressions',
    lessonProgress: 85,
    totalWordsLearned: 1450,
    level: 'Trung Cấp B2',
    flashcard: {
      tag: 'Business Idiom',
      word: 'Hit the nail on the head',
      phonetic: '/hɪt ðə neɪl ɒn ðə hed/',
      meaning: 'Nói trúng phóc, hoàn toàn chính xác',
      example: '"Your analysis of the market problem really hit the nail on the head."'
    },
    quizQuestion: {
      question: 'Which word is synonymous with "Meticulous"?',
      options: ['Careful and precise', 'Extremely angry', 'Very slow', 'Casual'],
      correctIndex: 0
    }
  },
  vi: {
    id: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    flagImg: '../assets/flags/flag-vn.png',
    courseTitle: 'Tiếng Việt Ứng Dụng & Giao Tiếp Đời Sống',
    currentLesson: 'Bài 6: Văn hóa ứng xử & Thành ngữ thường dùng',
    lessonProgress: 94,
    totalWordsLearned: 2100,
    level: 'Bản Xứ / Chuyên Sâu',
    flashcard: {
      tag: 'Thành Ngữ Dân Gian',
      word: 'Học ăn, học nói',
      phonetic: '/hɔkʔ aːn hɔkʔ nɔj˧˥/',
      meaning: 'Học hỏi những điều căn bản và văn minh trong cách ứng xử',
      example: '"Người xưa luôn răn dạy: Học ăn, học nói, học gói, học mở."'
    },
    quizQuestion: {
      question: 'Thành ngữ nào có ý nghĩa tương đương với "Kiên trì ắt thành công"?',
      options: ['Có công mài sắt có ngày nên kim', 'Ăn quả nhớ kẻ trồng cây', 'Một con ngựa đau cả tàu bỏ cỏ', 'Gần mực thì đen gần đèn thì rạng'],
      correctIndex: 0
    }
  }
};

class SlanguageDashboard {
  private currentLang: 'en' | 'ja' | 'vi' = 'ja';
  private currentXP: number = 2450;
  private currentStreak: number = 14;

  constructor() {
    this.init();
  }

  private init(): void {
    // Check saved language or default to Japanese
    const savedLang = localStorage.getItem('slanguage_active_language') as 'en' | 'ja' | 'vi';
    if (savedLang && languagesDB[savedLang]) {
      this.currentLang = savedLang;
    }

    // Check saved XP
    const savedXP = localStorage.getItem('slanguage_user_xp');
    if (savedXP) {
      this.currentXP = parseInt(savedXP, 10);
    }

    // Check saved user name
    const savedUserName = localStorage.getItem('slanguage_user_name');
    if (savedUserName) {
      document.querySelectorAll('.user-info-text .name').forEach(el => {
        el.textContent = savedUserName;
      });
    }

    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    // Top Language Dropdown Toggle
    const langDropdown = document.getElementById('langDropdown');
    const langDropdownBtn = document.getElementById('langDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userDropdownBtn = document.getElementById('userDropdownBtn');

    if (langDropdown && langDropdownBtn) {
      langDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
        const isOpen = langDropdown.classList.contains('open');
        langDropdownBtn.setAttribute('aria-expanded', isOpen.toString());
        if (userDropdown && userDropdownBtn) {
          userDropdown.classList.remove('open');
          userDropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('click', (e) => {
        if (!langDropdown.contains(e.target as Node)) {
          langDropdown.classList.remove('open');
          langDropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // User Account Dropdown Toggle
    if (userDropdown && userDropdownBtn) {
      userDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('open');
        const isOpen = userDropdown.classList.contains('open');
        userDropdownBtn.setAttribute('aria-expanded', isOpen.toString());
        if (langDropdown && langDropdownBtn) {
          langDropdown.classList.remove('open');
          langDropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target as Node)) {
          userDropdown.classList.remove('open');
          userDropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Language Dropdown Items
    const langDropdownItems = document.querySelectorAll<HTMLButtonElement>('.lang-dropdown-item');
    langDropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const lang = (e.currentTarget as HTMLElement).getAttribute('data-lang') as 'en' | 'ja' | 'vi';
        if (lang) {
          this.switchLanguage(lang);
          if (langDropdown && langDropdownBtn) {
            langDropdown.classList.remove('open');
            langDropdownBtn.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });

    // Backward-compat for any lang-btn
    const topLangBtns = document.querySelectorAll<HTMLButtonElement>('.lang-btn');
    topLangBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = (e.currentTarget as HTMLElement).getAttribute('data-lang') as 'en' | 'ja' | 'vi';
        if (lang) this.switchLanguage(lang);
      });
    });

    // Language cards in section
    const langCards = document.querySelectorAll<HTMLElement>('.lang-card');
    langCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const lang = (e.currentTarget as HTMLElement).getAttribute('data-lang') as 'en' | 'ja' | 'vi';
        if (lang) this.switchLanguage(lang);
      });
    });

    // Flashcard Flip
    const flashcardBox = document.getElementById('flashcardBox');
    if (flashcardBox) {
      flashcardBox.addEventListener('click', () => {
        flashcardBox.classList.toggle('flipped');
      });
    }

    // Flashcard response buttons
    const btnKnow = document.getElementById('btnFlashcardKnow');
    const btnAgain = document.getElementById('btnFlashcardAgain');

    if (btnKnow) {
      btnKnow.addEventListener('click', () => {
        this.addXP(15);
        this.showToast('Tuyệt vời! +15 XP vào kho báu học tập 🎉');
        if (flashcardBox) flashcardBox.classList.remove('flipped');
      });
    }

    if (btnAgain) {
      btnAgain.addEventListener('click', () => {
        this.showToast('Đã thêm từ này vào danh sách cần ôn lại hôm nay 📌');
        if (flashcardBox) flashcardBox.classList.remove('flipped');
      });
    }

    // Modal lesson quiz trigger
    const btnResumeLesson = document.getElementById('btnResumeLesson');
    const lessonModal = document.getElementById('lessonModalOverlay');
    const modalClose = document.getElementById('modalCloseBtn');

    if (btnResumeLesson && lessonModal) {
      btnResumeLesson.addEventListener('click', () => {
        this.openQuizModal();
      });
    }

    if (modalClose && lessonModal) {
      modalClose.addEventListener('click', () => {
        lessonModal.classList.remove('active');
      });
    }

    // Listen audio simulation button
    const btnListenAudio = document.getElementById('btnListenAudio');
    if (btnListenAudio) {
      btnListenAudio.addEventListener('click', () => {
        this.playAudioSimulation();
      });
    }

    // Page navigation transitions
    this.bindPageTransitions();

    // Reset and mute video if page is shown from bfcache or when hidden
    window.addEventListener('pageshow', () => {
      const overlay = document.getElementById('slanguageLoadingOverlay');
      const video = document.getElementById('loadingVideoPlayer') as HTMLVideoElement;
      if (overlay) overlay.classList.remove('active');
      if (video) {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      }
    });

    window.addEventListener('pagehide', () => {
      const video = document.getElementById('loadingVideoPlayer') as HTMLVideoElement;
      if (video) {
        video.pause();
        video.muted = true;
      }
    });
  }

  private bindPageTransitions(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (
        href && 
        !href.startsWith('#') && 
        !href.startsWith('javascript:') && 
        !link.hasAttribute('target')
      ) {
        link.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault();
          this.triggerLoadingAndRedirect(href);
        });
      }
    });
  }

  private triggerLoadingAndRedirect(targetUrl: string, duration: number = 1500): void {
    const overlay = document.getElementById('slanguageLoadingOverlay');
    const video = document.getElementById('loadingVideoPlayer') as HTMLVideoElement;
    if (overlay) {
      overlay.classList.add('active');
      if (video) {
        video.muted = false;
        video.volume = 1.0;
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            video.play();
          });
        }
      }
    }
    setTimeout(() => {
      if (video) {
        video.pause();
        video.muted = true;
      }
      if (overlay) {
        overlay.classList.remove('active');
      }
      window.location.href = targetUrl;
    }, duration);
  }

  public switchLanguage(lang: 'en' | 'ja' | 'vi'): void {
    this.currentLang = lang;
    localStorage.setItem('slanguage_active_language', lang);
    this.render();
    this.showToast(`Đã chuyển sang học: ${languagesDB[lang].name} ${languagesDB[lang].flag}`);
  }

  private addXP(points: number): void {
    this.currentXP += points;
    localStorage.setItem('slanguage_user_xp', this.currentXP.toString());
    const xpBadge = document.getElementById('headerXPVal');
    if (xpBadge) {
      xpBadge.textContent = `${this.currentXP.toLocaleString()} XP`;
    }
  }

  private render(): void {
    const data = languagesDB[this.currentLang];
    if (!data) return;

    // Update active state in top navbar & dropdown
    document.querySelectorAll<HTMLButtonElement>('.lang-dropdown-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-lang') === this.currentLang);
    });

    document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
    });

    // Update current selected language label & flag on dropdown button
    const currentLangLabel = document.getElementById('currentLangLabel');
    const currentLangFlag = document.getElementById('currentLangFlag') as HTMLImageElement;
    if (currentLangLabel) {
      currentLangLabel.textContent = data.name;
    }
    if (currentLangFlag) {
      currentLangFlag.src = data.flagImg;
      currentLangFlag.alt = data.name;
    }

    // Update active card in showcase grid
    document.querySelectorAll<HTMLElement>('.lang-card').forEach(card => {
      card.classList.toggle('active-selected', card.getAttribute('data-lang') === this.currentLang);
    });

    // Update Hero elements
    const heroLangBadge = document.getElementById('heroActiveLang');
    if (heroLangBadge) {
      heroLangBadge.innerHTML = `<img src="${data.flagImg}" alt="${data.name}" class="flag-icon-badge"> <span>${data.name}</span>`;
    }

    const heroSubtitle = document.getElementById('heroCourseTitle');
    if (heroSubtitle) {
      heroSubtitle.textContent = `Lộ trình: ${data.courseTitle}`;
    }

    const heroLessonName = document.getElementById('heroLessonName');
    if (heroLessonName) {
      heroLessonName.textContent = data.currentLesson;
    }

    const heroProgressPercent = document.getElementById('heroProgressPercent');
    const heroProgressFill = document.getElementById('heroProgressFill');
    if (heroProgressPercent && heroProgressFill) {
      heroProgressPercent.textContent = `${data.lessonProgress}%`;
      heroProgressFill.style.width = `${data.lessonProgress}%`;
    }

    // Update Flashcard
    const fcTag = document.getElementById('fcTag');
    const fcWord = document.getElementById('fcWord');
    const fcPhonetic = document.getElementById('fcPhonetic');
    const fcMeaning = document.getElementById('fcMeaning');
    const fcExample = document.getElementById('fcExample');

    if (fcTag) fcTag.textContent = data.flashcard.tag;
    if (fcWord) fcWord.textContent = data.flashcard.word;
    if (fcPhonetic) fcPhonetic.textContent = data.flashcard.phonetic;
    if (fcMeaning) fcMeaning.textContent = data.flashcard.meaning;
    if (fcExample) fcExample.textContent = data.flashcard.example;

    // Reset flipped state
    const flashcardBox = document.getElementById('flashcardBox');
    if (flashcardBox) flashcardBox.classList.remove('flipped');
  }

  private openQuizModal(): void {
    const data = languagesDB[this.currentLang];
    const modal = document.getElementById('lessonModalOverlay');
    const quizTitle = document.getElementById('quizModalTitle');
    const quizContainer = document.getElementById('quizOptionsContainer');
    const quizFeedback = document.getElementById('quizFeedback');

    if (!modal || !quizTitle || !quizContainer) return;

    quizTitle.textContent = `${data.flag} Bài Luyện Nhanh: ${data.name}`;
    quizContainer.innerHTML = '';
    if (quizFeedback) quizFeedback.innerHTML = '';

    const q = data.quizQuestion;
    const questionText = document.getElementById('quizQuestionText');
    if (questionText) questionText.textContent = q.question;

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}`;
      btn.addEventListener('click', () => {
        this.handleQuizAnswer(idx, q.correctIndex, btn);
      });
      quizContainer.appendChild(btn);
    });

    modal.classList.add('active');
  }

  private handleQuizAnswer(selectedIdx: number, correctIdx: number, btnElement: HTMLElement): void {
    const feedback = document.getElementById('quizFeedback');
    const buttons = document.querySelectorAll<HTMLButtonElement>('.quiz-option-btn');
    buttons.forEach(b => (b.disabled = true));

    if (selectedIdx === correctIdx) {
      btnElement.classList.add('selected-correct');
      if (feedback) {
        feedback.innerHTML = `
          <div style="background: #E0F2FE; border: 1px solid #0077B6; color: #0077B6; padding: 14px; border-radius: 12px; margin-top: 14px; font-weight: 700;">
            <i class="fa-solid fa-circle-check"></i> Chính xác tuyệt đối! +20 XP đã được cộng!
          </div>
        `;
      }
      this.addXP(20);
    } else {
      btnElement.style.background = '#FDE8EC';
      btnElement.style.borderColor = '#DC143C';
      btnElement.style.color = '#9E002B';
      if (feedback) {
        feedback.innerHTML = `
          <div style="background: #FDE8EC; border: 1px solid #DC143C; color: #9E002B; padding: 14px; border-radius: 12px; margin-top: 14px; font-weight: 600;">
            <i class="fa-solid fa-circle-xmark"></i> Chưa chính xác rồi, hãy thử ôn tập lại từ này nhé!
          </div>
        `;
      }
    }
  }

  private playAudioSimulation(): void {
    const data = languagesDB[this.currentLang];
    this.showToast(`🔊 Đang phát phát âm mẫu (${data.name})...`);

    // Use Web Speech API if supported in browser
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.flashcard.word);
      if (this.currentLang === 'ja') utterance.lang = 'ja-JP';
      else if (this.currentLang === 'vi') utterance.lang = 'vi-VN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  private showToast(message: string): void {
    let toast = document.getElementById('dashboardToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dashboardToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '28px';
      toast.style.right = '28px';
      toast.style.background = '#061A28';
      toast.style.color = '#FFB703';
      toast.style.border = '2px solid #FFB703';
      toast.style.padding = '14px 22px';
      toast.style.borderRadius = '14px';
      toast.style.boxShadow = '0 10px 25px rgba(6, 26, 40, 0.5)';
      toast.style.fontWeight = '700';
      toast.style.fontSize = '0.95rem';
      toast.style.zIndex = '3000';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
      }
    }, 2800);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new SlanguageDashboard();
});
