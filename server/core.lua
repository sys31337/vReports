---@type OnlineStaff[]
OnlineStaff = {}

---@type ActiveReport[]
ActiveReports = {}

AddEventHandler("playerJoining", function(_srcString, _oldId)
    if source <= 0 then
        Debug("(Error) [eventHandler:playerJoining] source is nil, returning.")
        return
    end

    local playerName = GetPlayerName(source)

    if type(playerName) ~= "string" then
        return Debug("(Error) [eventHandler:playerJoining] Invalid Player name type: ",
            type(playerName))
    end

    CPlayer:new(source)
end)

AddEventHandler("playerDropped", function(reason)
    if OnlineStaff[source] then
        OnlineStaff[source] = nil
        Debug(("[eventHandler:playerDropped] %s was removed from the OnlineStaff table."):format(GetPlayerName(source)))
    end

    -- ensure we remove the player from any report viewers lists so stale data doesn't linger
    for id, report in pairs(ActiveReports) do
        if report.viewers then
            for i, v in ipairs(report.viewers) do
                if v.id == source then
                    table.remove(report.viewers, i)
                    -- broadcast the change to remaining staff
                    for _, s in pairs(OnlineStaff) do
                        TriggerClientEvent("reportmenu:client:update", s.id, ActiveReports)
                    end
                    break
                end
            end
        end
    end
end)

SetTimeout(1000, function()
    Debug("[Thread:LoopPlayerList] beginning.")

    if Config.UseDiscordRoles then
        local ok = pcall(function()
            exports['sys-discord']:EnsureDiscordGuildCache()
        end)

        if not ok then
            Debug("[Thread:LoopPlayerList] Failed to warm sys-discord cache.")
        end
    end

    CreateThread(function()
        local Players = GetPlayers()
        for i = 1, #Players do
            local player = Players[i]
            if OnlineStaff[player] then
                return Debug(("(Error) [Thread:LoopPlayerList] %s (ID - %s) is already in the OnlineStaff table.")
                    :format(GetPlayerName(player), player))
            end

            CPlayer:new(player)
        end
    end)
end)
