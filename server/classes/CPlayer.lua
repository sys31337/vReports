CPlayer = {}

local function GetConfiguredRoleIds()
    local roleConfig = Config.RoleIDs
    if type(roleConfig) ~= "table" then
        return {}
    end

    local roleIds = {}

    if #roleConfig > 0 then
        for i = 1, #roleConfig do
            local roleId = roleConfig[i]
            if roleId then
                roleIds[#roleIds + 1] = tostring(roleId)
            end
        end
    else
        for roleId, enabled in pairs(roleConfig) do
            if enabled then
                roleIds[#roleIds + 1] = tostring(roleId)
            end
        end
    end

    return roleIds
end

function CPlayer:new(player)
    if not player then
        return Debug("(Error) `CPlayer:new` function was called but the first param is null.")
    end

    local isStaff = false

    local playerName = GetPlayerName(player)
    local license = GetLicenseIdentifier(player)

    if not Config.UseDiscordRoles then
        if IsPlayerAceAllowed(player, Config.AcePerm) then
            print('A2', Config.AcePerm)
            isStaff = true
            Debug("OnlineStaff size: ", #OnlineStaff)
            OnlineStaff[tonumber(player)] = {
                id = player,
                license = license,
            }
            TriggerClientEvent("vadmin:cb:updatePermissions", player, Config.AllowedPermissions)
            Debug(("[func:CPlayer:new] (ACEPermissions) %s (ID - %s) was authenticated as staff."):format(playerName, player))
        end
    else
        local roleIds = GetConfiguredRoleIds()
        if #roleIds > 0 then
            local hasRole = exports['sys-discord']:HasRole(player, roleIds)
            print(hasRole)
            if hasRole then
                isStaff = true
                OnlineStaff[tonumber(player)] = {
                    id = player,
                    license = license,
                }
                Debug(("[func:CPlayer:new] (sys-discord) %s (ID - %s) was authenticated as staff."):format(playerName, player))
            else
                Debug(("[func:CPlayer:new] (sys-discord) Failed to check roles for %s (ID - %s)."):format(playerName, player))
            end
        end
    end

    local obj = {
        name = playerName,
        id = player,
        license = license,
        isStaff = isStaff,
    }

    TriggerClientEvent("reportmenu:state:playerdata", player, obj)

    setmetatable(obj, self)
    self.__index = self
    return obj
end
