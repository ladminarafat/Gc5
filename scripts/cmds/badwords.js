
const DEFAULT_BAD_WORDS = [
	// English
	"fuck", "fucking", "fucked", "motherfucker", "motherfucking",
	"shit", "bullshit", "son of a bitch", "bitch", "bitchass",
	"asshole", "dumbass", "dickhead", "dick", "prick", "cunt",
	"pussy", "cocksucker", "jackass", "slut", "whore", "bastard",
	"dipshit", "shithead", "stfu", "mf", "mfs",

	// Banglish and short forms
	"madarchod", "madarchuda", "khankir pola", "khankichoda",
	"chudir bhai", "chudir bon", "bokachoda", "baler pola",
	"haramjada", "haramkhor", "chodna", "chodachudi", "gud mara",
	"gand mara", "magichoda", "magir pola", "bainchod", "bainchud",
	"lavdachoda", "randir pola", "randikhor", "napatta choda",
	"chude", "chudi", "cudbo", "chudbo", "chuda", "choda",
	"chudiya", "chudsi", "chudse", "chudmu", "chudbi", "chudbe",
	"chudai", "sauya", "suya", "sua", "puk", "fuk", "fck",
	"fcuk", "sht", "mc", "mdc", "bc", "banchod", "khanki",
	"khnk", "bkc", "rand", "rndi", "gandu", "gndu", "gud",
	"gudar", "magi", "mgi", "hz",

	// Bengali
	"মাদারচোদ", "মাদারচুদ", "খানকির পোলা", "খানকিচোদা",
	"চুদির ভাই", "চুদির বোন", "বোকাচোদা", "হারামজাদা",
	"হারামখোর", "চোদনা", "চোদাচুদি", "গুদ মারা", "গাঁড় মারা",
	"মাগীচোদা", "মাগীর পোলা", "বাইনচোদ", "রেন্ডির পোলা",
	"রেন্ডিখোর", "নাপাক চোদা"
];

module.exports = {
	config: {
		name: "badwords",
		aliases: ["badword"],
		version: "2.0",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			en: "Warns members for using banned words and kicks them on the second violation."
		},
		category: "box chat",
		guide: {
			en: "{pn} add <words>\n{pn} delete <words>\n{pn} list\n{pn} on\n{pn} off\n{pn} unwarn <userID>"
		}
	},

	langs: {
		en: {
			onlyAdmin: "Only group admins can manage banned words.",
			missingWords: "Please enter words.",
			addedSuccess: "Added %1 banned words.",
			alreadyExist: "%1 words already exist: %2",
			onlyAdmin2: "Only group admins can delete banned words.",
			missingWords2: "Please enter words to delete.",
			deletedSuccess: "Deleted %1 banned words.",
			notExist: "%1 words were not found: %2",
			emptyList: "The banned-word list is empty.",
			badWordsList: "Banned words: %1",
			onlyAdmin3: "Only group admins can change this setting.",
			turnedOnOrOff: "Bad-word filter is now %1.",
			onlyAdmin4: "Only group admins can remove warnings.",
			missingTarget: "Please provide a valid user ID.",
			notWarned: "This user has no warning.",
			unwarned: "Removed one warning for user %1.",
			warned: "Assalamualaikum 🤍🫠\nAmader group ah gali diya jabe na.\n⚠️ Warning: Same behavior abar detect hole bot kick kore dibe.",
			warned2: "Assalamualaikum 🤍🫠\nApni abar gali diyechen. Apnake group theke kick kora hocche.",
			needAdmin: "Bot needs admin permission to remove members."
		}
	},

	onStart: async function ({
		message, event, args, threadsData, role, getLang
	}) {
		let data = await threadsData.get(event.threadID, "data.badWords");

		if (!data) {
			data = {
				words: [...DEFAULT_BAD_WORDS],
				violationUsers: {}
			};
			await threadsData.set(event.threadID, data, "data.badWords");
		}

		const words = await threadsData.get(
			event.threadID, "data.badWords.words", []
		);

		// Preserve custom words and add default words.
		const merged = [...new Set([...words, ...DEFAULT_BAD_WORDS])];
		if (merged.length !== words.length) {
			await threadsData.set(
				event.threadID, merged, "data.badWords.words"
			);
		}

		switch ((args[0] || "").toLowerCase()) {
			case "add": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin"));

				const input = args.slice(1).join(" ")
					.split(/[,|]/)
					.map(w => w.trim().toLowerCase())
					.filter(Boolean);

				if (!input.length)
					return message.reply(getLang("missingWords"));

				const added = [];
				const exists = [];

				for (const word of input) {
					if (merged.includes(word)) {
						exists.push(word);
					} else {
						merged.push(word);
						added.push(word);
					}
				}

				await threadsData.set(
					event.threadID, merged, "data.badWords.words"
				);

				let reply = "";
				if (added.length)
					reply += getLang("addedSuccess", added.length);
				if (exists.length)
					reply += "\n" + getLang(
						"alreadyExist", exists.length, exists.join(", ")
					);

				return message.reply(reply || getLang("missingWords"));
			}

			case "delete":
			case "del": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin2"));

				const input = args.slice(1).join(" ")
					.split(/[,|]/)
					.map(w => w.trim().toLowerCase())
					.filter(Boolean);

				if (!input.length)
					return message.reply(getLang("missingWords2"));

				const removed = [];
				const missing = [];

				for (const word of input) {
					const index = merged.indexOf(word);
					if (index !== -1) {
						merged.splice(index, 1);
						removed.push(word);
					} else {
						missing.push(word);
					}
				}

				await threadsData.set(
					event.threadID, merged, "data.badWords.words"
				);

				let reply = "";
				if (removed.length)
					reply += getLang("deletedSuccess", removed.length);
				if (missing.length)
					reply += "\n" + getLang(
						"notExist", missing.length, missing.join(", ")
					);

				return message.reply(reply);
			}

			case "list": {
				if (!merged.length)
					return message.reply(getLang("emptyList"));
				return message.reply(
					getLang("badWordsList", merged.join(", "))
				);
			}

			case "on": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin3"));
				await threadsData.set(
					event.threadID, true, "settings.badWords"
				);
				return message.reply(getLang("turnedOnOrOff", "ON"));
			}

			case "off": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin3"));
				await threadsData.set(
					event.threadID, false, "settings.badWords"
				);
				return message.reply(getLang("turnedOnOrOff", "OFF"));
			}

			case "unwarn": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin4"));

				const userID = event.mentions &&
					Object.keys(event.mentions)[0] ||
					args[1] ||
					(event.messageReply && event.messageReply.senderID);

				if (!userID || !/^\d+$/.test(String(userID)))
					return message.reply(getLang("missingTarget"));

				const violations = await threadsData.get(
					event.threadID, "data.badWords.violationUsers", {}
				);

				if (!violations[userID])
					return message.reply(getLang("notWarned"));

				violations[userID]--;
				if (violations[userID] <= 0)
					delete violations[userID];

				await threadsData.set(
					event.threadID, violations,
					"data.badWords.violationUsers"
				);

				return message.reply(getLang("unwarned", userID));
			}

			default:
				return message.reply(
					"Commands: add, delete, list, on, off, unwarn"
				);
		}
	},

	onChat: async function ({
		message, event, api, threadsData, prefix, getLang
	}) {
		if (!event.body || !event.senderID)
			return;

		const threadData =
			global.db.allThreadData.find(
				t => t.threadID === event.threadID
			) || await threadsData.create(event.threadID);

		if (!threadData.settings.badWords)
			return;

		const command = event.body.trim().toLowerCase();
		const aliases = ["badwords", "badword"];
		if (aliases.some(a => command.startsWith((prefix || "") + a)))
			return;

		// Never warn or kick an admin. Fail safe if admin status is unknown.
		const threadInfo = await new Promise(resolve => {
			api.getThreadInfo(event.threadID, (err, info) => {
				resolve(err ? null : info);
			});
		});

		if (!threadInfo || !Array.isArray(threadInfo.adminIDs))
			return;

		const adminIDs = threadInfo.adminIDs.map(admin =>
			String(typeof admin === "object" ? admin.id : admin)
		);

		if (adminIDs.includes(String(event.senderID)))
			return;

		const savedWords =
			threadData.data.badWords?.words || [];

		const words = [...new Set([
			...savedWords,
			...DEFAULT_BAD_WORDS
		])];

		if (words.length !== savedWords.length) {
			await threadsData.set(
				event.threadID, words, "data.badWords.words"
			);
		}

		const body = event.body.toLowerCase()
			.replace(/[\u200B-\u200D\uFEFF]/g, "");

		// Example: text**** or hello*** is treated as masked text.
		const maskedMatch = /[\p{L}\p{N}_]+\*{2,}/u.test(body);

		let detectedWord = maskedMatch ? "masked text" : null;

		if (!detectedWord) {
			for (const word of words) {
				const escaped = word.replace(
					/[.*+?^${}()|[\]\\]/g, "\\$&"
				);
				const flexible = escaped.replace(
					/\s+/g, "[\\s._-]*"
				);

				const regex = new RegExp(
					`(?:^|[^\\p{L}\\p{N}_])${flexible}(?:$|[^\\p{L}\\p{N}_])`,
					"iu"
				);

				if (regex.test(body)) {
					detectedWord = word;
					break;
				}
			}
		}

		if (!detectedWord)
			return;

		const violations = await threadsData.get(
			event.threadID, "data.badWords.violationUsers", {}
		);

		const count = violations[event.senderID] || 0;

		if (count < 1) {
			violations[event.senderID] = 1;

			await threadsData.set(
				event.threadID, violations,
				"data.badWords.violationUsers"
			);

			return message.reply(getLang("warned"));
		}

		await message.reply(getLang("warned2"));

		// Recheck admin status immediately before attempting to kick.
		api.getThreadInfo(event.threadID, (err, info) => {
			if (err || !info || !Array.isArray(info.adminIDs))
				return;

			const latestAdmins = info.adminIDs.map(admin =>
				String(typeof admin === "object" ? admin.id : admin)
			);

			if (latestAdmins.includes(String(event.senderID)))
				return;

			api.removeUserFromGroup(
				event.senderID,
				event.threadID,
				err => {
					if (err)
						console.error(
							"[badwords] Kick failed:", err
						);
				}
			);
		});
	}
};
