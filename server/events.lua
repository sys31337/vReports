local QBCore = exports['qb-core']:GetCoreObject()

---@diagnostic disable: need-check-nil

local function IsStaffMember(playerId, eventName)
    if OnlineStaff[tonumber(playerId)] then
        return true
    end

    Debug(("[%s] %s (ID -%s) isn't a staff member but somehow called the event."):format(
        eventName,
        GetPlayerName(playerId),
        playerId
    ))
    return false
end

local function NotifyInvalidTarget(staffId)
    ShowNotification({
        title = "Error Encountered",
        description = "Couldn't get the target player.",
        target = staffId
    })
end

local function GetTargetPlayerId(data)
    local targetId = tonumber(data and data.id)
    if not targetId or targetId <= 0 then
        return nil
    end

    if GetPlayerPing(targetId) <= 0 then
        return nil
    end

    return targetId
end

local function ExecuteConfiguredAction(staffId, actionName, data)
    if not Config.UseActionCommands then
        return false
    end

    if type(Config.ActionCommands) ~= "table" then
        return false
    end

    local template = Config.ActionCommands[actionName]
    if type(template) ~= "string" or template == "" then
        return false
    end

    local command = template
    if template:find("{id}", 1, true) then
        local targetId = GetTargetPlayerId(data)
        if not targetId then
            NotifyInvalidTarget(staffId)
            return true
        end

        command = command:gsub("{id}", tostring(targetId))
    end

    command = command:gsub("^%s+", ""):gsub("%s+$", "")
    if command == "" then
        return true
    end

    TriggerClientEvent("reportmenu:client:runcommand", staffId, command)
    return true
end

---@param data ActiveReport
RegisterNetEvent("reportmenu:server:report", function(data)
    if not data then return Debug("[netEvent:reportmenu:server:report] first param is null.") end
    local chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    local rint_char = math.random(1, #chars)
    local rchar = chars:sub(rint_char, rint_char)

    -- This isn't a really good generator but it works for now, i'll re-work it later, but if you have more than 5k reports active i don't know what to tell you.
    local rint_num = math.random(1, 5000)

    local reportId = tostring(rchar .. rint_num)
    local sourceName = GetPlayerName(source)

    local Player = QBCore.Functions.GetPlayer(source)
    local playerDiscord = QBCore.Functions.GetIdentifier(source, "discord")
    local playerLicense = QBCore.Functions.GetIdentifier(source, "license")
    data.id = source
    data.playerId = source .. " (" .. (Player.PlayerData.citizenid) .. ")" .. " - " .. Player.PlayerData.charinfo.firstname .. " " ..
        Player.PlayerData.charinfo.lastname
    data.playerDiscord = playerDiscord
    data.playerLicense = playerLicense
    data.timedate = ("%s | %s"):format(os.date("%X"), os.date("%x"))
    data.reportId = reportId
    Debug(json.encode(data))

    -- initialize helper tables for tracking who is looking at / who has seen this report
    data.viewers = {}          -- list of {id,name} objects for currently viewing staff
    data.seenBy = {}           -- list of {id,name} objects for any staff who have ever opened the report

    ActiveReports[reportId] = data

    TriggerClientEvent("reportmenu:client:addactivereport", source, data)

    for staffId, staff in pairs(OnlineStaff) do
        Debug("staff var: ", json.encode(staff))
        Debug("Staff ID: ", staffId)
        ---@diagnostic disable-next-line: param-type-mismatch
        TriggerClientEvent("reportmenu:client:update", staffId, ActiveReports)
        ShowNotification(
            {
                title = "Report Menu",
                description = ("New Report: [%s]"):format(reportId),
                target = staffId,
                appearOnlyWhenNuiNotOpen = true
            }
        )
    end

    FetchWebhook({
        webhook = SVConfig['Webhooks'].ReportSent,
        embed = {
            title = 'New Report Recieved',
            description = ('**Report ID**: `%s`'):format(reportId),
            color = '#1a1a1a',
            fields = {
                {
                    name = 'Sent by',
                    value = ("`%s (ID - %s)`"):format(sourceName, source),
                    inline = true
                },
                {
                    name = 'Report Title',
                    value = ("`%s`"):format(data.title),
                    inline = true
                },
                {
                    name = 'Report Type',
                    value = ("`%s`"):format(data.type),
                    inline = true
                },
            }
        }
    })

    Debug("[netEvent:reportmenu:server:report] Active Reports table: ", json.encode(ActiveReports))
end)

RegisterNetEvent("reportmenu:server:cb:reports", function()
    if not OnlineStaff[tonumber(source)] then
        return Debug(
            ("[netEvent:reportmenu:server:reports] %s (ID -%s) Isn't a staff member but somehow called the event.")
            :format(GetPlayerName(source), source))
    end

    TriggerClientEvent("reportmenu:client:cb:reports", source, ActiveReports)
end)

RegisterNetEvent("reportmenu:server:delete", function(data)
    if not OnlineStaff[tonumber(source)] and not data.isMyReportsPage then
        return Debug(
            ("[netEvent:reportmenu:server:delete] %s (ID -%s) Isn't a staff member but somehow called the event.")
            :format(GetPlayerName(source), source))
    end

    local thisReport = ActiveReports[data.reportId]

    if data.isMyReportsPage and thisReport then
        if tonumber(thisReport.id) ~= tonumber(source) then
            return Debug(
                "(reportmenu:server:delete) Player attempted to delete a report but it wasn't them who sent it.")
        end
    end

    if thisReport then
        local sourceName = GetPlayerName(source)

        FetchWebhook({
            webhook = SVConfig['Webhooks'].ReportConcluded,
            embed = {
                title = 'Report Closed',
                description = ('**Report ID**: `%s`'):format(data.reportId),
                color = '#1a1a1a',
                fields = {
                    {
                        name = 'Concluded By',
                        value = ("`%s (ID - %s)`"):format(sourceName, source),
                        inline = true
                    }
                }
            }
        })

        ShowNotification(
            {
                title = "Report Menu",
                description = data.isMyReportsPage and "You have closed this report." or
                    ("Your report has been closed by %s (ID - %s)"):format(sourceName, source),
                target = data.id,
            }
        )

        ActiveReports[data.reportId] = nil

        Debug("ActiveReport with the ID: ", data.reportId, "was found and was deleted.")

        TriggerClientEvent("staffchat:client:removemyreport", data.id, data)

        for k, v in pairs(OnlineStaff) do
            ---@diagnostic disable-next-line: param-type-mismatch Reason: it works, even if it's a string or a number.
            TriggerClientEvent("reportmenu:client:update", v.id, ActiveReports)
        end
    end
end)

RegisterNetEvent("reportmenu:server:goto", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:goto") then
        return
    end

    local targetId = GetTargetPlayerId(data)
    if not targetId then
        return NotifyInvalidTarget(source)
    end

    local targetPed = GetPlayerPed(targetId)
    if targetPed == 0 then
        return NotifyInvalidTarget(source)
    end

    local srcPed = GetPlayerPed(source)
    if srcPed == 0 then return Debug("[reportmenu:server:goto] srcPed is somehow null.") end

    local targetPedCoords = GetEntityCoords(targetPed)

    Debug("source Routing Bucket: ", GetPlayerRoutingBucket(source), " \n target Routing Bucket: ",
        GetPlayerRoutingBucket(targetId))

    SetEntityCoords(srcPed, targetPedCoords.x, targetPedCoords.y, targetPedCoords.z, true, false, false, false)
end)


RegisterNetEvent("reportmenu:server:bring", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:bring") then
        return
    end

    local targetId = GetTargetPlayerId(data)
    if not targetId then
        return NotifyInvalidTarget(source)
    end

    local srcPed = GetPlayerPed(source)
    local targetPed = GetPlayerPed(targetId)
    if targetPed == 0 then return NotifyInvalidTarget(source) end

    if srcPed == 0 then return Debug("[reportmenu:server:bring] srcPed is somehow null.") end

    local srcPedCoords = GetEntityCoords(srcPed)

    Debug("source Routing Bucket: ", GetPlayerRoutingBucket(source), " \n target Routing Bucket: ",
        GetPlayerRoutingBucket(targetId))

    SetEntityCoords(targetPed, srcPedCoords.x, srcPedCoords.y, srcPedCoords.z, true, false, false, false)
end)

RegisterNetEvent("reportmenu:server:revive", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:revive") then return end
    if ExecuteConfiguredAction(source, "revive", data) then return end

    local targetId = GetTargetPlayerId(data)
    if not targetId then return NotifyInvalidTarget(source) end
    TriggerClientEvent('brutal_ambulancejob:revive', targetId)
end)

RegisterNetEvent("reportmenu:server:heal", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:heal") then return end
    if ExecuteConfiguredAction(source, "heal", data) then return end

    local targetId = GetTargetPlayerId(data)
    if not targetId then return NotifyInvalidTarget(source) end
    TriggerClientEvent('brutal_ambulancejob:heal', targetId)
end)

RegisterNetEvent("reportmenu:server:kill", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:kill") then return end
    if ExecuteConfiguredAction(source, "kill", data) then return end

    local targetId = GetTargetPlayerId(data)
    if not targetId then return NotifyInvalidTarget(source) end
    TriggerClientEvent('brutal_ambulancejob:kill', targetId)
end)

RegisterNetEvent("reportmenu:server:spectate", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:spectate") then return end
    ExecuteConfiguredAction(source, "spectate", data)
end)

RegisterNetEvent("reportmenu:server:inventory", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:inventory") then return end
    ExecuteConfiguredAction(source, "inventory", data)
end)

RegisterNetEvent("reportmenu:server:stash", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:stash") then return end
    ExecuteConfiguredAction(source, "stash", data)
end)

RegisterNetEvent("reportmenu:server:fix", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:fix") then return end
    ExecuteConfiguredAction(source, "fix", data)
end)

RegisterNetEvent("reportmenu:server:clothing", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:clothing") then return end
    ExecuteConfiguredAction(source, "clothing", data)
end)

RegisterNetEvent("reportmenu:server:outfits", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:outfits") then return end
    ExecuteConfiguredAction(source, "outfits", data)
end)

RegisterNetEvent("reportmenu:server:barber", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:barber") then return end
    ExecuteConfiguredAction(source, "barber", data)
end)

RegisterNetEvent("reportmenu:server:register", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:register") then return end
    ExecuteConfiguredAction(source, "register", data)
end)

RegisterNetEvent("reportmenu:server:logout", function(data)
    if not IsStaffMember(source, "netEvent:reportmenu:server:logout") then return end
    ExecuteConfiguredAction(source, "logout", data)
end)

RegisterNetEvent("reportmenu:server:sendmessage", function(data)
    if not data then return Debug("[reportmenu:server:sendmessage] missing first param") end

    ---@type ActiveReport
    local report = data.report

    if not OnlineStaff[tonumber(source)] and report.id ~= source then
        return Debug("[reportmenu:server:sendmessage] Insufficient access perms from source.")
    end

    local targetReport = ActiveReports[report.reportId]

    if not targetReport then return Debug("[reportmenu:server:sendmessage] report not found.") end

    if not targetReport.messages then
        ActiveReports[report.reportId].messages = {}
    end

    ActiveReports[report.reportId].messages[#ActiveReports[report.reportId].messages + 1] = {
        playerName = GetPlayerName(source),
        playerId = source,
        data = data.messageQuery,
        timedate = ("%s | %s"):format(os.date("%X"), os.date("%x"))
    }

    ---@diagnostic disable-next-line: param-type-mismatch
    TriggerClientEvent("reportmenu:client:updateactivereport", report.id, ActiveReports[report.reportId])

    for _, v in pairs(OnlineStaff) do
        ShowNotification({
            target = v.id,
            title = "Report Menu | New Message",
            description = ("New Message in Report: [%s]"):format(report.reportId)
        })

        ---@diagnostic disable-next-line: param-type-mismatch Reason: it works, even if it's a string or a number.
        TriggerClientEvent("reportmenu:client:update", v.id, ActiveReports)
    end
end)

-- staff are beginning to look at a report; track viewers/seen status and broadcast updates
RegisterNetEvent("reportmenu:server:addviewer", function(data)
    if not data or not data.reportId then return Debug("[reportmenu:server:addviewer] missing reportId") end
    if not IsStaffMember(source, "netEvent:reportmenu:server:addviewer") then return end

    local report = ActiveReports[data.reportId]
    if not report then return Debug("[reportmenu:server:addviewer] report not found") end

    report.viewers = report.viewers or {}
    report.seenBy = report.seenBy or {}

    local name = GetPlayerName(source)
    -- helper to add unique entry
    local function addUnique(tbl)
        for _, v in ipairs(tbl) do
            if v.id == source then
                return
            end
        end
        table.insert(tbl, { id = source, name = name })
    end

    addUnique(report.viewers)
    addUnique(report.seenBy)

    -- inform everyone so UI can refresh
    for _, v in pairs(OnlineStaff) do
        TriggerClientEvent("reportmenu:client:update", v.id, ActiveReports)
    end
    -- also update the original reporter so they can see the change
    if report.id then
        TriggerClientEvent("reportmenu:client:updateactivereport", report.id, report)
    end
end)

RegisterNetEvent("reportmenu:server:removeviewer", function(data)
    if not data or not data.reportId then return Debug("[reportmenu:server:removeviewer] missing reportId") end
    if not IsStaffMember(source, "netEvent:reportmenu:server:removeviewer") then return end

    local report = ActiveReports[data.reportId]
    if not report then return Debug("[reportmenu:server:removeviewer] report not found") end

    if report.viewers then
        for i, v in ipairs(report.viewers) do
            if v.id == source then
                table.remove(report.viewers, i)
                break
            end
        end
    end

    -- update staff clients
    for _, v in pairs(OnlineStaff) do
        TriggerClientEvent("reportmenu:client:update", v.id, ActiveReports)
    end
    -- notify the player who submitted the report as well
    if report and report.id then
        TriggerClientEvent("reportmenu:client:updateactivereport", report.id, report)
    end
end)
