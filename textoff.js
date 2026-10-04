const fs = require("fs-extra");
const path = require("path");

// গ্রুপ লিস্ট সেভ রাখার জন্য JSON ফাইলের পাথ
const filePath = path.join(__dirname, "cache", "textOffGroups.json");

// ফাইল না থাকলে খালি অ্যারে তৈরি করবে
if (!fs.existsSync(filePath)) {
	fs.ensureDirSync(path.join(__dirname, "cache"));
	fs.writeFileSync(filePath, JSON.stringify([]));
}

module.exports = {
	config: {
		name: "text",
		version: "1.0.0",
		author: "ST | Sheikh Tamim",
		countDown: 0,
		role: 0,
		shortDescription: {
			en: "Toggle auto reaction on messages"
		},
		longDescription: {
			en: "Turn on/off auto ❌ reaction for every text message in the group."
		},
		category: "system",
		guide: {
			en: "{prefix}text off - Turn on react duty\n{prefix}text on - Turn off react duty"
		}
	},

	onStart: async function ({ api, event, args, message }) {
		const { threadID } = event;
		let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

		const option = args[0]?.toLowerCase();

		if (option === "off") {
			if (!data.includes(threadID)) {
				data.push(threadID);
				fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
			}
			return message.reply("Ok boss, I'm on duty");
		} 
		else if (option === "on") {
			if (data.includes(threadID)) {
				data = data.filter(id => id !== threadID);
				fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
			}
			return message.reply("Text react mode has been turned OFF.");
		} 
		else {
			return message.reply("Please use '{prefix}text off' to activate or '{prefix}text on' to deactivate.");
		}
	},

	onEvent: async function ({ api, event }) {
		// কেবল মেসেজ ইভেন্টে রিয়েক্ট করবে
		if (event.type === "message" || event.type === "message_reply") {
			const { threadID, messageID, senderID } = event;

			// বট নিজের মেসেজে রিয়েক্ট করবে না
			if (senderID === api.getCurrentUserID()) return;

			let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

			// যদি গ্রুপটি টেক্সট অফ লিস্টে থাকে, তবে ❌ রিয়েক্ট দেবে
			if (data.includes(threadID)) {
				api.setMessageReaction("❌", messageID, (err) => {
					if (err) console.error(err);
				}, true);
			}
		}
	}
};
        
