Config = {
    Debug = false,
    UseDiscordRoles = true, -- Uses sys-discord role checks for staff authentication. If false, ACE permission checks are used.
    AcePerm = "vadmin.owner", -- Uses the default ACE Permission System when UseDiscordRoles is false.
    MaxDistance = 20.0,        -- The max distance when reporting the nearest players.
    RoleIDs = {                -- Only used if UseDiscordRoles is true. Configure Bot Token/Guild ID in sys-discord.
        ["1463599557500866758"] = true
    },
    Logging = false,               -- Enable Logging using discord Webhooks (Configurable in sv_config.lua)
    ReportCommand = "report",      -- The name of the report command for normal players.
    ReportMenuCommand = "reports", -- The name of the command to open the reports menu for staff members.
    NotificationPos =
    "top-right"                    -- The position of the notifications: top-center, top-right, top-left, bottom-center, bottom-right, bottom-left
}
