import type { Locale } from './config';

const en = {
	'site.title': 'Astro Boilerplate',
	'site.description':
		'A production-ready Astro starter: typed content collections, i18n routing, SEO metadata, tests, and Docker.',

	skipToContent: 'Skip to content',
	'nav.main': 'Main',
	'nav.home': 'Home',
	'nav.blog': 'Blog',
	'nav.about': 'About',

	'home.eyebrow': 'Astro + TypeScript boilerplate',
	'home.title': 'Ship a fast, accessible site on day one.',
	'home.intro':
		'Content collections, i18n routing, SEO metadata, and a quality gate that runs in CI. Every piece is typed and tested.',
	'home.latestPosts': 'Latest posts',
	'home.allPosts': 'All posts',

	'blog.title': 'Blog',
	'blog.description': 'Notes, guides, and experiments.',
	'blog.empty': 'No posts yet.',
	'blog.readMore': 'Read post',
	'blog.readTime': '{minutes} min read',
	'blog.published': 'Published',
	'blog.updated': 'Updated',
	'blog.tags': 'Tags',
	'blog.backToBlog': 'Back to blog',

	'post.translations': 'Also available in',
	'post.navigation': 'Post navigation',
	'post.previous': 'Previous',
	'post.next': 'Next',

	'about.title': 'About',
	'about.description': 'What this boilerplate includes and how it is built.',

	'footer.rights': 'All rights reserved.',
	'footer.builtWith': 'Built with Astro.',
	'footer.rss': 'RSS feed',

	'theme.toggle': 'Toggle theme',
	'theme.light': 'Light',
	'theme.dark': 'Dark',
	'language.label': 'Language',

	'notFound.title': 'Page not found',
	'notFound.description': 'The page you are looking for does not exist or has moved.',
	'notFound.home': 'Go home',
} as const;

export type TranslationKey = keyof typeof en;

const id: Record<TranslationKey, string> = {
	'site.title': 'Astro Boilerplate',
	'site.description':
		'Starter Astro siap produksi: content collections bertipe, routing i18n, metadata SEO, pengujian, dan Docker.',

	skipToContent: 'Lompat ke konten',
	'nav.main': 'Utama',
	'nav.home': 'Beranda',
	'nav.blog': 'Blog',
	'nav.about': 'Tentang',

	'home.eyebrow': 'Boilerplate Astro + TypeScript',
	'home.title': 'Rilis situs cepat dan aksesibel sejak hari pertama.',
	'home.intro':
		'Content collections, routing i18n, metadata SEO, dan quality gate yang berjalan di CI. Semuanya bertipe dan teruji.',
	'home.latestPosts': 'Tulisan terbaru',
	'home.allPosts': 'Semua tulisan',

	'blog.title': 'Blog',
	'blog.description': 'Catatan, panduan, dan eksperimen.',
	'blog.empty': 'Belum ada tulisan.',
	'blog.readMore': 'Baca tulisan',
	'blog.readTime': '{minutes} menit baca',
	'blog.published': 'Diterbitkan',
	'blog.updated': 'Diperbarui',
	'blog.tags': 'Tag',
	'blog.backToBlog': 'Kembali ke blog',

	'post.translations': 'Juga tersedia dalam',
	'post.navigation': 'Navigasi tulisan',
	'post.previous': 'Sebelumnya',
	'post.next': 'Berikutnya',

	'about.title': 'Tentang',
	'about.description': 'Apa saja yang termasuk dalam boilerplate ini dan bagaimana ia dibangun.',

	'footer.rights': 'Seluruh hak dilindungi.',
	'footer.builtWith': 'Dibangun dengan Astro.',
	'footer.rss': 'Feed RSS',

	'theme.toggle': 'Ganti tema',
	'theme.light': 'Terang',
	'theme.dark': 'Gelap',
	'language.label': 'Bahasa',

	'notFound.title': 'Halaman tidak ditemukan',
	'notFound.description': 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
	'notFound.home': 'Kembali ke beranda',
};

export const ui: Record<Locale, Record<TranslationKey, string>> = { en, id };
