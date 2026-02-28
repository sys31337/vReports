Config = {
    Debug = false,
    UseDiscordRoles = true,                 -- Uses sys-discord role checks for staff authentication. If false, ACE permission checks are used.
    AcePerm = "vadmin.owner",               -- Uses the default ACE Permission System when UseDiscordRoles is false.
    MaxDistance = 20.0,                     -- The max distance when reporting the nearest players.
    RoleIDs = {                             -- Only used if UseDiscordRoles is true. Configure Bot Token/Guild ID in sys-discord.
        ["1464012083724157176"] = true
    },
    Logging = false,                        -- Enable Logging using discord Webhooks (Configurable in sv_config.lua)
    ReportCommand = "report",               -- The name of the report command for normal players.
    ReportMenuCommand = "reports",          -- The name of the command to open the reports menu for staff members.
    NotificationPos = "top-right",          -- The position of the notifications: top-center, top-right, top-left, bottom-center, bottom-right, bottom-left
    Title = "DC Roleplay",

    -- If enabled, staff actions execute configurable command templates.
    -- Use {id} for target player server id placeholder.
    UseActionCommands = true,
    ActionCommands = {
        revive = "revive {id}",
        heal = "heal {id}",
        kill = "kill {id}",
        spectate = "spectate {id}",
        inventory = "pinv {id}",
        stash = "stash {id}",
        fix = "fix {id}",
        clothing = "clothingmenu {id}",
        outfits = "outfits {id}",
        barber = "barber {id}",
        register = "register {id}",
        logout = "logout {id}",
    }
}
