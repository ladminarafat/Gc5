const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

if (!global.temp.welcomeMessageID)
	global.temp.welcomeMessageID = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.6.0",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	onStart: async ({
		threadsData,
		message,
		event,
		api,
		usersData
	}) => {

		// =========================================================
		// FIRST MESSAGE INTRO SYSTEM
		// =========================================================

		/*
		 * Only users who were newly added and successfully
		 * welcomed by this bot will be tracked.
		 *
		 * Existing group members are NOT tracked.
		 */

		if (
			event.senderID &&
			event.body &&
			event.logMessageType != "log:subscribe"
		) {
			const userID = event.senderID;
			const threadID = event.threadID;

			// Ignore bot's own messages
			if (userID != api.getCurrentUserID()) {
				try {
					const introData =
						await usersData.get(
							userID,
							"welcomeIntro",
							{}
						);

					// New member's first message
					if (
						introData &&
						introData[threadID] === "pending"
					) {
						introData[threadID] = true;

						await usersData.set(
							userID,
							"welcomeIntro",
							introData
						);

						await message.reply(
							"Intro den apner!🤍"
						);

						return;
					}

				} catch (error) {
					console.error(
						"Intro system error:",
						error
					);
				}
			}
		}

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
						"Intro den apner ! 🤍"
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
					// PREPARE MENTIONS
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

						const name = user.fullName;
						const id = user.userFbId;

						// @ only in message text
						welcomeNames.push(`@${name}`);

						// @ must NOT be inside tag
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
					// SAME WELCOME IMAGE
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
					// SEND WELCOME
					// =================================================

					const sentMessage =
						await message.send({
							body: welcomeText,
							mentions: mentions,
							attachment: response.data
						});

					// =================================================
					// SAVE WELCOME MESSAGE ID
					// =================================================

					let welcomeMessageID = null;

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
					// SAVE ONLY NEWLY WELCOMED USERS
					// =================================================

					/*
					 * IMPORTANT:
					 *
					 * This is done AFTER the welcome message
					 * is successfully sent.
					 *
					 * Therefore:
					 * - Existing members → NOT tracked
					 * - New members → tracked
					 * - Welcome disabled → NOT tracked
					 * - Banned users → NOT tracked
					 */

					for (const user of participants) {

						const userID =
							user.userFbId;

						// Skip bot
						if (
							!userID ||
							userID ==
								api.getCurrentUserID()
						) {
							continue;
						}

						// Skip banned users
						if (
							dataBanned.some(
								item =>
									item.id ==
									userID
							)
						) {
							continue;
						}

						try {

							const introData =
								await usersData.get(
									userID,
									"welcomeIntro",
									{}
								);

							/*
							 * Only this newly-added
							 * member gets pending status.
							 */

							if (
								!introData ||
								!introData[threadID]
							) {

								const newIntroData =
									introData || {};

								newIntroData[
									threadID
								] = "pending";

								await usersData.set(
									userID,
									"welcomeIntro",
									newIntroData
								);
							}

						} catch (error) {

							console.error(
								"Saving intro status error:",
								error
							);
						}
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
