import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { xpService } from '../../services/xp/XPService.js';
import { COLORS } from '../../config/constants.js';

export const data = new SlashCommandBuilder()
  .setName('removexp')
  .setDescription('👑 [Admin Only] Remove / deduct XP from a server member')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName('target')
      .setDescription('The member to remove XP from')
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount of XP to remove')
      .setRequired(true)
      .setMinValue(1)
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('Reason for removing XP')
      .setRequired(false)
      .setMaxLength(200)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.guild) return;

  // Strict Runtime Administrator Permission Enforcement
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '🚫 **Access Denied**: Only server **Administrators** can use `/removexp`.',
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser('target', true);
  const amount = interaction.options.getInteger('amount', true);
  const reasonInput = interaction.options.getString('reason') || 'Admin removal';
  const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  const result = await xpService.deductXP({
    guildId: interaction.guildId,
    discordUserId: targetUser.id,
    amount,
    reason: `${reasonInput} (by ${interaction.user.tag})`,
    member,
  });

  const levelDecreased = result.newLevel < result.oldLevel;

  const embed = new EmbedBuilder()
    .setColor(COLORS.DANGER)
    .setTitle('⚠️ XP Removed by Administrator')
    .setThumbnail(targetUser.displayAvatarURL())
    .setDescription(
      `Removed **-${result.deductedAmount.toLocaleString()} XP** from <@${targetUser.id}>.\n\n` +
      `📊 **New Total XP**: \`${result.newXP.toLocaleString()}\`\n` +
      `⭐ **Current Level**: \`Level ${result.newLevel}\`${
        levelDecreased ? ` 🔻 *(Dropped from Level ${result.oldLevel})*` : ''
      }\n` +
      `📝 **Reason**: ${reasonInput}\n` +
      `🛡️ **Admin**: <@${interaction.user.id}>`
    )
    .setFooter({ text: 'Activity Engine • Admin Security Guard Active' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
