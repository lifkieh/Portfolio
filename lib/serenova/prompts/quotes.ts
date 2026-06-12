/**
 * Curated quotes database for Serenova Chill mode.
 * A mix of poetic, romantic, contemplative, and playful quotes
 * in both Indonesian and English â€” to be injected into chill conversations.
 */

export const QUOTES_ID: string[] = [
  // --- Puitis & Kontemplatif ---
  "kadang yang paling berani itu bukan pergi, tapi tetap tinggal dan coba lagi besok.",
  "rindu itu aneh. bisa dateng ke orang yang masih ada di hidup lo.",
  "lo nggak harus tau mau ke mana. cukup tau lo masih jalan.",
  "ada hal-hal yang nggak perlu selesai untuk bisa kita damaikan.",
  "kesepian itu bukan soal sendirian. kadang justru paling kerasa di tengah keramaian.",
  "capek itu kadang bukan soal tenaga. lebih ke soal arah.",
  "nggak semua yang hilang itu rugi. kadang itu cuma bikin ruang buat yang lebih baik.",
  "hujan itu jujur. dia nggak minta izin, nggak minta dipahami. cuma turun.",
  "ada hari-hari yang cuma perlu kamu lewatin. nggak perlu kamu menangkan.",
  "kadang satu lagu bisa ngasih tau lo lebih banyak tentang diri lo daripada satu tahun mikir.",
  "yang bikin kuat itu bukan nggak pernah jatuh. tapi tau cara bangun lagi.",
  "lo nggak perlu jadi versi terbaik lo setiap hari. kadang cukup jadi versi yang masih mau coba.",
  "malam ini nggak harus berarti apa-apa. kadang malam cuma perlu ditemani.",
  "ada orang yang pergi bukan karena nggak sayang. tapi karena sayang aja nggak cukup.",
  "lo tau nggak, kadang keberanian itu cuma soal bangun pagi dan coba lagi.",
  "nggak semua cerita butuh ending yang bagus. kadang cerita yang belum selesai justru yang paling jujur.",

  // --- Romantis & Hangat ---
  "kalau ada satu hal yang gw mau lo tau: lo nggak sesendirian yang lo pikir.",
  "kadang cukup satu orang yang ngerti, dan dunia jadi nggak se-berat tadi.",
  "ada orang-orang yang dateng di hidup lo bukan untuk selamanya, tapi untuk ngajarin lo sesuatu.",
  "senja hari ini cantik btw. sayang nggak ada yang nemenin nonton.",
  "lo pernah nggak, ngerasa rindu sama sesuatu yang belum pernah lo punya?",
  "kadang yang lo butuhin bukan jawaban. cuma seseorang yang bilang 'gw di sini'.",
  "ada jenis kehangatan yang nggak bisa diganti sama selimut â€” kehadiran orang yang peduli.",
  "nggak semua hal indah itu mencolok. kadang yang paling indah itu yang tenang.",
  "kalau lo bisa kirim satu pesan ke diri lo setahun lalu, apa yang mau lo bilang?",
  "lo layak dapet orang yang nggak bikin lo nanya 'ini beneran atau nggak?'.",

  // --- Playful & Gen Z ---
  "hidup itu kayak wifi â€” kadang sinyal kuat, kadang ilang, kadang perlu di-restart.",
  "plot twist: lo lebih kuat dari yang lo pikir. cuma belum ada arc-nya aja.",
  "gw percaya semua orang punya main character energy. lo cuma lagi di filler episode.",
  "fun fact: lo udah survive 100% dari hari-hari terburuk lo. stats-nya bagus.",
  "kadang self-care itu bukan face mask. kadang cuma tidur dan berhenti overthinking.",
  "lo itu kayak lagu yang belum viral â€” bagus, cuma belum semua orang denger.",
  "reminder: nggak semua orang yang senyum itu baik-baik aja. termasuk lo mungkin.",
  "otak lo tuh kayak browser dengan 47 tab kebuka. wajar aja lag.",
  "kalau hidup ada skip button, lo bakal skip bagian mana?",
  "normalize nggak tau mau ngapain. kadang nggak punya rencana itu juga rencana.",
];

export const QUOTES_EN: string[] = [
  // --- Poetic & Contemplative ---
  "sometimes the bravest thing isn't leaving. it's staying and trying again tomorrow.",
  "missing someone is weird. it can hit you for people who are still in your life.",
  "you don't have to know where you're going. just knowing you're still walking is enough.",
  "some things don't need to be resolved to be made peace with.",
  "loneliness isn't about being alone. sometimes it hits hardest in a crowd.",
  "tired isn't always about energy. sometimes it's about direction.",
  "not everything you lose is a loss. sometimes it's just making room for something better.",
  "rain is honest. it doesn't ask permission, doesn't ask to be understood. it just falls.",
  "some days just need to be survived. they don't need to be won.",
  "sometimes one song tells you more about yourself than a whole year of thinking.",
  "what makes you strong isn't never falling. it's knowing how to get back up.",
  "you don't have to be your best self every day. sometimes just being the version that still tries is enough.",
  "tonight doesn't have to mean anything. sometimes a night just needs company.",
  "some people leave not because they don't care. but because caring wasn't enough.",
  "you know what, sometimes courage is just waking up and trying again.",
  "not every story needs a happy ending. sometimes the unfinished ones are the most honest.",

  // --- Romantic & Warm ---
  "if there's one thing i want you to know: you're not as alone as you think.",
  "sometimes one person who gets it is enough to make the world feel lighter.",
  "some people come into your life not to stay forever, but to teach you something.",
  "sunset today was beautiful btw. shame no one was there to watch it with.",
  "have you ever missed something you never even had?",
  "sometimes you don't need answers. just someone who says 'i'm here'.",
  "there's a kind of warmth no blanket can replace â€” the presence of someone who cares.",
  "not all beautiful things are loud. sometimes the most beautiful ones are quiet.",
  "if you could send one message to yourself a year ago, what would you say?",
  "you deserve someone who doesn't make you question if it's real.",

  // --- Playful & Gen Z ---
  "life is like wifi â€” sometimes the signal's strong, sometimes it's gone, sometimes you just need a restart.",
  "plot twist: you're stronger than you think. your arc just hasn't started yet.",
  "i believe everyone has main character energy. you're just in a filler episode right now.",
  "fun fact: you've survived 100% of your worst days. those stats are solid.",
  "sometimes self-care isn't a face mask. sometimes it's just sleeping and stopping the overthinking.",
  "you're like a song that hasn't gone viral yet â€” good, just not everyone's heard it.",
  "reminder: not everyone who smiles is doing okay. including you, maybe.",
  "your brain is like a browser with 47 tabs open. no wonder it lags.",
  "if life had a skip button, which part would you skip?",
  "normalize not knowing what to do. sometimes having no plan is the plan.",
];

/**
 * Returns a random quote in the specified language.
 */
export function getRandomQuote(lang: "en" | "id"): string {
  const pool = lang === "id" ? QUOTES_ID : QUOTES_EN;
  return pool[Math.floor(Math.random() * pool.length)];
}