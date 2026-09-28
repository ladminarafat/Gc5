const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "3.6.0",
		author: "ST | Sheikh Tamim & Edit",
		category: "events"
	},

	langs: {
		vi: {
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1",
			defaultWelcomeMessage: "👀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄  ⏩  {userNameTag}"
		},
		en: {
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1",
			defaultWelcomeMessage: "👀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄  ⏩  {userNameTag}"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const { threadID } = event;
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					
					if (threadData.settings && threadData.settings.sendWelcomeMessage === false)
						return;
						
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const userName = [], mentions = [];

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId)) continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0) return;

					// কাস্টম টেক্সট ও মেনশন ফরম্যাট
					const welcomeText = `👀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄  ⏩  ${userName.map(name => `@${name}`).join(", ")}`;

					const form = {
						body: welcomeText,
						mentions: mentions
					};

					// Shinobu Kocho ইমেজের লিংক
					const imageUrl = "https://i.ibb.co/YTVRrXXN/1000025531.jpg";
					const cacheDir = path.join(__dirname, "cache");
					if (!fs.existsSync(cacheDir)) {
						fs.mkdirSync(cacheDir, { recursive: true });
					}
					const imagePath = path.join(cacheDir, `welcome_${threadID}.jpg`);

					try {
						const response = await axios({
							url: imageUrl,
							method: "GET",
							responseType: "stream"
						});

						const writer = fs.createWriteStream(imagePath);
						response.data.pipe(writer);

						await new Promise((resolve, reject) => {
							writer.on("finish", resolve);
							writer.on("error", reject);
						});

						form.attachment = fs.createReadStream(imagePath);

						await message.send(form);
						if (fs.existsSync(imagePath)) {
							fs.unlinkSync(imagePath);
						}
					} catch (err) {
						console.error("Welcome image error:", err.message);
						await message.send(form);
					}

					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
