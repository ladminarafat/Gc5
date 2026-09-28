const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "5.0.0",
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
						// ১. মূল ছবি ডাউনলোড ও ক্যানভাস তৈরি
						const bgImage = await loadImage("https://i.ibb.co/YTVRrXXN/1000025531.jpg");
						
						const width = bgImage.width;
						const height = bgImage.height;
						const headerHeight = 100; // উপরের কালো বারের উচ্চতা

						const canvas = createCanvas(width, height + headerHeight);
						const ctx = canvas.getContext("2d");

						// ২. উপরে কালো ব্যাকগ্রাউন্ড আঁকা
						ctx.fillStyle = "#121212";
						ctx.fillRect(0, 0, width, headerHeight);

						// ৩. টেক্সট বসানো (WELCOME @Name)
						ctx.fillStyle = "#ffffff";
						ctx.font = "bold 45px Sans-serif";
						const welcomeText = `WELCOME  @${userName.join(", ")}`;
						ctx.fillText(welcomeText, 50, 65);

						// ৪. নিচে আসল ছবি ড্র করা
						ctx.drawImage(bgImage, 0, headerHeight, width, height);

						// ৫. ক্যাশ সেভ করা
						const buffer = canvas.toBuffer("image/png");
						fs.writeFileSync(imagePath, buffer);

						// ৬. ছবি আকারে সেন্ড করা + ট্যাগ নোটিফিকেশন দেওয়া
						await message.send({
							body: `@${userName.join(", ")}`, // নোটিফিকেশন যাওয়ার জন্য ট্যাগের লেখা
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
