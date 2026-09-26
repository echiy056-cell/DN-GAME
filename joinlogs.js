// ============================================
//   JOIN LOGGER MODULE
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

function init(client) {
  console.log("📋 Initializing Join Logger module...");

  // ============ GUILD MEMBER ADD ============
  client.on("guildMemberAdd", async (member) => {
    try {
      // نتجاهلو البوتات
      if (member.user.bot) return;

      // ===== نجيبو invite link =====
      let inviteLink = "N/A";
      let inviter = "Unknown";
      
      try {
        const invites = await member.guild.invites.fetch();
        
        // نلقاو الـinvite المستعمل
        const usedInvite = invites.find(inv => {
          return inv.uses > 0 && inv.inviter;
        });
        
        if (usedInvite) {
          inviteLink = `https://discord.gg/${usedInvite.code}`;
          inviter = `${usedInvite.inviter.username} (${usedInvite.inviter.id})`;
        } else if (invites.size > 0) {
          const firstInvite = invites.first();
          inviteLink = `https://discord.gg/${firstInvite.code}`;
        }
      } catch (err) {
        console.log("⚠️ Could not fetch invites:", err.message);
      }

      // ===== معلومات العضو =====
      const user = member.user;
      const guild = member.guild;
      const joinedAt = new Date().toISOString();
      const accountAge = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));

      // ===== نطبعو في Railway Logs =====
      console.log("");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("👤 NEW MEMBER JOINED!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📛 Username:      ${user.username}`);
      console.log(`🏷️  Display Name:  ${member.displayName || user.username}`);
      console.log(`🆔 User ID:       ${user.id}`);
      console.log(`🤖 Is Bot:        ${user.bot ? "Yes" : "No"}`);
      console.log(`📅 Account Age:   ${accountAge} days`);
      console.log("──────────────────────────────────────────");
      console.log(`🏠 Server:        ${guild.name}`);
      console.log(`🆔 Server ID:     ${guild.id}`);
      console.log(`👥 Member Count:  ${guild.memberCount}`);
      console.log(`🔗 Invite Link:   ${inviteLink}`);
      console.log(`👋 Invited By:    ${inviter}`);
      console.log("──────────────────────────────────────────");
      console.log(`⏰ Joined At:     ${joinedAt}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");

    } catch (err) {
      console.error("❌ Error in join logger:", err);
    }
  });

  // ============ GUILD MEMBER REMOVE (اختياري) ============
  client.on("guildMemberRemove", async (member) => {
    try {
      if (member.user.bot) return;

      const user = member.user;
      const guild = member.guild;
      const leftAt = new Date().toISOString();

      console.log("");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("👋 MEMBER LEFT!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📛 Username:      ${user.username}`);
      console.log(`🆔 User ID:       ${user.id}`);
      console.log(`🏠 Server:        ${guild.name}`);
      console.log(`🆔 Server ID:     ${guild.id}`);
      console.log(`👥 Member Count:  ${guild.memberCount}`);
      console.log(`⏰ Left At:       ${leftAt}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");

    } catch (err) {
      console.error("❌ Error in leave logger:", err);
    }
  });

  console.log("✅ Join Logger module ready!");
}

module.exports = { init };
