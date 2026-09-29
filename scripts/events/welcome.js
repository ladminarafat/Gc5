const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

if (!global.temp.welcomeMessageID)
	global.temp.welcomeMessageID = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.5.3",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api }) => {

		// =========================================================
		// WELCOME REPLY SYSTEM
		// =========================================================

		if (
			event.body &&
			event.messageReply &&
			event.messageReply.messageID
		) {
			const threadID = event.threadID;

			const welcomeID =
				global.temp.welcomeMessageID[threadID];

			if (
				welcomeID &&
				event.messageReply.messageID == welcomeID
			) {
				const text = event.body
					.toLowerCase()
					.trim();

				const thanksWords = [
					"thanks",
					"thank",
					"thank you",
					"tnks",
					"tnk",
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

				// "name" থাকলে 🤍 reaction
				if (/\bname\b/i.test(event.body)) {
					await api.setMessageReaction(
						"🤍",
						event.messageID,
						() => {},
						true
					);
					return;
				}
			}
		}

		// =========================================================
		// WELCOME EVENT
		// =========================================================

		if (event.logMessageType != "log:subscribe")
			return;

		const { threadID } = event;

		const dataAddedParticipants =
			event.logMessageData.addedParticipants;

		// Bot নিজে add হলে welcome পাঠাবে না
		if (
			dataAddedParticipants.some(
				user =>
					String(user.userFbId) ===
					String(api.getCurrentUserID())
			)
		) {
			return;
		}

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

					// =================================================
					// CHECK WELCOME SETTING
					// =================================================

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

					// =================================================
					// CREATE WELCOME USERS
					// =================================================

					for (const user of participants) {

						// Banned user skip
						if (
							dataBanned.some(
								item =>
									String(item.id) ===
									String(user.userFbId)
							)
						) {
							continue;
						}

						const name =
							String(user.fullName || "Member");

						const id =
							String(user.userFbId);

						// Body-তে @ থাকবে
						const mentionText =
							`@${name}`;

						welcomeNames.push(
							mentionText
						);

						/*
						 * IMPORTANT:
						 *
						 * tag = name WITHOUT @
						 * id  = Facebook user ID
						 *
						 * fromIndex পরে exact position
						 * অনুযায়ী set করা হবে.
						 */

						mentions.push({
							tag: name,
							id: id
						});
					}

					if (mentions.length === 0) {
						delete global.temp.welcomeEvent[
							threadID
						];
						return;
					}

					// =================================================
					// WELCOME TEXT
					// =================================================

					const welcomeText =
						`𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ${welcomeNames.join(", ")}`;

					// =================================================
					// SET EXACT MENTION POSITION
					// =================================================

					let searchFrom = 0;

					for (const mention of mentions) {

						const mentionText =
							`@${mention.tag}`;

						const fromIndex =
							welcomeText.indexOf(
								mentionText,
								searchFrom
							);

						if (fromIndex !== -1) {

							mention.fromIndex =
								fromIndex;

							searchFrom =
								fromIndex +
								mentionText.length;
						}
					}

					// =================================================
					// WELCOME IMAGE
					// =================================================

					const imageUrl =
						"https://i.ibb.co/6Jqnd88y/IMG-20260928-165303-402.jpg";

					const response =
						await axios.get(
							imageUrl,
							{
								responseType: "stream"
							}
						);

					// =================================================
					// SEND MESSAGE
					// =================================================

					const sentMessage =
						await new Promise(
							(resolve, reject) => {

								api.sendMessage(
									{
										body: welcomeText,

										// Active mention metadata
										mentions: mentions,

										attachment:
											response.data
									},

									threadID,

									(err, info) => {

										if (err) {
											console.error(
												"Send welcome error:",
												err
											);

											return reject(err);
										}

										resolve(info);
									}
								);
							}
						);

					// =================================================
					// SAVE MESSAGE ID
					// =================================================

					let welcomeMessageID =
						null;

					if (
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
					else if (
						typeof sentMessage === "string"
					) {
						welcomeMessageID =
							sentMessage;
					}

					if (welcomeMessageID) {

						global.temp.welcomeMessageID[
							threadID
						] = welcomeMessageID;
					}

					// =================================================
					// CLEAN TEMP DATA
					// =================================================

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
