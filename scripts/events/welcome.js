if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.4.83",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api }) => {
		if (event.logMessageType != "log:subscribe")
			return async function () {};

		return async function () {
			const { threadID } = event;
			const dataAddedParticipants =
				event.logMessageData.addedParticipants;

			// Skip sending welcome message if the bot itself was added to the group
			if (
				dataAddedParticipants.some(
					item => item.userFbId == api.getCurrentUserID()
				)
			)
				return;

			if (!global.temp.welcomeEvent[threadID]) {
				global.temp.welcomeEvent[threadID] = {
					joinTimeout: null,
					dataAddedParticipants: []
				};
			}

			// Save newly added participants
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

						// Skip if welcome message is disabled in thread settings
						if (
							threadData.settings &&
							threadData.settings
								.sendWelcomeMessage === false
						) {
							delete global.temp.welcomeEvent[threadID];
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
							// Skip banned users
							if (
								dataBanned.some(
									item =>
										item.id == user.userFbId
								)
							)
								continue;

							const nameWithAt = `@${user.fullName}`;

							welcomeNames.push(nameWithAt);

							mentions.push({
								tag: nameWithAt,
								id: user.userFbId
							});
						}

						if (mentions.length === 0) {
							delete global.temp.welcomeEvent[threadID];
							return;
						}

						const welcomeText = `WELCOME ${welcomeNames.join(", ")}`;

						// Send text message with mentions
						await message.send({
							body: welcomeText,
							mentions: mentions
						});

						delete global.temp.welcomeEvent[threadID];

					} catch (error) {
						console.error(
							"Welcome message error:",
							error
						);

						delete global.temp.welcomeEvent[threadID];
					}
				}, 1500);
		};
	}
};
