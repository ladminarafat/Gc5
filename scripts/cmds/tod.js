const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// ব্যবহৃত প্রশ্ন ও ডেয়ার সংরক্ষণের ফাইল
const USED_QUESTIONS_FILE = path.join(__dirname, '../data/used_tord.json');

// একটি অবজেক্টে রানিং জবগুলো রাখা হচ্ছে যাতে ডুপ্লিকেট সিডিউল না হয়
const activeJobs = {};

const questions = [
  "Tomar shobcheye boro secret ki?",
  "Tomar shobcheye boro voy ki?",
  "Jibone shobcheye beshi kake trust koro?",
  "Kokhono best friend-er kache kono kotha lukiecho?",
  "Tomar shobcheye embarrassing moment konta?",
  "Kar sathe shobcheye beshi kotha bolte bhalo lage?",
  "Kokhono karo upor crush chilo?",
  "Tomar first crush ke chilo?",
  "Kokhono bondhur upor rag kore kotha bola bondho korecho?",
  "Tomar shobcheye kharap obbhash ki?",
  "Nijer kon dikta tumi change korte chao?",
  "Kokhono miththa bole dhora porecho?",
  "Sheshbar kobe kedechile?",
  "Tomar shobcheye priyo memory konta?",
  "Emon kono kotha ache ja kauke bolte paroni?",
  "Tomar shobcheye boro dream ki?",
  "Kon bondhuke shobcheye beshi miss koro?",
  "Kokhono karo message seen kore ichcha kore reply dao ni?",
  "Tomar shobcheye funny memory konta?",
  "Kokhono vul manushke message pathiyecho?",
  "Tomar shobcheye priyo manush ke?",
  "Kar personality tomar shobcheye bhalo lage?",
  "Kokhono kauke secretly admire korecho?",
  "Tomar shobcheye boro regret ki?",
  "Kokhono bondhur secret onno kauke bolecho?",
  "Tomar favourite movie ba series konta?",
  "Tomar shobcheye priyo gaan konta?",
  "Kon jinish chara ekdin-o thakte kosto hobe?",
  "Kokhono kono bondhur upor jealous hoyecho?",
  "Tomar shobcheye crazy idea ki chilo?",
  "Kokhono kauke vul bujhecho?",
  "Tomar jiboner shobcheye memorable day konta?",
  "Kon bondhur sathe shobcheye beshi moja koro?",
  "Kokhono nijer vul onno karo upor chapiecho?",
  "Tomar shobcheye awkward conversation konta?",
  "Tumi beshi introvert naki extrovert?",
  "Kokhono karo profile secretly check korecho? 😆",
  "Tomar shobcheye pochonder compliment ki?",
  "Kokhono kono bondhur birthday vule gecho?",
  "Tomar kache friendship-er shobcheye important bishoy ki?",
  "Kokhono karo jonno nijer plan change korecho?",
  "Tomar nijer kon bishoyta niye shobcheye beshi chinta hoy?",
  "Kon boyosher shomoyta abar fire pete chaibe?",
  "Tomar jiboner shobcheye funny lie ki?",
  "Kokhono karo sathe first dekha-te vul impression hoyechilo?",
  "Tomar shobcheye unusual habit ki?",
  "Jodi ekta wish puron hoto, ki chaite?",
  "Emon kon jaygay jete chao jekhane ekhono jao ni?",
  "Tomar somporke manush shadharonoto kon bishoyta vul bhabe?",
  "Ei muhurte tomar mone shobcheye beshi ki cholche? 😄"
];

const dares = [
  "Ekhoni tomar gallery-r shesh chobi ta dekhao 📸",
  "Ekjon bondhuke call kore bolo “Toke onek miss kori” 😂",
  "Group-e ekta funny selfie pathao 🤳",
  "Tomar favourite gaaner ekta line voice-e gao 🎤",
  "Ekjon bondhuke 3ta genuine compliment dao 💖",
  "30 second chup kore serious face kore thako 😐",
  "Tomar naam ulta kore bolo 😆",
  "Ekta funny emoji diye tomar current mood explain koro 😂",
  "Group-e “Ami ajke onek innocent” likhe pathao 😇",
  "Ekjon bondhur naam niye ekta funny rhyme banao 😆",
  "10 second-er jonno robot-er moto kotha bolo 🤖",
  "Tomar last used emoji diye ekta sentence banao 😂",
  "Ekta animal-er sound imitate koro 🐱",
  "Ekjon bondhuke “Tumi amar favourite human” bolo 😭",
  "Tomar favourite movie-r ekta scene act kore dekhao 🎬",
  "30 second dance koro 💃",
  "Ekta funny nickname nijer jonno choose koro 😎",
  "Tomar phone-er wallpaper dekhao 📱",
  "Ekjon bondhuke ekta wholesome message pathao 🤍",
  "Ekta random word niye 10 second-er speech dao 😂",
  "Tomar favourite character-er moto kotha bolo 🎭",
  "Ekta funny face kore selfie nao 🤪",
  "Group-e shobcheye beshi use kora emoji ta diye 5ta message dao 😂",
  "Ekjon bondhuke “Tumi ajke onek smart lagcho” bolo 😆",
  "20 second chokh bondho kore ekta gaan gao 🎤",
  "Tomar favourite food-er acting kore dekhao 🍕😂",
  "Ekta imaginary product-er advertisement banao 📢",
  "Tomar nijer ekta funny dialogue banao 😭",
  "Ekjon bondhur naam niye chotto ekta kobita banao ✍️",
  "1 minute shudhu emoji diye reply dao 😆",
  "Tomar favourite cartoon character-er voice imitate koro 🎭",
  "Ekta random pose diye photo nao 📸",
  "Ekjon bondhuke ekta motivational message dao 💪",
  "Tomar favourite game niye 20 second kotha bolo 🎮",
  "Ekta funny tongue twister 3 bar bolo 😂",
  "Group-e “Ami challenge accept korechi” likhe dao 🔥",
  "Ekjon bondhuke ekta funny question koro 😆",
  "10 second-er jonno news reporter-er moto kotha bolo 📰",
  "Tomar room-er ekta random object niye advertisement banao 😂",
  "Ekta imaginary award ceremony act koro 🏆",
  "Ekjon bondhuke ekta cute nickname dao 🫶",
  "Tomar favourite song-er tune hum koro 🎶",
  "15 second statue-er moto dariye thako 🗿",
  "Ekta funny story nijer moto kore banao 😂",
  "Tomar favourite food niye 3ta reason bolo 🍔",
  "Ekjon bondhuke thank you message pathao 🤍",
  "Tomar nijer ekta superhero name banao 🦸",
  "20 second comedian-er moto kotha bolo 🎤",
  "Ekta random emoji choose kore tar meaning explain koro 😂",
  "Last-e bolo: “Ami Dare complete korechi!” 🔥"
];

function loadUsedData() {
  if (!fs.existsSync(USED_QUESTIONS_FILE)) {
    const defaultData = { usedT: [], usedD: [] };
    fs.mkdirSync(path.dirname(USED_QUESTIONS_FILE), { recursive: true });
    fs.writeFileSync(USED_QUESTIONS_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(USED_QUESTIONS_FILE));
}

function saveUsedData(data) {
  fs.writeFileSync(USED_QUESTIONS_FILE, JSON.stringify(data, null, 2));
}

function getRandomItem(type) {
  let data = loadUsedData();
  let sourceList = type === 't' ? questions : dares;
  let usedList = type === 't' ? data.usedT : data.usedD;

  if (usedList.length >= sourceList.length) {
    usedList = [];
    if (type === 't') data.usedT = [];
    else data.usedD = [];
  }

  let availableList = sourceList.filter(item => !usedList.includes(item));
  let randomIndex = Math.floor(Math.random() * availableList.length);
  let selectedItem = availableList[randomIndex];

  usedList.push(selectedItem);
  if (type === 't') data.usedT = usedList;
  else data.usedD = usedList;

  saveUsedData(data);
  return selectedItem;
}

// --- ১. অ্যাডমিন গেম কমান্ড অন করার লজিক (ইনস্ট্যান্ট স্টার্টিং + অটো সিডিউল) ---
async function handleGameCommand(api, event, prefix) {
  const { body, threadID, senderID, messageID } = event;
  const command = body.trim().toLowerCase();

  if (command === `${prefix}game`) {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(admin => admin.id);

      // অ্যাডমিন চেক
      if (!adminIDs.includes(senderID)) {
        return api.sendMessage("❌ Shudhu group admin-ra eiy game start korte parbe!", threadID, messageID);
      }

      // ১. ইনস্ট্যান্ট গেম শুরু করা (সাথে সাথে @everyone মেনশন সহ মেসেজ দেওয়া)
      const mentions = threadInfo.participantIDs.map(id => ({ tag: "@everyone", id: id }));
      const instantMsg = {
        body: "@everyone\nT or D\n(To play this game, type t or d in the message reply)",
        mentions: mentions
      };
      api.sendMessage(instantMsg, threadID);

      // ২. ডেইলি অটোমেটিক সিডিউল সেট করা (যদি আগে থেকে চালু না থাকে)
      if (!activeJobs[threadID]) {
        // প্রতিদিন রাত ৯:০০ টায় অটো-নোটিশ ('0 21 * * *')
        activeJobs[threadID] = cron.schedule('0 21 * * *', async () => {
          try {
            const currentThreadInfo = await api.getThreadInfo(threadID);
            const currentMentions = currentThreadInfo.participantIDs.map(id => ({ tag: "@everyone", id: id }));
            
            const autoMsg = {
              body: "@everyone\nT or D\n(To play this game, type t or d in the message reply)",
              mentions: currentMentions
            };

            api.sendMessage(autoMsg, threadID);
          } catch (err) {
            console.error("Auto notice error:", err);
          }
        });
      }

    } catch (err) {
      console.error("Game command error:", err);
      api.sendMessage("⚠ Game start korte kono shomossha hoyeche.", threadID, messageID);
    }
  }
}

// --- ২. ইউজার যখন T বা D লিখে মেসেজ পাঠাবে ---
function handleReply(api, event) {
  if (!event.body) return;
  const userMessage = event.body.trim().toLowerCase();
  
  if (userMessage === 't') {
    const q = getRandomItem('t');
    api.sendMessage(q, event.threadID, event.messageID);
  } else if (userMessage === 'd') {
    const d = getRandomItem('d');
    api.sendMessage(d, event.threadID, event.messageID);
  }
}

module.exports = { handleGameCommand, handleReply };
