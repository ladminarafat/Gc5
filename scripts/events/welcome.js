const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

if (!global.temp.welcomeMessageID)
	global.temp.welcomeMessageID = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.7.0",
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
		 * Only NEWLY ADDED members are saved as "pending".
		 *
		 * Existing members are never added automatically.
		 *
		 * First message:
		 * Intro den apner ! 🤍
		 *
		 * After that:
		 * status = true
		 */

		if (
			event.senderID &&
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

					if (
						introData &&
						introData[threadID] === "pending"
					) {

						// Mark completed BEFORE replying
						// so it cannot trigger twice
						introData[threadID] = true;

						await usersData.set(
							userID,
							"welcomeIntro",
							introData
						);

						await message.reply(
							"Intro den apner ! 🤍"
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

			// Only work when replying to bot's welcome
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

				const isThanks =
					thanksWords.some(word =>
						text.includes(word)
					);

				if (isThanks) {

					await message.reply(
						"Intro den apner ! 🤍"
					);

					return;
				}

				// "name" → 🤍 reaction
				if (
					/\bname\b/i.test(event.body)
				) {

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

		if (
			event.logMessageType != "log:subscribe"
		) {
			return;
		}

		const { threadID } = event;

		const dataAddedParticipants =
			event.logMessageData &&
			event.logMessageData.addedParticipants;

		if (
			!dataAddedParticipants ||
			dataAddedParticipants.length === 0
		) {
			return;
		}

		// =========================================================
		// DON'T WELCOME BOT ITSELF
		// =========================================================

		if (
			dataAddedParticipants.some(
				user =>
					user.userFbId ==
					api.getCurrentUserID()
			)
		) {
			return;
		}

		// =========================================================
		// GET THREAD DATA
		// =========================================================

		let threadData;

		try {

			threadData =
				await threadsData.get(threadID);

		} catch (error) {

			console.error(
				"Thread data error:",
				error
			);

			return;
		}

		// =========================================================
		// CHECK WELCOME SETTING
		// =========================================================

		if (
			threadData.settings &&
			threadData.settings.sendWelcomeMessage === false
		) {
			return;
		}

		const dataBanned =
			threadData.data?.banned_ban || [];

		// =========================================================
		// SAVE ONLY NEW MEMBERS AS PENDING
		// =========================================================

		/*
		 * IMPORTANT:
		 *
		 * This runs ONLY when Facebook sends
		 * log:subscribe.
		 *
		 * So existing group members are NOT touched.
		 */

		for (
			const user of dataAddedParticipants
		) {

			const userID =
				user.userFbId;

			// Ignore bot
			if (
				!userID ||
				userID == api.getCurrentUserID()
			) {
				continue;
			}

			// Ignore banned users
			if (
				dataBanned.some(
					item =>
						item.id == userID
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
				 * Don't overwrite an already completed
				 * user if they are added again.
				 */

				if (
					!introData ||
					!introData[threadID]
				) {

					const newIntroData =
						introData || {};

					newIntroData[threadID] =
						"pending";

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

		// =========================================================
		// CREATE WELCOME EVENT
		// =========================================================

		if (
			!global.temp.welcomeEvent[threadID]
		) {

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
			global.temp.welcomeEvent[
				threadID
			].joinTimeout
		);

		// =========================================================
		// SEND WELCOME AFTER 1.5 SECOND
		// =========================================================

		global.temp.welcomeEvent[
			threadID
		].joinTimeout = setTimeout(
			async function () {

				try {

					const participants =
						global.temp.welcomeEvent[
							threadID
						].dataAddedParticipants;

					const mentions = [];
					const welcomeNames = [];

					// =================================================
					// PREPARE ACTIVE MENTIONS
					// =================================================

					for (
						const user of participants
					) {

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

						const userID =
							user.userFbId;

						const name =
							user.fullName ||
							"New Member";

						/*
						 * Message text
						 */
						welcomeNames.push(
							`@${name}`
						);

						/*
						 * IMPORTANT:
						 *
						 * tag = name WITHOUT @
						 * id  = Facebook user ID
						 *
						 * This creates the actual
						 * Facebook mention.
						 */

						mentions.push({
							tag: name,
							id: userID
						});
					}

					if (
						mentions.length === 0
					) {

						delete global.temp
							.welcomeEvent[
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
					// SAME IMAGE
					// =================================================

					const imageUrl =
						"https://i.ibb.co/6Jqnd88y/IMG-20260928-165303-402.jpg";

					const response =
						await axios.get(
							imageUrl,
							{
								responseType:
									"stream"
							}
						);

					// =================================================
					// SEND MESSAGE
					// =================================================

					const sentMessage =
						await message.send({
							body: welcomeText,

							/*
							 * Active Facebook mentions
							 */
							mentions: mentions,

							attachment:
								response.data
						});

					// =================================================
					// GET MESSAGE ID
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
						typeof sentMessage ===
						"string"
					) {

						welcomeMessageID =
							sentMessage;
					}

					// =================================================
					// SAVE WELCOME MESSAGE ID
					// =================================================

					if (
						welcomeMessageID
					) {

						global.temp
							.welcomeMessageID[
								threadID
							] =
							welcomeMessageID;
					}

					// =================================================
					// CLEAN TEMP
					// =================================================

					delete global.temp
						.welcomeEvent[
							threadID
						];

				} catch (error) {

					console.error(
						"Welcome message error:",
						error
					);

					/*
					 * If welcome failed, remove
					 * pending status for these users
					 * so they aren't incorrectly
					 * treated as welcomed.
					 */

					const participants =
						global.temp.welcomeEvent[
							threadID
						]?.dataAddedParticipants ||
						[];

					for (
						const user of participants
					) {

						try {

							const userID =
								user.userFbId;

							if (
								!userID
							) {
								continue;
							}

							const introData =
								await usersData.get(
									userID,
									"welcomeIntro",
									{}
								);

							if (
								introData &&
								introData[
									threadID
								] === "pending"
							) {

								delete introData[
									threadID
								];

								await usersData.set(
									userID,
									"welcomeIntro",
									introData
								);
							}

						} catch (e) {

							console.error(
								"Intro cleanup error:",
								e
							);
						}
					}

					delete global.temp
						.welcomeEvent[
							threadID
						];
				}

			},
			1500
		);
	}
};
