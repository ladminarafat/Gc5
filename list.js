
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "list",
    aliases: ["memberlist", "uidlist"],
    version: "1.0.0",
    author: "ChatGPT",
    countDown: 5,
    role: 1,
    description: "Track active and inactive group members",
    category: "box chat",
    guide: {
      en: "{pn} mm\n{pn} kill"
    }
  },

  onStart: async function ({
    args, event, message, api, threadsData
  }) {
    const { threadID } = event;
    const action = (args[0] || "").toLowerCase();
    const prefix = getPrefix(threadID);
    const path = "data.listTracker";

    const tracker = await threadsData.get(threadID, path) || {
      active: {},
      startedAt: Date.now()
    };

    if (!tracker.active) tracker.active = {};

    if (action === "mm") {
      const info = await api.getThreadInfo(threadID);
      const members = (info.participantIDs || []).map(String);
      const botID = String(api.getCurrentUserID());

      const active = members.filter(uid =>
        uid !== botID && tracker.active[uid]
      );

      const inactive = members.filter(uid =>
        uid !== botID && !tracker.active[uid]
      );

      const output = [
        "📋 GROUP MEMBER LIST",
        `👥 Total Members: ${members.length}`,
        `🟢 Active Members: ${active.length}`,
        `🔴 Inactive Members: ${inactive.length}`,
        "",
        "🟢 ACTIVE UID LIST:",
        ...(active.length ? active : ["None"]),
        "",
        "🔴 INACTIVE UID LIST:",
        ...(inactive.length ? inactive : ["None"])
      ];

      return message.reply(output.join("\n"));
    }

    if (action === "kill") {
      const info = await api.getThreadInfo(threadID);
      const botID = String(api.getCurrentUserID());
      const members = (info.participantIDs || []).map(String);

      const inactive = members.filter(uid =>
        uid !== botID && !tracker.active[uid]
      );

      if (!inactive.length)
        return message.reply("✅ No inactive members found.");

      await message.reply(
        `⚠️ ${inactive.length} members have no recorded messages. Removing them...`
      );

      let removed = 0;
      const failed = [];

      for (const uid of inactive) {
        try {
          await api.removeUserFromGroup(uid, threadID);
          removed++;
        } catch (error) {
          failed.push(uid);
        }
      }

      return message.reply(
        `✅ Removed: ${removed}\n❌ Failed: ${failed.length}` +
        (failed.length ? `\n\nFailed UIDs:\n${failed.join("\n")}` : "") +
        "\n\n⚠️ Only messages recorded while tracking was active are counted."
      );
    }

    return message.reply(
      `Usage:\n${prefix}list mm\n${prefix}list kill`
    );
  },

  onChat: async function ({ event, threadsData }) {
    const { threadID, senderID, body } = event;

    if (!threadID || !senderID || !body || !String(body).trim())
      return;

    const path = "data.listTracker";

    const tracker = await threadsData.get(threadID, path) || {
      active: {},
      startedAt: Date.now()
    };

    if (!tracker.active || typeof tracker.active !== "object")
      tracker.active = {};

    const uid = String(senderID);
    const previous = tracker.active[uid] || {};

    tracker.active[uid] = {
      firstMessageAt: previous.firstMessageAt || Date.now(),
      lastMessageAt: Date.now(),
      messageCount: (previous.messageCount || 0) + 1
    };

    await threadsData.set(threadID, tracker, path);
  }
};
                                    
