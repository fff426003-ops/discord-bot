require("dotenv").config();
const {
Client,
GatewayIntentBits,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField,
SlashCommandBuilder,
REST,
Routes,
EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.MI_CLAVE_SECRETA;
const CLIENT_ID = "1469442330187530344";
const GUILD_ID = "1458578394710282338";
const CATEGORY_ID = "1469431779986509969";

const STAFF_ROLES = [
"1469434762123804738",
"1469435429479514277",
"1469435885777977425"
];

const client = new Client({ intents:[GatewayIntentBits.Guilds] });

const commands = [
new SlashCommandBuilder()
.setName("panel")
.setDescription("Open ticket panel")
].map(c=>c.toJSON());

const rest = new REST({version:"10"}).setToken(TOKEN);

(async()=>{
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{body:commands}
);
console.log("Slash command loaded");
})();

client.once("ready",()=>console.log("BOT ONLINE"));

client.on("interactionCreate",async interaction=>{
try{

// PANEL
if(interaction.isChatInputCommand()){

const embed = new EmbedBuilder()
.setColor("Green")
.setDescription(
"Hello and welcome to Nexus.\n\nWe are a trusted server dedicated to helping our community by acting as reliable middlemen for purchases, trades, and sales.\n\nOur goal is to ensure every transaction is safe, transparent, and fair."
);

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("sell").setLabel("Sell").setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId("trade").setLabel("Trade").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("support").setLabel("Support").setStyle(ButtonStyle.Secondary)
);

return interaction.reply({embeds:[embed],components:[row]});
}

// ---------- CLOSE BUTTON ----------
if(interaction.isButton() && interaction.customId==="close"){

await interaction.reply({content:"Closing ticket...",ephemeral:true});

setTimeout(()=>{
interaction.channel.delete().catch(()=>{});
},1500);

return;
}

// ---------- CREATE TICKET BUTTON ----------
if(interaction.isButton()){

await interaction.deferReply({ephemeral:true});

const type = interaction.customId;
const guild = interaction.guild;

const existing = guild.channels.cache.find(c=>c.topic===interaction.user.id);

if(existing)
return interaction.editReply({content:"You already have a ticket open"});

const perms = [
{ id:guild.roles.everyone, deny:[PermissionsBitField.Flags.ViewChannel]},
{ id:interaction.user.id, allow:[PermissionsBitField.Flags.ViewChannel]}
];

STAFF_ROLES.forEach(r=>{
perms.push({ id:r, allow:[PermissionsBitField.Flags.ViewChannel]});
});

const channel = await guild.channels.create({
name:"ticket-"+interaction.user.username,
type:ChannelType.GuildText,
parent:CATEGORY_ID,
topic:interaction.user.id,
permissionOverwrites:perms
});

const embed = new EmbedBuilder()
.setColor("Blue")
.setTitle("Ticket Opened")
.setDescription("Type: "+type+"\nUser: "+interaction.user);

const closeRow = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close")
.setLabel("Close Ticket")
.setStyle(ButtonStyle.Danger)
);

await channel.send({embeds:[embed],components:[closeRow]});

return interaction.editReply({content:"Ticket created: "+channel});
}

}catch(err){
console.log(err);
if(interaction.deferred||interaction.replied)
interaction.editReply({content:"Error"});
else
interaction.reply({content:"Error",ephemeral:true});
}
});

client.login(TOKEN);
