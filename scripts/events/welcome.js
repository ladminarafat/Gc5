const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

if (!global.temp.welcomeMessageID)
	global.temp.welcomeMessageID = {};

if (!global.temp.welcomePending)
	global.temp.welcomePending = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.6.0",
		author: "Arafat Hassan",
		category: "events"
	},

	onStart: async ({ threadsData, usersData, message, event, api }) => {

		// =====================================================
		// FIRST MESSAGE → INTRO SYSTEM
		// =====================================================

		if (
			event.senderID &&
			event.body &&
			event.logMessageType !== "log:subscribe"
		) {
			const threadID = event.threadID;
			const userID = event.senderID;

			if (
				global.temp.welcomePending[threadID] &&
				global.temp.welcomePending[threadID][userID]
			) {
				// Remove from pending first
				delete global.temp.welcomePending[threadID][userID];

				// Save permanently
				try {
					const oldData = await usersData.get(
						userID,
						"welcomeIntro",
						{}
					);

					oldData[threadID] = true;

					await usersData.set(
						userID,
						oldData,
						"welcomeIntro"
					);
				} catch (err) {
					console.error(
						"Intro data save error:",
						err
					);
				}

				// Ask for intro
				await message.reply(
					"🤍 Intro den apner!"
				);

				return;
			}
		}

		// =====================================================
		// WELCOME EVENT
		// =====================================================

		if (event.logMessageType !== "log:subscribe")
			return;

		const threadID = event.threadID;

		const addedParticipants =
			event.logMessageData.addedParticipants;

		// Bot নিজে add হলে
		if (
			addedParticipants.some(
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
			...addedParticipants
		);

		clearTimeout(
			global.temp.welcomeEvent[threadID].joinTimeout
		);

		global.temp.welcomeEvent[threadID].joinTimeout =
			setTimeout(async () => {
				try {
					const threadData =
						await threadsData.get(threadID);

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

					const mentions = [];
					const welcomeNames = [];

					if (!global.temp.welcomePending[threadID]) {
						global.temp.welcomePending[threadID] = {};
					}

					for (const user of participants) {
						const userID = user.userFbId;
						const name = user.fullName;

						// Check whether user already completed
						let alreadyDone = false;

						try {
							const introData =
								await usersData.get(
									userID,
									"welcomeIntro",
									{}
								);

							if (introData[threadID]) {
								alreadyDone = true;
							}
						} catch (err) {
							console.error(
								"Intro data read error:",
								err
							);
						}

						// If not done, wait for first message
						if (!alreadyDone) {
							global.temp.welcomePending[
								threadID
							][userID] = true;
						}

						/*
						 * IMPORTANT:
						 * @ goes in message text,
						 * NOT inside mentions.tag
						 */
						welcomeNames.push(`@${name}`);

						mentions.push({
							tag: name,
							id: userID
						});
					}

					if (!mentions.length) {
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
					// IMAGE
					// =================================================

					const imageUrl =
						"https://i.ibb.co/6Jqnd88y/IMG-20260928-165303-402.jpg";

					const response = await axios.get(
						imageUrl,
						{
							responseType: "stream"
						}
					);

					// =================================================
					// SEND
					// =================================================

					const sentMessage =
						await message.send({
							body: welcomeText,
							mentions: mentions,
							attachment: response.data
						});

					// Save welcome message ID
					let welcomeID = null;

					if (
						sentMessage &&
						sentMessage.messageID
					) {
						welcomeID =
							sentMessage.messageID;
					}
					else if (
						sentMessage &&
						sentMessage.messageId
					) {
						welcomeID =
							sentMessage.messageId;
					}
					else if (
						typeof sentMessage === "string"
					) {
						welcomeID =
							sentMessage;
					}

					if (welcomeID) {
						global.temp.welcomeMessageID[
							threadID
						] = welcomeID;
					}

					delete global.temp.welcomeEvent[
						threadID
					];

				} catch (error) {
					console.error(
						"Welcome error:",
						error
					);

					delete global.temp.welcomeEvent[
						threadID
					];
				}
			}, 1500);
	}
};
