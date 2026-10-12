const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "tord",
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			en: "Start Truth or Dare game"
		},
		category: "game",
		guide: {
			en: "{pn}"
		}
	},

	ST: async function ({ api, event, message }) {
		const { participantIDs, threadID, messageID } = event;

		if (!participantIDs || participantIDs.length === 0) {
			return api.sendMessage(
				"❌ Group members not found.",
				threadID,
				messageID
			);
		}

		const dataDir = path.join(__dirname, "../data");
		const dataFile = path.join(dataDir, "tod.json");

		await fs.ensureDir(dataDir);

		let data = {};

		if (await fs.pathExists(dataFile)) {
			try {
				data = await fs.readJson(dataFile);
			} catch {
				data = {};
			}
		}

		if (!data[threadID]) {
			data[threadID] = {
				truth: [],
				dare: []
			};
		}

		const body = "T or D\nreply with t or d";

		const sentMessage = await api.sendMessage(
			body,
			threadID,
			messageID
		);

		await fs.writeJson(dataFile, data, { spaces: 2 });

		if (sentMessage && sentMessage.messageID) {
			if (!global.GoatBot) global.GoatBot = {};
			if (!global.GoatBot.onReply) {
				global.GoatBot.onReply = new Map();
			}

			const replyData = {
				commandName: "tord",
				threadID: threadID,
				messageID: sentMessage.messageID,
				author: event.senderID
			};

			if (typeof global.GoatBot.onReply.set === "function") {
				global.GoatBot.onReply.set(
					sentMessage.messageID,
					replyData
				);
			} else {
				global.GoatBot.onReply[sentMessage.messageID] = replyData;
			}
		}
	},

	onReply: async function ({ api, event, Reply }) {
		if (event.threadID !== Reply.threadID) return;

		const answer = (event.body || "").trim().toLowerCase();

		if (answer !== "t" && answer !== "d") return;

		const truthQuestions = [
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

		const dareQuestions = [
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
			"Ekjon bondhur naam niye chotto ekta kobita banao ✍️️",
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

		const type = answer === "t" ? "truth" : "dare";
		const questions = type === "truth"
			? truthQuestions
			: dareQuestions;

		const dataFile = path.join(__dirname, "../data/tod.json");

		let data = {};

		if (await fs.pathExists(dataFile)) {
			try {
				data = await fs.readJson(dataFile);
			} catch {
				data = {};
			}
		}

		if (!data[event.threadID]) {
			data[event.threadID] = {
				truth: [],
				dare: []
			};
		}

		let used = data[event.threadID][type] || [];

		let available = questions
			.map((_, index) => index)
			.filter(index => !used.includes(index));

		if (available.length === 0) {
			used = [];
			available = questions.map((_, index) => index);
		}

		const index = available[
			Math.floor(Math.random() * available.length)
		];

		used.push(index);
		data[event.threadID][type] = used;

		await fs.writeJson(dataFile, data, { spaces: 2 });

		return api.sendMessage(
			questions[index],
			event.threadID,
			event.messageID
		);
	}
};
