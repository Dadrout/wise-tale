export type Language = 'en' | 'ru';

export interface Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Navigation
  home: string;
  profile: string;
  logout: string;
  login: string;
  
  // Generation form
  subject: string;
  topic: string;
  generateVideo: string;
  generating: string;
  
  // Subjects
  history: string;
  geography: string;
  philosophy: string;
  
  // Status messages
  selectSubject: string;
  enterTopic: string;
  generationComplete: string;
  generationFailed: string;
  
  // Profile
  welcome: string;
  myVideos: string;
  settings: string;
  
  // Auth
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;

  // Landing page
  landing: {
    hero: {
      badge: string;
      title1: string;
      title2: string;
      subtitle: string;
      startLearning: string;
      watchDemo: string;
      demoTitle: string;
      demoDescription: string;
    };
    howItWorks: {
      title: string;
      subtitle: string;
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
    };
    features: {
      title: string;
      subtitle: string;
      voiceoverTitle: string;
      voiceoverDesc: string;
      storyTitle: string;
      storyDesc: string;
      quizzesTitle: string;
      quizzesDesc: string;
      lengthTitle: string;
      lengthDesc: string;
      multiAgeTitle: string;
      multiAgeDesc: string;
      curriculumTitle: string;
      curriculumDesc: string;
    };
    pricing: {
      title: string;
      subtitle: string;
      freePlan: string;
      freePrice: string;
      freeDesc: string;
      freeFeature1: string;
      freeFeature2: string;
      freeFeature3: string;
      freeFeature4: string;
      freeFeature5: string;
      tryFree: string;
      
      premiumPlan: string;
      premiumPrice: string;
      premiumDesc: string;
      premiumFeature1: string;
      premiumFeature2: string;
      premiumFeature3: string;
      premiumFeature4: string;
      premiumFeature5: string;
      premiumFeature6: string;
      premiumFeature7: string;
      getPremium: string;
      mostPopular: string;
      
      familyPlan: string;
      familyPrice: string;
      familyDesc: string;
      familyFeature1: string;
      familyFeature2: string;
      familyFeature3: string;
      familyFeature4: string;
      familyFeature5: string;
      familyFeature6: string;
      familyFeature7: string;
      startFamilyTrial: string;
      
      guaranteeText: string;
      cancelAnytime: string;
      noSetupFees: string;
      securePayments: string;
    };
    
    testimonials: {
      title: string;
      subtitle: string;
      teacher1Name: string;
      teacher1Role: string;
      teacher1Quote: string;
      teacher2Name: string;
      teacher2Role: string;
      teacher2Quote: string;
      parent1Name: string;
      parent1Role: string;
      parent1Quote: string;
    };
    
    cta: {
      title: string;
      subtitle: string;
      privacyNote: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: "WiseTale",
    subtitle: "AI-Powered Educational Storytelling",
    
    // Navigation
    home: "Home",
    profile: "Profile", 
    logout: "Logout",
    login: "Login",
    
    // Generation form
    subject: "Subject",
    topic: "Topic",
    generateVideo: "Generate Video",
    generating: "Generating...",
    
    // Subjects
    history: "History",
    geography: "Geography", 
    philosophy: "Philosophy",
    
    // Status messages
    selectSubject: "Please select a subject",
    enterTopic: "Please enter a topic",
    generationComplete: "Video generated successfully!",
    generationFailed: "Generation failed. Please try again.",
    
    // Profile
    welcome: "Welcome",
    myVideos: "My Videos",
    settings: "Settings",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",

    // Landing page
    landing: {
      hero: {
        badge: "AI-Powered Learning",
        title1: "Transform Learning Into",
        title2: "Magical Stories",
        subtitle: "AI-powered educational storytelling platform that transforms complex humanities topics into engaging animated fairy tales for students aged 10-18.",
        startLearning: "Start Learning",
        watchDemo: "Watch Demo",
        demoTitle: "See WiseTale in Action",
        demoDescription: "Watch how we transform complex history topics into engaging fairy tale stories",
      },
      howItWorks: {
        title: "Learning Made Simple",
        subtitle: "Transform any humanities topic into an engaging story in just three easy steps",
        step1Title: "1. Choose Topic",
        step1Desc: "Select any humanities subject - history, philosophy, geography, or literature",
        step2Title: "2. Let AI Narrate",
        step2Desc: "Our AI transforms complex topics into engaging, easy-to-understand fairy tales",
        step3Title: "3. Watch & Listen",
        step3Desc: "Enjoy beautiful animations with professional voiceover and interactive quizzes",
      },
      features: {
        title: "Magical Learning Features",
        subtitle: "Everything you need to make humanities education engaging and memorable",
        voiceoverTitle: "Professional Voiceover",
        voiceoverDesc: "High-quality AI narration brings stories to life with engaging character voices",
        storyTitle: "Story-Style Learning",
        storyDesc: "Complex topics explained through memorable narratives and characters",
        quizzesTitle: "Interactive Quizzes",
        quizzesDesc: "Test understanding with fun quizzes that reinforce key concepts",
        lengthTitle: "Perfect Length",
        lengthDesc: "3-5 minute stories designed for optimal attention spans and retention",
        multiAgeTitle: "Multi-Age Appeal",
        multiAgeDesc: "Content that engages students, parents, and teachers alike",
        curriculumTitle: "Curriculum Aligned",
        curriculumDesc: "Stories designed to complement school curricula and learning objectives",
      },
      pricing: {
        title: "Choose Your Learning Adventure",
        subtitle: "Start free and unlock unlimited magical learning experiences",
        freePlan: "Free Explorer",
        freePrice: "$0",
        freeDesc: "Perfect for trying out WiseTale",
        freeFeature1: "3 stories per month",
        freeFeature2: "Basic history & geography",
        freeFeature3: "Standard quality audio",
        freeFeature4: "Simple quizzes",
        freeFeature5: "Mobile & web access",
        tryFree: "Try Free",
        
        premiumPlan: "Premium Storyteller",
        premiumPrice: "$9.99",
        premiumDesc: "Unlimited learning adventures",
        premiumFeature1: "Unlimited stories",
        premiumFeature2: "All subjects & topics",
        premiumFeature3: "Premium HD audio & visuals",
        premiumFeature4: "Interactive quizzes & games",
        premiumFeature5: "Progress tracking",
        premiumFeature6: "Offline downloads",
        premiumFeature7: "Priority support",
        getPremium: "Get Premium",
        mostPopular: "Most Popular",
        
        familyPlan: "Family Adventure",
        familyPrice: "$19.99",
        familyDesc: "Perfect for families & homeschooling",
        familyFeature1: "Everything in Premium",
        familyFeature2: "Up to 6 family profiles",
        familyFeature3: "Parental controls & reports",
        familyFeature4: "Age-appropriate content",
        familyFeature5: "Family learning goals",
        familyFeature6: "Homeschool curriculum guide",
        familyFeature7: "Priority family support",
        startFamilyTrial: "Start Family Trial",
        
        guaranteeText: "All plans include our 30-day money-back guarantee",
        cancelAnytime: "Cancel anytime",
        noSetupFees: "No setup fees",
        securePayments: "Secure payments",
      },
      
      testimonials: {
        title: "Stories That Inspire",
        subtitle: "See how WiseTale transforms learning experiences for students and educators",
        teacher1Name: "Ms. Sarah Johnson",
        teacher1Role: "8th Grade History Teacher",
        teacher1Quote: "My students are actually excited about history class now! The Roman Empire story had them completely engaged.",
        teacher2Name: "Dr. Robert Chen",
        teacher2Role: "Philosophy Professor",
        teacher2Quote: "Finally, a way to make philosophy accessible to teenagers. The Socrates story was brilliant!",
        parent1Name: "Lisa Martinez",
        parent1Role: "Parent of 7th Grader",
        parent1Quote: "My daughter went from hating geography to asking for more stories about different countries!",
      },
      
      cta: {
        title: "Ready to Transform Learning?",
        subtitle: "Join thousands of educators and students who are making learning magical with WiseTale",
        privacyNote: "Get early access and exclusive updates. No spam, ever.",
      },
    },
  },
  
  ru: {
    // Header
    title: "WiseTale",
    subtitle: "Образовательные истории с ИИ",
    
    // Navigation
    home: "Главная",
    profile: "Профиль",
    logout: "Выйти", 
    login: "Войти",
    
    // Generation form
    subject: "Предмет",
    topic: "Тема",
    generateVideo: "Создать видео",
    generating: "Создание...",
    
    // Subjects
    history: "История",
    geography: "География",
    philosophy: "Философия",
    
    // Status messages
    selectSubject: "Пожалуйста, выберите предмет",
    enterTopic: "Пожалуйста, введите тему",
    generationComplete: "Видео успешно создано!",
    generationFailed: "Ошибка создания. Попробуйте снова.",
    
    // Profile
    welcome: "Добро пожаловать",
    myVideos: "Мои видео",
    settings: "Настройки",
    
    // Auth
    signIn: "Войти",
    signUp: "Регистрация",
    signOut: "Выйти",
    email: "Электронная почта", 
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    forgotPassword: "Забыли пароль?",
    createAccount: "Создать аккаунт",
    alreadyHaveAccount: "Уже есть аккаунт?",
    dontHaveAccount: "Нет аккаунта?",

    // Landing page
    landing: {
      hero: {
        badge: "Обучение с ИИ",
        title1: "Превратите обучение в",
        title2: "Волшебные истории",
        subtitle: "Платформа образовательного сторителлинга с ИИ, которая превращает сложные гуманитарные темы в увлекательные анимированные сказки для учеников 10-18 лет.",
        startLearning: "Начать обучение",
        watchDemo: "Посмотреть демо",
        demoTitle: "Посмотрите WiseTale в действии",
        demoDescription: "Смотрите, как мы превращаем сложные исторические темы в увлекательные сказочные истории",
      },
      howItWorks: {
        title: "Обучение стало простым",
        subtitle: "Превратите любую гуманитарную тему в увлекательную историю всего за три простых шага",
        step1Title: "1. Выберите тему",
        step1Desc: "Выберите любой гуманитарный предмет - история, философия, география или литература",
        step2Title: "2. Позвольте ИИ рассказать",
        step2Desc: "Наш ИИ превращает сложные темы в увлекательные, легкие для понимания сказки",
        step3Title: "3. Смотрите и слушайте",
        step3Desc: "Наслаждайтесь красивой анимацией с профессиональной озвучкой и интерактивными викторинами",
      },
      features: {
        title: "Волшебные возможности обучения",
        subtitle: "Всё необходимое для того, чтобы сделать гуманитарное образование увлекательным и запоминающимся",
        voiceoverTitle: "Профессиональная озвучка",
        voiceoverDesc: "Высококачественная ИИ-озвучка оживляет истории с увлекательными голосами персонажей",
        storyTitle: "Обучение в форме историй",
        storyDesc: "Сложные темы объясняются через запоминающиеся рассказы и персонажей",
        quizzesTitle: "Интерактивные викторины",
        quizzesDesc: "Проверьте понимание с помощью веселых викторин, которые закрепляют ключевые концепции",
        lengthTitle: "Идеальная длительность",
        lengthDesc: "3-5 минутные истории, рассчитанные на оптимальную концентрацию внимания и запоминание",
        multiAgeTitle: "Для всех возрастов",
        multiAgeDesc: "Контент, который увлекает студентов, родителей и учителей",
        curriculumTitle: "Соответствие программе",
        curriculumDesc: "Истории, созданные в дополнение к школьным программам и учебным целям",
      },
      pricing: {
        title: "Выберите свое учебное приключение",
        subtitle: "Начните бесплатно и откройте безграничные возможности волшебного обучения",
        freePlan: "Бесплатный исследователь",
        freePrice: "0₽",
        freeDesc: "Идеально для знакомства с WiseTale",
        freeFeature1: "3 истории в месяц",
        freeFeature2: "Базовая история и география",
        freeFeature3: "Стандартное качество аудио",
        freeFeature4: "Простые викторины",
        freeFeature5: "Доступ с мобильных устройств и веб",
        tryFree: "Попробовать бесплатно",
        
        premiumPlan: "Премиум рассказчик",
        premiumPrice: "599₽",
        premiumDesc: "Безграничные учебные приключения",
        premiumFeature1: "Безлимитные истории",
        premiumFeature2: "Все предметы и темы",
        premiumFeature3: "Премиум HD аудио и визуалы",
        premiumFeature4: "Интерактивные викторины и игры",
        premiumFeature5: "Отслеживание прогресса",
        premiumFeature6: "Офлайн загрузки",
        premiumFeature7: "Приоритетная поддержка",
        getPremium: "Получить Премиум",
        mostPopular: "Самый популярный",
        
        familyPlan: "Семейное приключение",
        familyPrice: "999₽",
        familyDesc: "Идеально для семей и домашнего обучения",
        familyFeature1: "Всё из Премиум",
        familyFeature2: "До 6 семейных профилей",
        familyFeature3: "Родительский контроль и отчеты",
        familyFeature4: "Контент по возрасту",
        familyFeature5: "Семейные учебные цели",
        familyFeature6: "Гид по домашнему обучению",
        familyFeature7: "Приоритетная семейная поддержка",
        startFamilyTrial: "Начать семейную пробную версию",
        
        guaranteeText: "Все планы включают 30-дневную гарантию возврата денег",
        cancelAnytime: "Отмена в любое время",
        noSetupFees: "Без платы за подключение",
        securePayments: "Безопасные платежи",
      },
      
      testimonials: {
        title: "Истории, которые вдохновляют",
        subtitle: "Посмотрите, как WiseTale трансформирует учебный опыт студентов и преподавателей",
        teacher1Name: "Мария Петрова",
        teacher1Role: "Учитель истории 8 класса",
        teacher1Quote: "Мои ученики теперь действительно увлечены уроками истории! История Римской империи полностью захватила их внимание.",
        teacher2Name: "Дмитрий Смирнов",
        teacher2Role: "Профессор философии",
        teacher2Quote: "Наконец-то появился способ сделать философию доступной для подростков. История о Сократе была блестящей!",
        parent1Name: "Анна Иванова",
        parent1Role: "Мама семиклассницы",
        parent1Quote: "Моя дочь перешла от ненависти к географии к просьбам о новых историях о разных странах!",
      },
      
      cta: {
        title: "Готовы изменить обучение?",
        subtitle: "Присоединяйтесь к тысячам преподавателей и студентов, которые делают обучение волшебным с WiseTale",
        privacyNote: "Получите ранний доступ и эксклюзивные обновления. Никакого спама, никогда.",
      },
    },
  }
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
}; 