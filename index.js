// https://discordapp.com/oauth2/authorize?client_id=479944525943537665&scope=bot&permissions=268528647

const Discord = require('discord.js');
const auth = require("./auth.json");
let applicationQuestions = require("./application-questions.js");
const webhookClient = new Discord.WebhookClient('794570257397186580', 'QwnElq-t-arH99Zm9TzouUYmNnSluSP8Evu2JH5GkBMz3fv-6GEmjc1R7C2LiFXKLJc8');
const webhookClient101 = new Discord.WebhookClient('794585593237471273', 'H7x2NxUkT3e0SYKra_8RAScaMmMK1tEDTBKMc86TTyEyS2TeIMCv2ebRSaK1aQdtR9Tj');

const client = new Discord.Client();
const botChar = "_";
let usersApplicationStatus = [];
let appNewForm = [];
let isSettingFormUp = false;
let userToSubmitApplicationsTo = null;


client.on("ready", () =>{
	console.log(`Bot is online!`);
	client.user.setStatus('online');
    client.user.setPresence({
        game: { 
            name: 'you watch my status',
            type: 'WATCHING'
        },
	})  
});











  const applicationFormCompleted = (data, msg, member) => {
  
  
  
	let i = 0, answers = "";

	for (; i < applicationQuestions.length; i++) {
		answers += `${applicationQuestions[i]}: ${data.answers[i]}\n`;
	}

	if (userToSubmitApplicationsTo)
		//userToSubmitApplicationsTo.send(`${data.user.username} has submitted a form.\n${answers}`);

		webhookClient.send(`\`\`\`${data.user.username} has submitted a form.\n${answers}\`\`\``);
		webhookClient101.send(`\`\`\`${data.user.username} has just submitted their application for Clan Member.\`\`\``);

};

const addUserToRole = (msg, roleName) => {


	if (roleName && msg.guild) {
		const role = msg.guild.roles.find("name", roleName);

		if (role) {
			msg.member.addRole(role);

			msg.reply(`Added you to role: '${roleName}'`);
		} else {
			msg.reply(`Role '${roleName}' does not exist.`);
		}
	} else if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
	} else {
		msg.reply("Please specify a role.");
	}
};

const sendUserApplyForm = msg => {
	const user = usersApplicationStatus.find(user => user.id === msg.author.id);

	if (!user) {
		msg.author.send(`Application commands: \`\`\`${botChar}cancel, ${botChar}redo\`\`\``);
		msg.author.send(applicationQuestions[0]);
		usersApplicationStatus.push({id: msg.author.id, currentStep: 0, answers: [], user: msg.author});
	} else {
		msg.author.send(applicationQuestions[user.currentStep]);
	}
};

const cancelUserApplicationForm = (msg, isRedo = false) => {
	const user = usersApplicationStatus.find(user => user.id === msg.author.id);

	if (user) {
		usersApplicationStatus = usersApplicationStatus.filter(el => el.id !== user.id)
		msg.reply("Application canceled.");
	} else if (!isRedo) {
		msg.reply("You have not started an application form yet.");
	}
};

const applicationFormSetup = (msg) => {
	if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
		return;
	}
    if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send('You can\'t use that!')


	if (isSettingFormUp) {
		msg.reply("Someone else is already configuring the form.");
		return;
	}

	appNewForm = [];
	isSettingFormUp = msg.author.id;

	msg.author.send(`Enter questions and enter \`${botChar}endsetup\` when done.`);
};

const endApplicationFormSetup = (msg) => {
	if (isSettingFormUp !== msg.author.id) {
		msg.reply("You are not the one setting the form up.");
		return;
	}

	isSettingFormUp = false;
	applicationQuestions = appNewForm;
};

const setApplicationSubmissions = (msg) => {
	if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
		return;
	}

    if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send('You can\'t use that!')

	userToSubmitApplicationsTo = msg.author;
	msg.reply("Form submissions will now be sent to you.")
};


client.on('message', msg => {
	if (msg.content.charAt(0) === botChar) {
		const request = msg.content.substr(1);
		let command, parameters = [];

		if (request.indexOf(" ") !== -1) {
			command = request.substr(0, request.indexOf(" "));
			parameters = request.split(" ");
			parameters.shift();
		} else {
			command = request;
		}

		switch (command.toLowerCase()) {
			case "apply":
				sendUserApplyForm(msg);
				break;
			case "addrole":
				addUserToRole(msg, parameters.join(" "));
				break;
			case "cancel":
				cancelUserApplicationForm(msg);
				break;
			case "redo":
				cancelUserApplicationForm(msg, true);
				sendUserApplyForm(msg);
				break;
			case "setup":
				applicationFormSetup(msg);
				break;
			case "endsetup":
				endApplicationFormSetup(msg);
				break;
			case "setsubmissions":
				setApplicationSubmissions(msg);
				break;
			case "help":
				msg.reply(`Available commands: \`\`\`${botChar}apply, ${botChar}setup, ${botChar}endsetup, ${botChar}setsubmissions\`\`\``);
				break;
			default:
				msg.reply("I do not know this command.");
		}
	} else {
		if (msg.channel.type === "dm") {
			if (msg.author.id === isSettingFormUp) {
				appNewForm.push(msg.content);
			} else {
				const user = usersApplicationStatus.find(user => user.id === msg.author.id);

				if (user && msg.content) {
					user.answers.push(msg.content);
					user.currentStep++;

					if (user.currentStep >= applicationQuestions.length) {
						if (!userToSubmitApplicationsTo) {
						}
						applicationFormCompleted(user);
						msg.author.send("Congratulations your application has been sent!");
					} else {
						msg.author.send(applicationQuestions[user.currentStep]);
					}
				}
			}
		}
	}
});

client.login(auth.token);
