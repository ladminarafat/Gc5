const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.5.0",
		author: "ST | Sheikh Tamim & Edit",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "💖 Welcome to Our Group 💖\n\n🎀 {userNameTag} 🎀\n\n🕊️ Destiny has brought you to 《 {boxName} 》 🌹\nMay your bond last forever ✨\n\n💖 Member #{memberNumber} | Total: {totalMembers} 💖"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `💖 Welcome to Our Group 💖\n\n🎀 {userNameTag} 🎀\n\n🕊️ Destiny has brought you to 《 {boxName} 》 🌹\nMay your bond last forever ✨\n\n💖 Member #{memberNumber} | Total: {totalMembers} 💖`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				
				// New member is bot logic
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

				// If new member added
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
					const threadName = threadData.threadName;
					const userName = [], mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1) multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId)) continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

					let totalMembers = threadData.members ? threadData.members.length : 0;
					
					let memberNumbers = [];
					if (totalMembers > 0) {
						const membersList = threadData.members || [];
						for (const user of dataAddedParticipants) {
							if (!dataBanned.some((item) => item.id == user.userFbId)) {
								const position = membersList.indexOf(user.userFbId) + 1;
								memberNumbers.push(position > 0 ? position : totalMembers);
							}
						}
					}
					const memberNumberText = memberNumbers.length > 0 ? memberNumbers.join(", ") : "?";

					let addedByName = "Unknown";
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
					} catch (err) {}

					let dailyJoins = 0;
					try {
						const today = new Date().toISOString().split('T')[0];
						if (threadData.data.dailyJoinStats && typeof threadData.data.dailyJoinStats === 'object') {
							dailyJoins = threadData.data.dailyJoinStats[today] || 0;
						}
						if (!threadData.data.dailyJoinStats) {
							threadData.data.dailyJoinStats = {};
						}
						threadData.data.dailyJoinStats[today] = (threadData.data.dailyJoinStats[today] || 0) + userName.length;
						await threadsData.set(threadID, { data: threadData.data });
					} catch (err) {}

					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(
							/\{session\}/g,
							hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4")
						)
						.replace(/\{memberNumber\}/g, memberNumberText)
						.replace(/\{totalMembers\}/g, totalMembers.toString())
						.replace(/\{oo\}/g, addedByName)
						.replace(/\{dailyJoins\}/g, dailyJoins.toString());

					const form = {
						body: welcomeMessage,
						mentions: mentions
					};

					// আপলোড করা ইমেজের লিঙ্ক (Shinobu image)
					const imageUrl = "https://i.ibb.co/YTVRrXXN/1000025531.jpg";
					const cacheDir = path.join(__dirname, "cache");
					if (!fs.existsSync(cacheDir)) {
						fs.mkdirSync(cacheDir, { recursive: true });
					}
					const imagePath = path.join(cacheDir, `welcome_${threadID}.jpg`);

					try {
						const response = await axios({
							url: imageUrl,
							method: "GET",
							responseType: "stream"
						});

						const writer = fs.createWriteStream(imagePath);
						response.data.pipe(writer);

						await new Promise((resolve, reject) => {
							writer.on("finish", resolve);
							writer.on("error", reject);
						});

						form.attachment = fs.createReadStream(imagePath);

						await message.send(form);
						if (fs.existsSync(imagePath)) {
							fs.unlinkSync(imagePath);
						}
					} catch (err) {
						await message.send(form);
					}

					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
