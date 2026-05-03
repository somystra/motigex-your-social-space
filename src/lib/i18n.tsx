import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "uz" | "ru";

const dict = {
  en: {
    appName: "Motigex", feed: "Feed", profile: "Profile", search: "Search", messages: "Messages",
    login: "Sign in", signup: "Sign up", guest: "Continue as Guest", logout: "Sign out",
    email: "Email", password: "Password", username: "Username",
    welcome: "Welcome to Motigex", tagline: "A new social experience.",
    emptyFeed: "Your feed is empty. Start following people or post something.",
    newPost: "What's on your mind?", post: "Post",
    uploadAvatar: "Change photo", save: "Save", bio: "Bio", displayName: "Display name",
    searchPlaceholder: "Search people...", noResults: "No results.",
    selectChat: "Select a conversation", typeMessage: "Type a message...", send: "Send",
    guestMode: "Guest mode — sign up to unlock posting & messaging.",
    createdBy: "Created by NetGlobal team",
    theme: "Theme", language: "Language",
    reels: "Reels", create: "Create", createPost: "Create post", createReel: "Create reel",
    chooseMedia: "Choose photo or video", uploading: "Uploading...",
    noReels: "No reels yet. Be the first to share one.",
  },
  uz: {
    appName: "Motigex", feed: "Lenta", profile: "Profil", search: "Qidiruv", messages: "Xabarlar",
    login: "Kirish", signup: "Ro'yxatdan o'tish", guest: "Mehmon sifatida davom etish", logout: "Chiqish",
    email: "Elektron pochta", password: "Parol", username: "Foydalanuvchi nomi",
    welcome: "Motigex'ga xush kelibsiz", tagline: "Yangi ijtimoiy tajriba.",
    emptyFeed: "Lentangiz bo'sh. Odamlarga obuna bo'ling yoki post yozing.",
    newPost: "Nima haqida o'ylayapsiz?", post: "Joylash",
    uploadAvatar: "Rasmni o'zgartirish", save: "Saqlash", bio: "Bio", displayName: "Ko'rsatiladigan nom",
    searchPlaceholder: "Odamlarni qidirish...", noResults: "Natija yo'q.",
    selectChat: "Suhbatni tanlang", typeMessage: "Xabar yozing...", send: "Yuborish",
    guestMode: "Mehmon rejimi — post va xabarlar uchun ro'yxatdan o'ting.",
    createdBy: "NetGlobal jamoasi tomonidan yaratilgan",
    theme: "Mavzu", language: "Til",
    reels: "Reels", create: "Yaratish", createPost: "Post joylash", createReel: "Reels joylash",
    chooseMedia: "Rasm yoki video tanlang", uploading: "Yuklanmoqda...",
    noReels: "Hozircha reels yo'q. Birinchi bo'lib joylang.",
  },
  ru: {
    appName: "Motigex", feed: "Лента", profile: "Профиль", search: "Поиск", messages: "Сообщения",
    login: "Войти", signup: "Регистрация", guest: "Войти как гость", logout: "Выйти",
    email: "Email", password: "Пароль", username: "Имя пользователя",
    welcome: "Добро пожаловать в Motigex", tagline: "Новый социальный опыт.",
    emptyFeed: "Ваша лента пуста. Подпишитесь на людей или напишите пост.",
    newPost: "Что у вас на уме?", post: "Опубликовать",
    uploadAvatar: "Изменить фото", save: "Сохранить", bio: "О себе", displayName: "Отображаемое имя",
    searchPlaceholder: "Поиск людей...", noResults: "Нет результатов.",
    selectChat: "Выберите чат", typeMessage: "Напишите сообщение...", send: "Отправить",
    guestMode: "Гостевой режим — зарегистрируйтесь для постов и сообщений.",
    createdBy: "Создано командой NetGlobal",
    theme: "Тема", language: "Язык",
    reels: "Reels", create: "Создать", createPost: "Создать пост", createReel: "Создать Reels",
    chooseMedia: "Выберите фото или видео", uploading: "Загрузка...",
    noReels: "Пока нет Reels. Будьте первым.",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict.en) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("motigex-lang")) as Lang | null;
    if (saved) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("motigex-lang", l); };
  const t = (k: keyof typeof dict.en) => dict[lang][k] ?? dict.en[k];
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
