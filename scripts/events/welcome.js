const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

if (!global.temp.welcomeMessageID)
	global.temp.welcomeMessageID = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.5.0",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api }) => {

		/*
		 * =========================================================
		 * WELCOME REPLY SYSTEM
		 * =========================================================
		 */

		if (
			event.body &&
			event.messageReply &&
			event.messageReply.messageID
		) {
			const threadID = event.threadID;

			const savedWelcomeID =
				global.temp.welcomeMessageID[threadID];

			// Only work when replying to bot's welcome message
			if (
				savedWelcomeID &&
				event.messageReply.messageID == savedWelcomeID
			) {
				const text = event.body
					.toLowerCase()
					.trim();

				/*
				 * Thanks / Thank / Tnks / Tnx / Thx / Ty
				 */
				const thanksWords = [
					"thanks",
					"thank",
					"thank you",
					"tnks",
					"tnx",
					"thx",
					"ty",
					"thanku",
					"thankyou"
				];

				const isThanks = thanksWords.some(word =>
					text.includes(word)
				);

				if (isThanks) {
					await message.reply(
						"🤍 Intro den apner"
					);
					return;
				}

				/*
				 * If user writes "name" anywhere
				 * → react 🤍
				 */
				if (/\bname\b/i.test(event.body)) {
					await api.setMessageReaction(
						"🤍",
						event.messageID,
						(err) => {},
						true
					);

					return;
				}
			}
		}

		/*
		 * =========================================================
		 * WELCOME EVENT
		 * =========================================================
		 */

		if (event.logMessageType != "log:subscribe")
			return;

		const { threadID } = event;

		const dataAddedParticipants =
			event.logMessageData.addedParticipants;

		// Bot নিজে add হলে welcome পাঠাবে না
		if (
			dataAddedParticipants.some(
				item =>
					item.userFbId ==
					api.getCurrentUserID()
			)
		)
			return;

		if (!global.temp.welcomeEvent[threadID]) {
			global.temp.welcomeEvent[threadID] = {
				joinTimeout: null,
				dataAddedParticipants: []
			};
		}

		global.temp.welcomeEvent[
			threadID
		].dataAddedParticipants.push(
			...dataAddedParticipants
		);

		clearTimeout(
			global.temp.welcomeEvent[threadID].joinTimeout
		);

		global.temp.welcomeEvent[threadID].joinTimeout =
			setTimeout(async function () {
				try {
					const threadData =
						await threadsData.get(threadID);

					// Welcome disabled হলে
					if (
						threadData.settings &&
						threadData.settings
							.sendWelcomeMessage === false
					) {
						delete global.temp.welcomeEvent[
							threadID
						];
						return;
					}

					const participants =
						global.temp.welcomeEvent[
							threadID
						].dataAddedParticipants;

					const dataBanned =
						threadData.data?.banned_ban || [];

					const mentions = [];
					const welcomeNames = [];

					for (const user of participants) {

						// Banned user skip
						if (
							dataBanned.some(
								item =>
									item.id ==
									user.userFbId
							)
						)
							continue;

						welcomeNames.push(
							`@${user.fullName}`
						);

						mentions.push({
							tag: `@${user.fullName}`,
							id: user.userFbId
						});
					}

					if (mentions.length === 0) {
						delete global.temp.welcomeEvent[
							threadID
						];
						return;
					}

					/*
					 * Welcome text
					 */
					const welcomeText =
						`𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ${welcomeNames.join(", ")}`;

					/*
					 * Welcome image
					 */
					const imageUrl =
						"https://i.ibb.co/6Jqnd88y/IMG-20260928-165303-402.jpg";

					const response =
						await axios.get(imageUrl, {
							responseType: "stream"
						});

					const form = {
						body: welcomeText,
						mentions: mentions,
						attachment: response.data
					};

					/*
					 * Send welcome
					 */
					const sentMessage =
						await message.send(form);

					/*
					 * Save welcome message ID
					 * so only replies to this message
					 * trigger the special replies.
					 */
					let welcomeMessageID = null;

					if (typeof sentMessage === "string") {
						welcomeMessageID = sentMessage;
					}
					else if (
						sentMessage &&
						sentMessage.messageID
					) {
						welcomeMessageID =
							sentMessage.messageID;
					}
					else if (
						sentMessage &&
						sentMessage.messageId
					) {
						welcomeMessageID =
							sentMessage.messageId;
					}

					if (welcomeMessageID) {
						global.temp.welcomeMessageID[
							threadID
						] = welcomeMessageID;
					}

					delete global.temp.welcomeEvent[
						threadID
					];

				} catch (error) {
					console.error(
						"Welcome message error:",
						error
					);

					delete global.temp.welcomeEvent[
						threadID
					];
				}
			}, 1500);
	}
};
