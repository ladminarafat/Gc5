const axios = require("axios");
const { getTime } = global.utils;

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.4.78",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	langs: {
		en: {
			welcomeMessage: "Thank you for inviting me to the group!",
			defaultWelcomeMessage: "𝗪𝗘𝗟𝗖𝗢𝗠𝗘 {userNameTag}"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType != "log:subscribe")
			return;

		return async function () {
			const { threadID } = event;
			const dataAddedParticipants = event.logMessageData.addedParticipants;

			// If bot itself was added
			if (dataAddedParticipants.some(
				item => item.userFbId == api.getCurrentUserID()
			)) {
				return;
			}

			if (!global.temp.welcomeEvent[threadID]) {
				global.temp.welcomeEvent[threadID] = {
					joinTimeout: null,
					dataAddedParticipants: []
				};
			}

			global.temp.welcomeEvent[threadID].dataAddedParticipants.push(
				...dataAddedParticipants
			);

			clearTimeout(
				global.temp.welcomeEvent[threadID].joinTimeout
			);

			global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(
				async function () {
					try {
						const threadData = await threadsData.get(threadID);

						if (
							threadData.settings &&
							threadData.settings.sendWelcomeMessage === false
						) {
							delete global.temp.welcomeEvent[threadID];
							return;
						}

						const participants =
							global.temp.welcomeEvent[threadID].dataAddedParticipants;

						const dataBanned =
							threadData.data?.banned_ban || [];

						const mentions = [];
						const names = [];

						for (const user of participants) {
							if (
								dataBanned.some(
									item => item.id == user.userFbId
								)
							)
								continue;

							names.push(user.fullName);

							mentions.push({
								tag: user.fullName,
								id: user.userFbId
							});
						}

						if (names.length === 0) {
							delete global.temp.welcomeEvent[threadID];
							return;
						}

						// Simple welcome message
						const welcomeMessage =
							`𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ${names
								.map(name => `@${name}`)
								.join(", ")}`;

						const form = {
							body: welcomeMessage,
							mentions: mentions
						};

						// Welcome image
						const welcomeImageUrl =
							"https://i.ibb.co/YTVRrXXN/1000025531.jpg";

						try {
							const imageResponse = await axios.get(
								welcomeImageUrl,
								{ responseType: "stream" }
							);

							form.attachment = imageResponse.data;
						} catch (err) {
							console.error(
								"Failed to load welcome image:",
								err.message
							);
						}

						await message.send(form);

						delete global.temp.welcomeEvent[threadID];

					} catch (err) {
						console.error(
							"Welcome event error:",
							err.message
						);

						delete global.temp.welcomeEvent[threadID];
					}
				},
				1500
			);
		};
	}
};
