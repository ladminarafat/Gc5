const fs = require("fs");
const path = require("path");

// ==========================================
// TORD - TRUTH OR DARE
// Commands:
// .tord
// .tord ev
// ==========================================

const USED_QUESTIONS_FILE = path.join(
  __dirname,
  "../data/used_tord.json"
);

// ==========================================
// TRUTH QUESTIONS
// ==========================================

const truthQuestions = [
  "What is the most useless talent you possess?",
  "Nijer kon dikta tumi change korte chao?",
  "তোমার জীবনের সবচেয়ে বড় ড্রিম কি?",
  "Have you ever had a crush on a friend’s partner?",
  "Jibone shobcheye beshi kake trust koro?",
  "তোমার জীবনের সবচেয়ে বড় সিক্রেট কি?",
  "Have you ever stolen something, even if it was very small?",
  "Tomar shobcheye boro secret ki?",
  "Have you ever pretended to like a gift you actually hated?",
  "কখনো কারো মেসেজ সিন করে ইচ্ছে করে রিপ্লাই দাওনি?",
  "Tomar shobcheye priyo memory konta?",
  "What is the ultimate goal you want to achieve this year?",
  "Kokhono best friend-er kache kono kotha lukiecho?",
  "তোমার জীবনের সবচেয়ে বড় অনুশোচনা (regret) কি?",
  "What is your guilty pleasure TV show or song?",
  "Tomar shobcheye boro dream ki?",
  "তোমার সম্পর্কে মানুষ সাধারণত কোন বিষয়টায় ভুল ধারণা রাখে?",
  "What is one thing you can't live without for even 24 hours?",
  "What is something you are proud of but never brag about?",
  "Kokhono kono bondhur birthday vule gecho?",
  "Have you ever lied to get out of hanging out with friends?",
  "Tomar first crush ke chilo?",
  "তোমার লাইফের সবচেয়ে ফানি মেমোরি কোনটা?",
  "Who was your very first crush, and do they know?",
  "Kokhono karo message seen kore ichcha kore reply dao ni?",
  "তোমার জীবনের সবচেয়ে প্রিয় মানুষ কে?",
  "Who in this group do you think is the best listener?",
  "Tomar shobcheye boro regret ki?",
  "What is the most awkward text message you've sent by mistake?",
  "তোমার প্রথম ক্রাশ কে ছিল?",
  "Have you ever broken a promise you made to someone important?",
  "Tomar shobcheye awkward conversation konta?",
  "কখনো ভুল মানুষকে ভুল মেসেজ পাঠিয়ে বিপদে পড়েছো?",
  "Tomar shobcheye pochonder compliment ki?",
  "What is the biggest lie you have ever told without getting caught?",
  "তোমার লাইফের সবচেয়ে বিব্রতকর (embarrassing) মুহূর্ত কোনটা?",
  "What is your opinion on second chances in friendships?",
  "Kokhono bondhur secret onno kauke bolecho?",
  "তোমার সবচেয়ে পছন্দের প্রশংসা (compliment) কি ছিল?",
  "What is one secret you’ve kept from your parents?",
  "Tomar shobcheye boro voy ki?",
  "Kon boyosher shomoyta abar fire pete chaibe?",
  "What is your biggest fear that you rarely talk about?",
  "তোমার জীবনের সবচেয়ে বড় ভয় কোনটা?",
  "What is the worst habit you secretly have?",
  "Tomar shobcheye kharap obbhash ki?",
  "কখনো বন্ধুর সিক্রেট অন্য কাউকে বলে দিয়েছো?",
  "What is something you are deeply passionate about but don't show often?",
  "Tomar favourite movie ba series konta?",
  "তোমার সবচেয়ে খারাপ অভ্যাস কি?",
  "If you could trade lives with anyone in this group for a day, who would it be?",
  "Kokhono miththa bole dhora porecho?",
  "এই মুহূর্তে কাকে সবচেয়ে বেশি ট্রাস্ট করো?",
  "Kokhono karo upor crush chilo?",
  "What is the worst date or hangout experience you’ve ever had?",
  "তোমার ফেভারিট মুভি বা সিরিজ কোনটা?",
  "Have you ever stalked an ex or crush on social media?",
  "Sheshbar kobe kedechile?",
  "তোমার কাছে ফ্রেন্ডশিপের সবচেয়ে ইম্পর্টেন্ট বিষয় কি?",
  "What is the weirdest dream you’ve ever had?",
  "Kar sathe shobcheye beshi kotha bolte bhalo lage?",
  "কখনো কারো প্রোফাইল সিক্রেটলি বারবার চেক করেছো?",
  "Have you ever overheard someone talking bad about you?",
  "Emon kono kotha ache ja kauke bolte paroni?",
  "তোমার জীবনের সবচেয়ে প্রিয় মেমোরি কোনটা?",
  "What is one rule you love breaking?",
  "Kon bondhuke shobcheye beshi miss koro?",
  "কখনো বেস্ট ফ্রেন্ডের কাছে কোনো কথা লুকিয়েছো?",
  "What is your biggest pet peeve in a relationship or friendship?",
  "Tomar shobcheye funny memory konta?",
  "তোমার নিজের কোন বিষয় নিয়ে সবচেয়ে বেশি চিন্তা হয়?",
  "Have you ever cheated on a test or exam?",
  "Kokhono vul manushke message pathiyecho?",
  "তুমি কি বেশি ইন্ট্রোভার্ট নাকি এক্সট্রোভার্ট?",
  "Who is the person you trust most in your life right now?",
  "Tomar shobcheye priyo manush ke?",
  "গ্রুপের কার পার্সোনালিটি তোমার সবচেয়ে ভালো লাগে?",
  "Have you ever fallen in love at first sight?",
  "Kar personality tomar shobcheye bhalo lage?",
  "কখনো মিথ্যা বলে ধরা পড়েছো?",
  "What is a boundary you will never let anyone cross?",
  "Kokhono kauke secretly admire korecho?",
  "শেষবার কবে কেঁদেছিলে এবং কেন?",
  "If you had to delete all social media except one, which one would you keep?",
  "Tomar shobcheye priyo gaan konta?",
  "এমন কোনো কথা আছে যা আজ পর্যন্ত কাউকে বলতে পারোনি?",
  "What is the most expensive thing you bought and instantly regretted?",
  "Kon jinish chara ekdin-o thakte kosto hobe?",
  "কোন বন্ধুকে এখন সবচেয়ে বেশি মিস করো?",
  "What is a habit of yours that annoys other people?",
  "Kokhono kono bondhur upor jealous hoyecho?",
  "কখনো কাউকে সিক্রেটলি এডমায়ার বা পছন্দ করেছো?",
  "Have you ever muted or blocked someone in this group?",
  "Tomar shobcheye crazy idea ki chilo?",
  "তোমার সবচেয়ে প্রিয় গান কোনটা?",
  "What is the longest time you’ve gone without taking a shower?",
  "Kokhono kauke vul bujhecho?",
  "কোন জিনিসটা ছাড়া একদিনও থাকা তোমার জন্য কঠিন?",
  "What is the childish thing you still do to this day?",
  "Tomar jiboner shobcheye memorable day konta?",
  "কখনো কোনো বন্ধুর ওপর হিংসা বা জেলাস হয়েছো?",
  "Have you ever laughed at a moment when you were supposed to be serious?",
  "Kon bondhur sathe shobcheye beshi moja koro?",
  "তোমার মাথার সবচেয়ে ক্রেজি আইডিয়া কি ছিল?",
  "What is the most embarrassing thing you've ever done in public?",
  "Kokhono nijer vul onno karo upor chapiecho?",
  "কখনো কাউকে খুব মারাত্মক ভুল বুঝেছো?",
  "What is the nicest thing anyone has ever done for you?",
  "Tumi beshi introvert naki extrovert?",
  "তোমার জীবনের সবচেয়ে মেমোরেবল দিন কোনটা?",
  "Kokhono karo profile secretly check korecho? 😆",
  "কোন বন্ধুর সাথে সবচেয়ে বেশি মজা বা দুষ্টুমি করো?",
  "Have you ever sent a message to the wrong person that caused drama?",
  "Tomar kache friendship-er shobcheye important bishoy ki?",
  "কখনো নিজের ভুল অন্য কারো ওপর চাপিয়ে দিয়েছো?",
  "Who is the last person you searched for on Facebook or Instagram?",
  "Kokhono karo jonno nijer plan change korecho?",
  "তোমার জীবনের সবচেয়ে অকওয়ার্ড কনভারসেশন কোনটা ছিল?",
  "What is the most awkward compliment you've ever received?",
  "Tomar nijer kon bishoyta niye shobcheye beshi chinta hoy?",
  "কখনো কোনো বন্ধুর বার্থডে একদম ভুলে গেছো?",
  "Have you ever blamed a pet or someone else for a mess you made?",
  "Tomar jiboner shobcheye funny lie ki?",
  "কখনো কারো জন্য নিজের ইম্পর্টেন্ট প্ল্যান ক্যানসেল করেছো?",
  "What is the biggest regret of your life so far?",
  "Kokhono karo sathe first dekha-te vul impression hoyechilo?",
  "কোন বয়সের সময়টায় আবার ফিরে যেতে চাইবে?",
  "What is the most spontaneous thing you have ever done?",
  "Tomar shobcheye unusual habit ki?",
  "তোমার জীবনের সবচেয়ে ফানি মিথ্যা কথা কোনটা?",
  "Have you ever cried while watching a movie or cartoon?",
  "Jodi ekta wish puron hoto, ki chaite?",
  "কখনো কারো সাথে ফার্স্ট দেখাতেই ভুল ইমপ্রেশন হয়েছিল?",
  "What is one bad experience that actually made you a stronger person?",
  "Emon kon jaygay jete chao jekhane ekhono jao ni?",
  "তোমার সবচেয়ে আনইউজুয়াল বা অদ্ভুত অভ্যাস কি?",
  "What is your biggest insecurity?",
  "Tomar somporke manush shadharonoto kon bishoyta vul bhabe?",
  "যদি একটা উইশ পূরণ হতো, আজকে কি চাইতে?",
  "If you could erase one memory from your mind, what would it be?",
  "Ei muhurte tomar mone shobcheye beshi ki cholche? 😄",
  "এমন কোনো জায়গায় যেতে চাও যেখানে এখনো যাওয়া হয়নি?",
  "কখনো বন্ধুর ওপর রাগ করে না জানিয়ে কথা বলা বন্ধ করেছো?",
  "এই মুহূর্তে তোমার মনে সবচেয়ে বেশি কি চলছে?",
  "কার সাথে সবচেয়ে বেশি কথা বলতে ভালো লাগে?",
  "এখনো পর্যন্ত কার ওপর সবচেয়ে বড় ক্রাশ ছিল?"
];

// ==========================================
// DARE QUESTIONS
// ==========================================

const dareQuestions = [
  "Ekta funny face kore selfie nao 🤪",
  "তোমার ফোনের কারেন্ট ওয়ালপেপার স্ক্রিনশট দিয়ে দেখাও 📱",
  "Do 10 pushups or jumping jacks and send a short audio/video proof 💪",
  "30 second dance koro 💃",
  "এখনি তোমার গ্যালারির শেষ ছবিটা গ্রুপে শেয়ার করো 📸",
  "Text 'Are you mad at me?' to your best friend and post their reaction screenshot 😳",
  "Ekta random word niye 10 second-er speech dao 😂",
  "একজন বন্ধুকে কল করে বলো “তোকে অনেক মিস করছি” 😂",
  "Send a voice message whispering your favorite movie line 🤫",
  "Ekjon bondhuke “Tumi amar favourite human” bolo 😭",
  "গ্রুপে একটা ফানি সেলফি তুলে পাঠাও 🤳",
  "Describe your personality using only 3 emojis 🎨",
  "10 second-er jonno robot-er moto kotha bolo 🤖",
  "তোমার ফেভারিট গানের একটা লাইন ভয়েস মেসেজে গেয়ে পাঠাও 🎤",
  "Send a screenshot of your screen time usage for today ⏱️",
  "Ekjon bondhur naam niye ekta funny rhyme banao 😆",
  "গ্রুপের যেকোনো একজনকে ৩টা মন থেকে কমপ্লিমেন্ট দাও 💖",
  "Change your group nickname to 'The Mastermind' for the rest of the day 👑",
  "Group-e “Ami ajke onek innocent” likhe pathao 😇",
  "৩০ সেকেন্ডের একটা নীরবতার ভয়েস পাঠাও 😐",
  "Send the 5th photo from your photo gallery in the chat without context 📸",
  "Ekta funny emoji diye tomar current mood explain koro 😂",
  "তোমার নাম উল্টো করে ভয়েস বা টেক্সটে বলো 😆",
  "Send an audio recording of you trying to speak without moving your lips 🤐",
  "Tomar naam ulta kore bolo 😆",
  "একটা ফানি ইমোজি দিয়ে তোমার কারেন্ট মুড ডেসক্রাইব করো 😂",
  "Attempt to whistle a full song in a voice note 🎵",
  "30 second chup kore serious face kore thako 😐",
  "গ্রুপে “আমি আজকে অনেক ইনোসেন্ট” লিখে পাঠাও 😇",
  "Text a random emoji to 3 people in your recent chat list and screenshot their reactions 🤳",
  "Ekjon bondhuke 3ta genuine compliment dao 💖",
  "গ্রুপের যেকোনো একজন বন্ধুর নাম নিয়ে একটা ফানি ছড়া বানাও 😆",
  "Send a screenshot of your phone's home screen right now 📲",
  "Tomar favourite gaaner ekta line voice-e gao 🎤",
  "১০ সেকেন্ডের জন্য রোবটের মতো ভয়েস মেসেজ পাঠাও 🤖",
  "Write a short, dramatic 3-line breakup letter to a piece of food 🍕",
  "Group-e ekta funny selfie pathao 🤳",
  "তোমার লাস্ট ইউজ করা ৩টা ইমোজি দিয়ে একটা সেন্টেন্স বানাও 😂",
  "Type a sentence using only your nose and send it here 👃",
  "Ekjon bondhuke call kore bolo “Toke onek miss kori” 😂",
  "একটা পশুর ডাক ডেকে ভয়েস মেসেজ পাঠাও 🐱",
  "Speak in an accent (British, Country, or Anime) in a 15-second voice note 🗣️",
  "Ekhoni tomar gallery-r shesh chobi ta dekhao 📸",
  "গ্রুপের একজনকে “তুমি আমার ফেভারিট হিউম্যান” টেক্সট করো 😭",
  "Sing the chorus of 'Happy Birthday' as dramatically as possible in a voice message 🎶",
  "Last-e bolo: “Ami Dare complete korechi!” 🔥",
  "তোমার ফেভারিট মুভির একটা জনপ্রিয় ডায়লগ ভয়েসে বলো 🎬",
  "Send a screenshot of your Spotify/YouTube search history 📱",
  "Ekta random emoji choose kore tar meaning explain koro 😂",
  "একজন বন্ধুকে একটা সুন্দর ও কিউট মেসেজ পাঠাও 🤍",
  "Send a voice note acting like a sports commentator describing yourself making tea or coffee 🎙️",
  "20 second comedian-er moto kotha bolo 🎤",
  "একটা র্যান্ডম শব্দ নিয়ে ১০ সেকেন্ডের একটা ফেক স্পিচ দাও 😂",
  "Share the last song you played on Spotify/YouTube/Apple Music 🎧",
  "Tomar nijer ekta superhero name banao 🦸",
  "তোমার ফেভারিট কার্টুন ক্যারেক্টারের মতো কথা বলো 🎭",
  "Confess your most embarrassing childhood moment in 3 sentences 🙈",
  "Ekjon bondhuke thank you message pathao 🤍",
  "একটা ফানি ফেস করে সেলফি তুলে গ্রুপে দাও 🤪",
  "Send a text saying 'I know what you did last summer' to a group member 🤫",
  "Tomar favourite food niye 3ta reason bolo 🍔",
  "গ্রুপে সবচেয়ে বেশি ইউজ করা ইমোজিটা দিয়ে ৫টা ব্যাক-টু-ব্যাক মেসেজ দাও 😂",
  "Recite the alphabet backward as fast as you can in a voice note 🅰️",
  "Ekta funny story nijer moto kore banao 😂",
  "একজন বন্ধুকে “তুমি আজকে অনেক স্মার্ট লাগছো” টেক্সট করো 😆",
  "Post a status/story on social media saying 'I love pineapples on pizza' for 1 hour 🍕",
  "15 second statue-er moto dariye thako 🗿",
  "২০ সেকেন্ড চোখ বন্ধ করে একটা গান গাওয়ার ভয়েস দাও 🎤",
  "Say 'I am the greatest' in 3 different languages in a voice message 🌍",
  "Tomar favourite song-er tune hum koro 🎶",
  "তোমার প্রিয় খাবারের এক্টিং করে ১০ সেকেন্ডের ভয়েস দাও 🍕😂",
  "Send a voice note crying dramatically for no reason for 5 seconds 😭",
  "Ekjon bondhuke ekta cute nickname dao 🫶",
  "একটা কাল্পনিক প্রোডাক্টের অদ্ভুত বিজ্ঞাপন বানিয়ে বলো 📢",
  "Text your crush or close friend 'I need to tell you a secret...' and don't reply for 2 minutes 😈",
  "Ekta imaginary award ceremony act koro 🏆",
  "নিজের বানানো একটা ফানি ডায়লগ লিখে পাঠাও 😭",
  "Rate everyone currently active in this chat on a scale of 1 to 10 for humor 😜",
  "Tomar room-er ekta random object niye advertisement banao 😂",
  "গ্রুপের একজন বন্ধুর নাম নিয়ে ছোট একটা কবিতা লিখে পাঠাও ✍",
  "Tell a 30-second horror story in a serious voice note 👻",
  "10 second-er jonno news reporter-er moto kotha bolo 📰",
  "পরবর্তী ১ মিনিট শুধু ইমোজি দিয়ে রিপ্লাই দাও 😆",
  "Send a message saying 'I have been converted to an alien' to a random chat 👽",
  "Ekjon bondhuke ekta funny question koro 😆",
  "একটা র্যান্ডম পোজ দিয়ে ফটো তুলে পাঠাও 📸",
  "Send a picture of the object directly to your left right now 👈",
  "Group-e “Ami challenge accept korechi” likhe dao 🔥",
  "গ্রুপের একজনকে একটা ইন্সপায়ারিং মোটিভেশনাল মেসেজ দাও 💪",
  "Send a compliment to the person who messaged right before you in the group 🌟",
  "Ekta funny tongue twister 3 bar bolo 😂",
  "তোমার প্রিয় গেম নিয়ে ২০ সেকেন্ড একনাগাড়ে কথা বলো 🎮",
  "Try to make the group laugh with a single joke (voice note or text) 🤣",
  "Tomar favourite game niye 20 second kotha bolo 🎮",
  "একটা কঠিন টাং টুইস্টার (Tongue Twister) ৩ বার স্পিডে ভয়েসে বলো 😂",
  "Send a photo of your shoes right now 👟",
  "Ekjon bondhuke ekta motivational message dao 💪",
  "গ্রুপে “আমি চ্যালেঞ্জ এক্সেপ্ট করেছি!” লিখে পোস্ট করো 🔥",
  "Send a message to the group with every word capitalized Like This For The Next 3 Messages 🔠",
  "Ekta random pose diye photo nao 📸",
  "গ্রুপের কাউকে একটা একদম অদ্ভুত বা ফানি প্রশ্ন করো 😆",
  "Send a voice message imitating a famous celebrity 🌟",
  "Tomar favourite cartoon character-er voice imitate koro 🎭",
  "১০ সেকেন্ডের জন্য নিউজরিপোর্টারের মতো স্পিডে কথা বলো 📰",
  "Ask someone in the group a deep philosophical question out of nowhere 🤔",
  "1 minute shudhu emoji diye reply dao 😆",
  "তোমার রুমের একটা র্যান্ডম অবজেক্টের প্রশংসায় ২ লাইন বলো 😂",
  "Change your profile picture to a picture of a potato for 10 minutes 🥔",
  "Ekjon bondhur naam niye chotto ekta kobita banao ✍",
  "একটি অবাস্তব অ্যাওয়ার্ড গ্রহণের ফেক স্পিচ দাও 🏆",
  "Talk continuously for 20 seconds without pausing or taking a breath in a voice note ⏱️",
  "Tomar nijer ekta funny dialogue banao 😭",
  "গ্রুপের যেকোনো একজনকে একটা কিউট নিকনেম দাও 🫶",
  "Send a screenshot of your most frequently used apps chart 📈",
  "Ekta imaginary product-er advertisement banao 📢",
  "তোমার প্রিয় গানের সুর শুধু শিষ দিয়ে বা ভয়েসে গুনগুন করো 🎶",
  "Send a message using ONLY capital letters for the next 5 minutes 📢",
  "Tomar favourite food-er acting kore dekhao 🍕😂",
  "একটা ফানি স্টোরি বানিয়ে ১ লাইনে বলো 😂",
  "Send a cute baby picture of yourself if you have one on your phone 👶",
  "20 second chokh bondho kore ekta gaan gao 🎤",
  "তোমার ফেভারিট ফুড কোনটা এবং কেন ৩টা রিজন দাও 🍔",
  "Send a voice note pretending to be a cat asking for food 🐱",
  "Ekjon bondhuke “Tumi ajke onek smart lagcho” bolo 😆",
  "গ্রুপের কাউকে একটা সুন্দর থ্যাংক ইউ মেসেজ পাঠাও 🤍",
  "Send a screenshot of your current music playlist 🎵",
  "Group-e shobcheye beshi use kora emoji ta diye 5ta message dao 😂",
  "নিজের জন্য একটা পাওয়ারফুল সুপারহিরো নেম বানিয়ে বলো 🦸",
  "Text the group leader a dramatic thank-you note 🙇",
  "Tomar favourite character-er moto kotha bolo 🎭",
  "২০ সেকেন্ড স্ট্যান্ডআপ কমেডিয়ানদের মতো জোকস বলো 🎤",
  "Describe your day so far using only movie titles 🎬",
  "Ekjon bondhuke ekta wholesome message pathao 🤍",
  "যেকোনো একটা র্যান্ডম ইমোজি চুজ করে তার নিজের মতো মিনিং বলো 😂",
  "Send a funny voice note doing a villain laugh 🦹‍♂️",
  "Tomar phone-er wallpaper dekhao 📱",
  "গ্রুপে বলো: “আমি সাকসেসফুলি ডেয়ার কমপ্লিট করেছি!” 🔥",
  "Send a photo of your workspace or desk layout 💻",
  "Ekta funny nickname nijer jonno choose koro 😎",
  "তোমার প্রোফাইল পিকচার ১০ মিনিটের জন্য পরিবর্তন করে একটা ফানি ছবি দাও 😜",
  "Compliment 3 different people in the group for something unique about them 💖",
  "Tomar favourite movie-r ekta scene act kore dekhao 🎬",
  "তোমার ব্যাটারির পার্সেন্টেজ কত তা স্ক্রিনশট নিয়ে গ্রুপে দেখাও 🔋",
  "Send a message using rhyming words only for your next 2 responses 📝",
  "Tomar last used emoji diye ekta sentence banao 😂",
  "তোমার ইনস্টাগ্রাম বা ফেসবুকের লাস্ট সার্চ হিস্ট্রির স্ক্রিনশট দাও 🔍",
  "Admit one funny thing you did this week that nobody knows about 🤫",
  "তোমার রিসেন্ট কল হিস্ট্রির একটা স্ক্রিনশট মেসেজে পাঠাও 📞",
  "Send a voice message concluding with: 'Mission accomplished, over and out!' 🚀"
];

// ==========================================
// USED DATA
// ==========================================

function loadUsedData() {
  try {
    if (!fs.existsSync(USED_QUESTIONS_FILE)) {
      const data = {
        usedT: [],
        usedD: []
      };

      fs.mkdirSync(path.dirname(USED_QUESTIONS_FILE), {
        recursive: true
      });

      fs.writeFileSync(
        USED_QUESTIONS_FILE,
        JSON.stringify(data, null, 2)
      );

      return data;
    }

    return JSON.parse(
      fs.readFileSync(USED_QUESTIONS_FILE, "utf8")
    );
  } catch (error) {
    console.error("TORD: Failed to load used data:", error);

    return {
      usedT: [],
      usedD: []
    };
  }
}

function saveUsedData(data) {
  try {
    fs.mkdirSync(path.dirname(USED_QUESTIONS_FILE), {
      recursive: true
    });

    fs.writeFileSync(
      USED_QUESTIONS_FILE,
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("TORD: Failed to save used data:", error);
  }
}

// ==========================================
// GET RANDOM QUESTION
// ==========================================

function getRandomItem(type) {
  const data = loadUsedData();

  const sourceList =
    type === "t"
      ? truthQuestions
      : dareQuestions;

  let usedList =
    type === "t"
      ? data.usedT
      : data.usedD;

  // সব প্রশ্ন ব্যবহার হয়ে গেলে নতুন cycle
  if (usedList.length >= sourceList.length) {
    usedList = [];
  }

  let availableList = sourceList.filter(
    item => !usedList.includes(item)
  );

  // Safety fallback
  if (availableList.length === 0) {
    usedList = [];
    availableList = [...sourceList];
  }

  const randomIndex = Math.floor(
    Math.random() * availableList.length
  );

  const selectedItem = availableList[randomIndex];

  usedList.push(selectedItem);

  if (type === "t") {
    data.usedT = usedList;
  } else {
    data.usedD = usedList;
  }

  saveUsedData(data);

  return selectedItem;
}

// ==========================================
// DETECT T / D
// ==========================================

function getChoice(text) {
  if (!text) return null;

  const message = text
    .trim()
    .toLowerCase();

  /*
    Works with:

    t
    T
    t 🙈
    T 🙂
    t hello
    t anything
    d
    D 😂
    d hello
    d anything
  */

  if (/^t(?:\s|$)/i.test(message)) {
    return "t";
  }

  if (/^d(?:\s|$)/i.test(message)) {
    return "d";
  }

  return null;
}

// ==========================================
// REACT 🙈
// ==========================================

async function reactToMessage(api, messageID) {
  try {
    if (typeof api.setMessageReaction !== "function") {
      return;
    }

    await api.setMessageReaction(
  "🙈",
  messageID,
  () => {},
  true
);
} catch (error) {
  console.error(
    "TORD: Reaction error:",
    error
  );
}
}

// ==========================================
// COMMAND HANDLER
// ==========================================

async function handleGameCommand(api, event, prefix) {
  if (!event || !event.body) return;

  const body = event.body.trim();

  const tordCommand = `${prefix}tord`;
  const tordEvCommand = `${prefix}tord ev`;

  // ========================================
  // .tord ev
  // ========================================

  if (
    body.toLowerCase() ===
    tordEvCommand.toLowerCase()
  ) {
    try {
      const threadInfo =
        await api.getThreadInfo(event.threadID);

      const participantIDs =
        threadInfo.participantIDs || [];

      const mentions = participantIDs.map(id => ({
        tag: "@everyone",
        id: id
      }));

      const message = {
        body:
          "T or D @everyone\n" +
          "reply T or D",
        mentions
      };

      return api.sendMessage(
        message,
        event.threadID
      );

    } catch (error) {
      console.error(
        "TORD EV error:",
        error
      );

      return api.sendMessage(
        "T or D @everyone\nreply T or D",
        event.threadID
      );
    }
  }

  // ========================================
  // .tord
  // ========================================

  if (
    body.toLowerCase() ===
    tordCommand.toLowerCase()
  ) {
    const message = {
      body:
        "T or D\n" +
        "reply T or D"
    };

    return api.sendMessage(
      message,
      event.threadID
    );
  }
}

// ==========================================
// HANDLE REPLY
// ==========================================

async function handleReply(api, event) {
  if (!event || !event.body) return;

  const choice = getChoice(event.body);

  if (!choice) return;

  const result = getRandomItem(choice);

  if (!result) return;

  try {
    // শুধু question / dare পাঠাবে
    await api.sendMessage(
      result,
      event.threadID,
      async (err) => {
        if (err) {
          console.error(
            "TORD: Send error:",
            err
          );
        }
      }
    );

    // যে T/D reply করেছে সেই message-এ 🙈 reaction
    await reactToMessage(
      api,
      event.messageID
    );

  } catch (error) {
    console.error(
      "TORD: Reply error:",
      error
    );
  }
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  handleGameCommand,
  handleReply
};
