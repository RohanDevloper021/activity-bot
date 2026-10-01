import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { xpService } from '../../services/xp/XPService.js';
import { XPSource, COLORS } from '../../config/constants.js';

export const data = new SlashCommandBuilder()
  .setName('givexp')
  .setDescription('👑 [Admin Only] Give XP to a server member')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName('target')
      .setDescription('The member to give XP to')
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount of XP to give')
      .setRequired(true)
      .setMinValue(1)
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('Reason for granting XP')
      .setRequired(false)
      .setMaxLength(200)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.guild) return;

  // Strict Runtime Administrator Permission Enforcement
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '🚫 **Access Denied**: Only server **Administrators** can use `/givexp`.',
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser('target', true);
  const amount = interaction.options.getInteger('amount', true);
  const reasonInput = interaction.options.getString('reason') || 'Admin grant';
  const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  const result = await xpService.awardXP({
    guildId: interaction.guildId,
    discordUserId: targetUser.id,
    amount,
    source: XPSource.ADMIN,
    reason: `${reasonInput} (by ${interaction.user.tag})`,
    member,
    fallbackChannel: interaction.channel,
  });

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🎁 XP Granted by Administrator')
    .setThumbnail(targetUser.displayAvatarURL())
    .setDescription(
      `Successfully gave **+${amount.toLocaleString()} XP** to <@${targetUser.id}>!\n\n` +
      `📊 **New Total XP**: \`${result.newXP.toLocaleString()}\`\n` +
      `⭐ **Current Level**: \`Level ${result.newLevel}\`${
        result.leveledUp ? ' 🎉 **LEVELED UP!**' : ''
      }\n` +
      `📝 **Reason**: ${reasonInput}\n` +
      `🛡️ **Admin**: <@${interaction.user.id}>`
    )
    .setFooter({ text: 'Activity Engine • Admin Security Guard Active' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
