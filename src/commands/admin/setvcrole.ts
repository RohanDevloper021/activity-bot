import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { guildConfigRepository } from '../../repositories/GuildConfigRepository.js';
import { COLORS } from '../../config/constants.js';

export const data = new SlashCommandBuilder()
  .setName('setvcrole')
  .setDescription('👑 [Admin Only] Set the temporary role given to members while active in Voice Channels')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('The role to assign during active voice sessions (leave empty to disable)')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;

  // Strict Runtime Administrator Permission Enforcement
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '🚫 **Access Denied**: Only server **Administrators** can use `/setvcrole`.',
      ephemeral: true,
    });
    return;
  }

  const role = interaction.options.getRole('role');
  const roleId = role ? role.id : null;

  await guildConfigRepository.update(interaction.guildId, {
    vcRoleId: roleId,
  });

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('✅ Temporary VC Role Updated')
    .setDescription(
      roleId
        ? `Members will automatically receive <@&${roleId}> when joining an eligible voice channel, and have it removed when leaving.`
        : 'Temporary VC role has been disabled.'
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
