const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

if (!global.temp.welcomeMessageID)
	global.temp.welcomeMessageID = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.5.2",
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

			// Only work when replying to bot's welcome message
			if (
				welcomeID &&
				event.messageReply.messageID == welcomeID
			) {
				const text = event.body
					.toLowerCase()
					.trim();

				// Thanks keywords
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

				// If message contains "name" → 🤍 reaction
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

		// Don't send welcome when bot itself is added
		if (
			dataAddedParticipants.some(
				user =>
					user.userFbId == api.getCurrentUserID()
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
					// CREATE MENTIONS
					// =================================================

					for (const user of participants) {

						// Skip banned users
						if (
							dataBanned.some(
								item =>
									item.id ==
									user.userFbId
							)
						) {
							continue;
						}

						const name =
							user.fullName;

						const id =
							user.userFbId;

						/*
						 * IMPORTANT
						 *
						 * @ is only used in body.
						 * tag MUST NOT contain @.
						 */

						welcomeNames.push(
							`@${name}`
						);

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
					// SEND WELCOME WITH ACTIVE MENTION
					// =================================================

					const sentMessage =
						await new Promise(
							(resolve, reject) => {

								api.sendMessage(
									{
										body: welcomeText,

										// Active Facebook mentions
										mentions: mentions,

										attachment:
											response.data
									},

									threadID,

									(err, info) => {

										if (err) {
											return reject(err);
										}

										resolve(info);
									}
								);
							}
						);

					// =================================================
					// SAVE WELCOME MESSAGE ID
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
