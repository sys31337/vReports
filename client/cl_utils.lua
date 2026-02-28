local function GetResourceAccentColor()
    if GetResourceState('stys-styles') == 'started' then
        local ok, accentColor = pcall(function()
            return exports['stys-styles']:GetAccentColor()
        end)

        if ok and type(accentColor) == "string" and accentColor ~= "" then
            return accentColor
        end
    end

    if GetResourceState('sys-hud') == 'started' then
        local ok, accentColor = pcall(function()
            return exports['sys-hud']:GetAccentColor()
        end)

        if ok and type(accentColor) == "string" and accentColor ~= "" then
            return accentColor
        end
    end

    return '#10b981' -- Default Emerald fallback
end

---@param action string The action you wish to target
---@param data any The data you wish to send along with this action
function UIMessage(action, data)
    local accentColor = GetResourceAccentColor()
    local payloadData = data

    if type(data) == "table" then
        payloadData = {}
        for key, value in pairs(data) do
            payloadData[key] = value
        end
        payloadData.accentColor = accentColor
    end

    SendNUIMessage({
        action = action,
        data = payloadData,
        accentColor = accentColor
    })
end

function ToggleNuiFrame(shouldShow)
    SetNuiFocus(shouldShow, shouldShow)
    UIMessage('setVisible', { visible = shouldShow })
    Debug("(func) [ToggleNuiFrame] \n (param) shouldShow: ", shouldShow)
end

---@param coords vector3
---@return boolean
---@return table
function Get2DCoordFrom3DCoord(coords)
    if not coords then return false, {} end
    local onScreen, x, y = GetScreenCoordFromWorldCoord(coords.x, coords.y, coords.z)
    return onScreen, { left = tostring(x * 100) .. "%", top = tostring(y * 100) .. "%" }
end

function ShowFloatingText(coords, msg)
    AddTextEntry('floatingTextNotification', msg)
    SetFloatingHelpTextWorldPosition(1, coords)
    SetFloatingHelpTextStyle(1, 1, 2, -1, 3, 0)
    BeginTextCommandDisplayHelp('floatingTextNotification')
    EndTextCommandDisplayHelp(2, false, false, -1)
end

ShowNotification = function(data)
    if not data then return Debug("[func:ShowNotification] first param is null.") end
    UIMessage("nui:notify", data)
end
