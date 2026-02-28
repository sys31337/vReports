RegisterNuiCallback('hideFrame', function(_, cb)
    ToggleNuiFrame(false)
    UIMessage("nui:resetstates")
    Debug('[nuicb:hideFrame] called')
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:sendreport", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:sendreport] first param is null.") end
    Debug("[reportmenu:nuicb:sendreport] Data param: ", json.encode(data))

    data.playerName = GetPlayerName(PlayerId())

    if data.reportNearestPlayers then
        data.nearestPlayers = {}
        local players = GetActivePlayers()
        local srcPlayerId = PlayerId()
        local srcPed = PlayerPedId()
        local srcCoords = GetEntityCoords(srcPed)

        for i = 1, #players do
            local playerId = players[i]
            local playerPed = GetPlayerPed(playerId)
            local playerCoords = GetEntityCoords(playerPed)

            local distance = #(srcCoords - playerCoords)

            if playerId ~= srcPlayerId and distance <= Config.MaxDistance then
                data.nearestPlayers[#data.nearestPlayers + 1] = {
                    id = GetPlayerServerId(playerId),
                    name = GetPlayerName(playerId),
                    distance = math.floor(distance),
                }

                Debug("[reportmenu:nuicb:sendreport] Player near us found: ", json.encode(data.nearestPlayers))
            end
        end
    end

    TriggerServerEvent("reportmenu:server:report", data)
    ShowNotification({
        title = "Report Menu",
        description = ("Your new report has been submitted, do /%s for more info."):format(Config.ReportMenuCommand),
    })
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:delete", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:delete] first param is null.") end

    -- if data.isMyReportsPage and MyReports[data.reportId] then
    --     MyReports[data.reportId] = nil
    --     UIMessage("nui:state:myreports", MyReports)
    --     Debug("(reportmenu:nuicb:delete) Report deleted on the client sided `MyReports` table.")
    -- end

    TriggerServerEvent("reportmenu:server:delete", data)

    cb({})
end)

RegisterNuiCallback("reportmenu:nui:cb:settings", function(data, cb)
    if not data then return Debug("[reportmenu:nui:cb:settings] first param is null.") end

    local settings = json.encode(data)

    SetResourceKvp("reportmenu:settings", settings)
    Debug("Settings loaded: ", data)

    Debug("[reportmenu:nui:cb:settings] Settings updated: ", settings)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:goto", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:goto] first param is null.") end
    TriggerServerEvent("reportmenu:server:goto", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:bring", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:bring] first param is null.") end
    TriggerServerEvent("reportmenu:server:bring", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:revive", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:revive] first param is null.") end
    TriggerServerEvent("reportmenu:server:revive", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:heal", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:heal] first param is null.") end
    TriggerServerEvent("reportmenu:server:heal", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:kill", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:kill] first param is null.") end
    TriggerServerEvent("reportmenu:server:kill", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:spectate", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:spectate] first param is null.") end
    TriggerServerEvent("reportmenu:server:spectate", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:inventory", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:inventory] first param is null.") end
    TriggerServerEvent("reportmenu:server:inventory", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:stash", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:stash] first param is null.") end
    TriggerServerEvent("reportmenu:server:stash", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:fix", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:fix] first param is null.") end
    TriggerServerEvent("reportmenu:server:fix", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:clothing", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:clothing] first param is null.") end
    TriggerServerEvent("reportmenu:server:clothing", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:outfits", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:outfits] first param is null.") end
    TriggerServerEvent("reportmenu:server:outfits", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:barber", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:barber] first param is null.") end
    TriggerServerEvent("reportmenu:server:barber", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:register", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:register] first param is null.") end
    TriggerServerEvent("reportmenu:server:register", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:logout", function(data, cb)
    if not data then return Debug("[reportmenu:nuicb:logout] first param is null.") end
    TriggerServerEvent("reportmenu:server:logout", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:refresh", function(data, cb)
    Debug("[reportmenu:nuicb:refresh] Called.")
    TriggerServerEvent("reportmenu:server:cb:reports")
    cb({})
end)

-- notify server that a staff member opened a report window
RegisterNuiCallback("reportmenu:nuicb:openreport", function(data, cb)
    if not data or not data.reportId then return Debug("[reportmenu:nuicb:openreport] missing reportId") end
    TriggerServerEvent("reportmenu:server:addviewer", data)
    cb({})
end)

-- notify server that a staff member closed a report window
RegisterNuiCallback("reportmenu:nuicb:closereport", function(data, cb)
    if not data or not data.reportId then return Debug("[reportmenu:nuicb:closereport] missing reportId") end
    TriggerServerEvent("reportmenu:server:removeviewer", data)
    cb({})
end)

RegisterNuiCallback("reportmenu:nuicb:sendmessage", function(data, cb)
    Debug("[reportmenu:nuicb:sendmessage] data: ", json.encode(data))
    TriggerServerEvent("reportmenu:server:sendmessage", data)
    cb({})
end)
