
const { getPrefix } = global.utils;

const TRACKER_PATH = "data.listTracker";

function getSenderID(event) {
  return event && (
    event.senderID ||
    event.userID ||
    event.authorID
  );
}

async function readTracker(threadsData, threadID) {
  const data = await threadsData.get(
    String(threadID),
    TRACKER_PATH
  );

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {
      active: {},
      startedAt: Date.now()
    };
  }

  if (
    !data.active ||
    typeof data.active !== "object" ||
    Array.isArray(data.active)
  ) {
    data.active = {};
  }

  if (!data.startedAt) {
    data.startedAt = Date.now();
  }

  return data;
}

async function recordActivity({
  api,
  event,
  threadsData
}) {
  if (
    !event ||
    !event.threadID ||
    !event.messageID
  ) {
    return;
  }

  if (
    event.type &&
    !["message", "message_reply"].includes(event.type)
  ) {
    return;
  }

  const senderID = getSenderID(event);

  if (!senderID) return;

  const threadID = String(event.threadID);
  const uid = String(senderID);

  const botID =
    typeof api.getCurrentUserID === "function"
      ? String(api.getCurrentUserID())
      : "";

  if (uid === botID) return;

  try {
    const tracker = await readTracker(
      threadsData,
      threadID
    );

    const now = Date.now();
    const previous = tracker.active[uid] || {};

    tracker.active[uid] = {
      firstMessageAt:
        previous.firstMessageAt || now,
      lastMessageAt: now,
      messageCount:
        (Number(previous.messageCount) || 0) + 1
    };

    await threadsData.set(
      threadID,
      tracker,
      TRACKER_PATH
    );
  } catch (error) {
    console.error(
      "[list] Save error:",
      error
    );
    return;
  }

  try {
    if (
      typeof api.setMessageReaction === "function"
    ) {
      api.setMessageReaction(
        "🪶",
        event.messageID,
        () => {},
        true
      );
    }
  } catch (error) {
    console.error(
      "[list] Reaction error:",
      error
    );
  }
}

module.exports = {
  config: {
    name: "list",
    aliases: ["memberlist", "uidlist"],
    version: "1.4.0",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    description:
      "Track group activity and list member UIDs",
    category: "box chat",
    guide: {
      en:
        "{pn} mm - Show member activity list\n" +
        "{pn} kill - Remove members not yet detected"
    }
  },

  onStart: async function ({
    args,
    event,
    message,
    api,
    threadsData
  }) {
    const threadID = String(event.threadID);
    const prefix = getPrefix(threadID);
    const action = String(
      args[0] || ""
    ).toLowerCase();

    const tracker = await readTracker(
      threadsData,
      threadID
    );

    const activeMap = tracker.active;

    if (action === "mm") {
      const info = await api.getThreadInfo(
        threadID
      );

      const botID = String(
        api.getCurrentUserID()
      );

      const members = [
        ...new Set(
          (info.participantIDs || []).map(String)
        )
      ].filter(uid => uid !== botID);

      const active = members.filter(uid =>
        Object.prototype.hasOwnProperty.call(
          activeMap,
          uid
        )
      );

      const activeSet = new Set(active);

      const inactive = members.filter(
        uid => !activeSet.has(uid)
      );

      const startedAt =
        Number(tracker.startedAt) || Date.now();

      const elapsedMs = Math.max(
        0,
        Date.now() - startedAt
      );

      const totalHours = Math.floor(
        elapsedMs / 3600000
      );

      const totalMinutes = Math.floor(
        (elapsedMs % 3600000) / 60000
      );

      const detectedCount =
        Object.keys(activeMap).length;

      const lines = [
        "📋 GROUP MEMBER LIST",
        "━━━━━━━━━━━━━━━━━━",
        `👥 Total Members: ${members.length}`,
        `🟢 Active Members: ${active.length}`,
        `🔴 Inactive Members: ${inactive.length}`,
        "",
        "🟢 ACTIVE UID LIST:",
        ...(active.length ? active : ["None"]),
        "",
        "🔴 INACTIVE UID LIST:",
        ...(inactive.length ? inactive : ["None"]),
        "",
        "━━━━━━━━━━━━━━━━━━",
        "🤖 BOT ACTIVITY REPORT",
        `⏱️ Bot Active Time: ${totalHours} hours ${totalMinutes} minutes`,
        `🎯 Total Members Detected: ${detectedCount}`,
        "━━━━━━━━━━━━━━━━━━"
      ];

      let chunk = "";

      for (const line of lines) {
        if (
          (chunk + line + "\n").length > 14000
        ) {
          await message.reply(chunk);
          chunk = "";
        }

        chunk += line + "\n";
      }

      if (chunk) {
        return message.reply(chunk);
      }

      return;
    }

    if (action === "kill") {
      const info = await api.getThreadInfo(
        threadID
      );

      const botID = String(
        api.getCurrentUserID()
      );

      const members = [
        ...new Set(
          (info.participantIDs || []).map(String)
        )
      ];

      const targets = members.filter(
        uid =>
          uid !== botID &&
          !Object.prototype.hasOwnProperty.call(
            activeMap,
            uid
          )
      );

      if (!targets.length) {
        return message.reply(
          "✅ No undetected members found."
        );
      }

      await message.reply(
        `⚠️ ${targets.length} members have no recorded messages.\n` +
        "Starting removal..."
      );

      let removed = 0;
      const failed = [];

      for (const uid of targets) {
        try {
          await api.removeUserFromGroup(
            uid,
            threadID
          );
          removed++;
        } catch (error) {
          failed.push(uid);
        }
      }

      return message.reply(
        "🧹 LIST KILL FINISHED\n" +
        `✅ Removed: ${removed}\n` +
        `❌ Failed: ${failed.length}` +
        (
          failed.length
            ? "\n\nFailed UIDs:\n" +
              failed.join("\n")
            : ""
        )
      );
    }

    return message.reply(
      "📌 LIST COMMANDS\n\n" +
      `${prefix}list mm - Show full member list\n` +
      `${prefix}list kill - Remove undetected members`
    );
  },

  onChat: async function ({
    api,
    event,
    threadsData
  }) {
    await recordActivity({
      api,
      event,
      threadsData
    });
  }
};
