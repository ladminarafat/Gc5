const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

const { getTime } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "3.0.0",
		author: "ST | Sheikh Tamim & Edit",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api, usersData }) => {
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
					if (threadData.settings && threadData.settings.sendWelcomeMessage === false) return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const userName = [], mentions = [];

					for (const user of dataAddedParticipants) {
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0) return;

					const cacheDir = path.join(__dirname, "cache");
					if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
					const imagePath = path.join(cacheDir, `welcome_card_${threadID}.png`);

					try {
						// Create Canvas Card
						const canvas = createCanvas(800, 1000);
						const ctx = canvas.getContext("2d");

						// Draw Background Text Box (Card Top)
						ctx.fillStyle = "#282a36";
						ctx.fillRect(0, 0, 800, 450);

						// Text Styles
						ctx.fillStyle = "#ffffff";
						ctx.font = "bold 38px Sans-serif";
						ctx.fillText("💖 Welcome to Our Group 💖", 50, 70);

						ctx.fillStyle = "#ff79c6";
						ctx.font = "bold 32px Sans-serif";
						ctx.fillText(`🎀 ${userName.join(", ")} 🎀`, 50, 150);

						ctx.fillStyle = "#f1fa8c";
						ctx.font = "italic 26px Sans-serif";
						ctx.fillText("Destiny has brought you together ✨", 50, 240);
						ctx.fillText("May your bond last forever 🌹", 50, 290);

						ctx.fillStyle = "#ff5555";
						ctx.font = "bold 30px Sans-serif";
						ctx.fillText("💖 Compatibility: 100% 💖", 50, 380);

						// Load Bottom Image
						const bgImage = await loadImage("https://i.ibb.co/YTVRrXXN/1000025531.jpg");
						ctx.drawImage(bgImage, 0, 450, 800, 550);

						// Save Image to Local Cache
						const buffer = canvas.toBuffer("image/png");
						fs.writeFileSync(imagePath, buffer);

						// Send Final Canvas Card with Text Mention
						await message.send({
							body: `Welcome ${userName.join(", ")}! ✨`,
							mentions: mentions,
							attachment: fs.createReadStream(imagePath)
						});

						if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

					} catch (err) {
						console.error("Canvas Welcome Error:", err);
					}

					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
