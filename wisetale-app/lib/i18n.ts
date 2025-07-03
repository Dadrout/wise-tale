export type Language = 'en' | 'ru';

export interface Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Navigation
  home: string;
  about: string;
  contact: string;
  profile: string;
  logout: string;
  login: string;
  
  // Generation form
  subject: string;
  topic: string;
  generateVideo: string;
  generating: string;
  storyGenerator: string;
  yourStoryVideo: string;
  chooseSubject: string;
  topicPlaceholder: string;
  generatingStory: string;
  
  // Subjects
  history: string;
  geography: string;
  philosophy: string;
  
  // Status messages
  selectSubject: string;
  enterTopic: string;
  generationComplete: string;
  generationFailed: string;
  
  // Video placeholder
  videoPlaceholder: string;
  videoSubtitle: string;
  
  // Transcript
  storyTranscript: string;
  show: string;
  hide: string;
  
  // Profile
  welcome: string;
  myVideos: string;
  settings: string;
  
  // Footer
  allRightsReserved: string;
  privacyPolicy: string;
  termsOfService: string;
  support: string;
  
  // Auth
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: "Create Your Magical Story",
    subtitle: "Transform any humanities topic into an engaging AI-powered video story",
    
    // Navigation
    home: "Home",
    about: "About",
    contact: "Contact",
    profile: "Profile", 
    logout: "Logout",
    login: "Login",
    
    // Generation form
    subject: "Subject",
    topic: "Topic",
    generateVideo: "Generate Video",
    generating: "Generating...",
    storyGenerator: "Story Generator",
    yourStoryVideo: "Your Story Video",
    chooseSubject: "Choose your subject...",
    topicPlaceholder: "e.g., French Revolution, Ancient Egypt, Socratic Method...",
    generatingStory: "Generating Your Story...",
    
    // Subjects
    history: "History",
    geography: "Geography", 
    philosophy: "Philosophy",
    
    // Status messages
    selectSubject: "Please select a subject",
    enterTopic: "Please enter a topic",
    generationComplete: "Video generated successfully!",
    generationFailed: "Generation failed. Please try again.",
    
    // Video placeholder
    videoPlaceholder: "Your fairy tale video will appear here",
    videoSubtitle: "Choose a subject and topic to create your story",
    
    // Transcript
    storyTranscript: "Story Transcript",
    show: "Show",
    hide: "Hide",
    
    // Profile
    welcome: "Welcome",
    myVideos: "My Videos",
    settings: "Settings",
    
    // Footer
    allRightsReserved: "© 2025 WiseTale. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    support: "Support",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up", 
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
  },
  
  ru: {
    // Header
    title: "Создайте свою волшебную историю",
    subtitle: "Превратите любую гуманитарную тему в увлекательную видео-историю с ИИ",
    
    // Navigation
    home: "Главная",
    about: "О нас",
    contact: "Контакты",
    profile: "Профиль",
    logout: "Выйти", 
    login: "Войти",
    
    // Generation form
    subject: "Предмет",
    topic: "Тема",
    generateVideo: "Создать видео",
    generating: "Создание...",
    storyGenerator: "Генератор историй",
    yourStoryVideo: "Ваше видео-история",
    chooseSubject: "Выберите предмет...",
    topicPlaceholder: "напр., Французская революция, Древний Египет, Метод Сократа...",
    generatingStory: "Создание вашей истории...",
    
    // Subjects
    history: "История",
    geography: "География",
    philosophy: "Философия",
    
    // Status messages
    selectSubject: "Пожалуйста, выберите предмет",
    enterTopic: "Пожалуйста, введите тему",
    generationComplete: "Видео успешно создано!",
    generationFailed: "Ошибка создания. Попробуйте снова.",
    
    // Video placeholder
    videoPlaceholder: "Ваше сказочное видео появится здесь",
    videoSubtitle: "Выберите предмет и тему, чтобы создать свою историю",
    
    // Transcript
    storyTranscript: "Текст истории",
    show: "Показать",
    hide: "Скрыть",
    
    // Profile
    welcome: "Добро пожаловать",
    myVideos: "Мои видео",
    settings: "Настройки",
    
    // Footer
    allRightsReserved: "© 2025 WiseTale. Все права защищены.",
    privacyPolicy: "Политика конфиденциальности",
    termsOfService: "Условия использования",
    support: "Поддержка",
    
    // Auth
    signIn: "Войти",
    signUp: "Регистрация",
    email: "Электронная почта", 
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    forgotPassword: "Забыли пароль?",
    createAccount: "Создать аккаунт",
    alreadyHaveAccount: "Уже есть аккаунт?",
    dontHaveAccount: "Нет аккаунта?",
  }
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
}; 