const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.4.82",
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

			// Bot নিজে group-এ add হলে welcome পাঠাবে না
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

			// New members save
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
							// Banned user skip
							if (
								dataBanned.some(
									item =>
										item.id == user.userFbId
								)
							)
								continue;

							// নাম এবং ট্যাগ উভয়ের সামনে @ যোগ করা হয়েছে
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

						const imageUrl =
							"https://i.ibb.co/6Jqnd88y/IMG-20260928-165303-402.jpg";

						const response = await axios.get(
							imageUrl,
							{
								responseType: "stream"
							}
						);

						// প্রথমে ছবি পাঠানো
						await message.send({
							attachment: response.data
						});

						// ১ সেকেন্ড পর @ সহ ট্যাগ ও টেক্সট পাঠানো
						setTimeout(async () => {
							await message.send({
								body: welcomeText,
								mentions: mentions
							});
						}, 1000);

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
