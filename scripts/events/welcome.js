const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.5.8",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	langs: {
		vi: {
			welcomeMessage: "Thank you for inviting me in the group! 🤍\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			defaultWelcomeMessage: "{userNameTag} Welcome {emoji}"
		},
		en: {
			welcomeMessage: "Thank you for inviting me in the group! 🤍\n\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
			defaultWelcomeMessage: "{userNameTag} Welcome {emoji}"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				
				// If new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					
					const { threadApproval } = global.GoatBot.config;
					if (threadApproval && threadApproval.enable) {
						try {
							const isAutoApprovedThread = threadApproval.autoApprovedThreads && threadApproval.autoApprovedThreads.includes(threadID);
							
							if (isAutoApprovedThread) {
								await threadsData.set(threadID, { approved: true });
								setTimeout(async () => {
									try {
										await api.sendMessage(getLang("welcomeMessage", prefix), threadID);
									} catch (err) {
										console.error(`Failed to send welcome message to auto-approved thread ${threadID}:`, err.message);
									}
								}, 2000);
								return null;
							}
							
							await threadsData.set(threadID, { approved: false });
							
							if (threadApproval.adminNotificationThreads && threadApproval.adminNotificationThreads.length > 0 && threadApproval.sendNotifications !== false) {
								setTimeout(async () => {
									try {
										let threadInfo = { threadName: "Unknown", participantIDs: [] };
										let addedByName = "Unknown";
										
										try {
											const threadData = await threadsData.get(threadID);
											if (threadData && threadData.threadName && threadData.threadName !== "Unknown") {
												threadInfo.threadName = threadData.threadName;
												threadInfo.participantIDs = threadData.members || [];
											} else {
												const info = await api.getThreadInfo(threadID);
												if (info && info.threadName) threadInfo = info;
											}
										} catch (err) {
											threadInfo.threadName = `Thread ${threadID}`;
										}
										
										try {
											if (event.author) {
												addedByName = await usersData.getName(event.author);
												if (!addedByName || addedByName === "Unknown") {
													const userInfo = await api.getUserInfo(event.author);
													if (userInfo && userInfo[event.author] && userInfo[event.author].name) {
														addedByName = userInfo[event.author].name;
													}
												}
											}
										} catch (err) {
											addedByName = "Unknown User";
										}
										
										const notificationMessage = `🔔 BOT ADDED TO NEW THREAD 🔔\n\n` +
											`📋 Thread Name: ${threadInfo.threadName || "Unknown"}\n` +
											`🆔 Thread ID: ${threadID}\n` +
											`👤 Added by: ${addedByName}\n` +
											`👥 Members: ${threadInfo.participantIDs?.length || 0}\n` +
											`⏰ Time: ${new Date().toLocaleString()}\n\n` +
											`⚠️ This thread is NOT APPROVED. Bot will not respond to any commands.\n` +
											`Use "${prefix}mthread" to manage thread approvals.`;
										
										for (let i = 0; i < threadApproval.adminNotificationThreads.length; i++) {
											const notifyThreadID = threadApproval.adminNotificationThreads[i];
											try {
												if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
												await api.sendMessage(notificationMessage, notifyThreadID);
											} catch (err) {}
										}
									} catch (err) {}
								}, 5000);
							}
							
							if (threadApproval.sendThreadMessage !== false) {
								setTimeout(async () => {
									try {
										await new Promise(resolve => setTimeout(resolve, 5000));
										const warningMessage = `⚠️ This thread is not approved yet. Bot will not respond to any commands until approved by an admin.\n\nUse "${prefix}help" after approval to see available commands.`;
										await api.sendMessage(warningMessage, threadID);
									} catch (err) {}
								}, 10000);
							}
							
							return null;
						} catch (err) {}
					}
					
					setTimeout(async () => {
						try {
							await api.sendMessage(getLang("welcomeMessage", prefix), threadID);
						} catch (err) {}
					}, 2000);
					return null;
				}

				// If new member joined
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					
					if (threadData.settings && threadData.settings.sendWelcomeMessage === false)
						return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const validUsers = [];

					for (const user of dataAddedParticipants) {
						if (!dataBanned.some((item) => item.id == user.userFbId)) {
							validUsers.push(user);
						}
					}

					if (validUsers.length == 0) return;

					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

					// Updated random welcome emojis list (removed 🚩, added 👀)
					const welcomeEmojis = ["🍷", "🐣", "🌸", "🤍", "🦋", "🎀", "🌷", "👀"];
					const randomEmoji = welcomeEmojis[Math.floor(Math.random() * welcomeEmojis.length)];

					// Format normal mention like @Name
					const mentions = [];
					const namesTextArray = [];

					for (const user of validUsers) {
						const mentionTag = `@${user.fullName}`;
						namesTextArray.push(mentionTag);
					}

					const namesFormattedString = namesTextArray.join(", ");

					// Replace placeholders
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, namesFormattedString)
						.replace(/\{emoji\}/g, randomEmoji);

					// Build accurate mentions array with index positions
					let searchIndex = 0;
					for (const user of validUsers) {
						const mentionTag = `@${user.fullName}`;
						const pos = welcomeMessage.indexOf(mentionTag, searchIndex);
						if (pos !== -1) {
							mentions.push({
								tag: user.fullName,
								id: user.userFbId,
								fromIndex: pos
							});
							searchIndex = pos + mentionTag.length;
						}
					}

					const form = {
						body: welcomeMessage,
						mentions: mentions.length > 0 ? mentions : null
					};

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
											
