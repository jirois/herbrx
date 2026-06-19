export type Locale = 'en' | 'pcm' | 'ig' | 'ha' | 'yo'

export interface LocaleOption {
  code:    Locale
  label:   string   // native name
  english: string   // English name shown in tooltip
  flag:    string   // emoji flag
  dir:     'ltr'    // all five are LTR
}

export const LOCALES: LocaleOption[] = [
  { code: 'en',  label: 'English',  english: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'pcm', label: 'Pidgin',   english: 'Nigerian Pidgin', flag: '🇳🇬', dir: 'ltr' },
  { code: 'ig',  label: 'Igbo',     english: 'Igbo',    flag: '🇳🇬', dir: 'ltr' },
  { code: 'ha',  label: 'Hausa',    english: 'Hausa',   flag: '🇳🇬', dir: 'ltr' },
  { code: 'yo',  label: 'Yorùbá',   english: 'Yoruba',  flag: '🇳🇬', dir: 'ltr' },
]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'herbrx_locale'
