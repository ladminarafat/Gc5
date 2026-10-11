module.exports = {
	config: {
		name: "new",
		version: "1.0",
		author: "Arafat",
		countDown: 3,
		role: 0,
		description: "Send introduction format",
		category: "chat"
	},

	onStart: async function ({ message }) {
		return message.reply(`Apnar intro den 🤍🌷

Name: Age: Class: Hometown: ♡`);
	},

	onChat: async function ({ event, message }) {
		if (!event.body) return;

		const text = event.body.toLowerCase();

		if (/\bnew\b/i.test(text)) {
			return message.reply(`Apnar intro den 🤍🌷

Name: Age: Class: Hometown: ♡`);
		}
	}
};
