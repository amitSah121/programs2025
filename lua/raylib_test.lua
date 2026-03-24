local lib = require("lib/raylib")
local raylib = lib.raylib

raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")

local playerX = 400
local playerY = 300

while raylib.WindowShouldClose() == 0 do
    -- handle keyboard input
    if raylib.IsKeyDown(raylib.KEY_UP) ~= 0 then
        playerY = playerY - 2
    end
    if raylib.IsKeyDown(raylib.KEY_DOWN) ~= 0 then
        playerY = playerY + 2
    end
    if raylib.IsKeyDown(raylib.KEY_LEFT) ~= 0 then
        playerX = playerX - 2
    end
    if raylib.IsKeyDown(raylib.KEY_RIGHT) ~= 0 then
        playerX = playerX + 2
    end

    -- handle mouse input
    local mouseX = raylib.GetMouseX()
    local mouseY = raylib.GetMouseY()
    local mousePressed = raylib.IsMouseButtonDown(raylib.MOUSE_BUTTON_LEFT) ~= 0

    -- draw
    raylib.BeginDrawing()
    raylib.ClearBackground(lib.BLACK)

    raylib.DrawText("Use arrow keys to move square", 10, 10, 20, lib.RAYWHITE)
    raylib.DrawText(string.format("Mouse: %d, %d", mouseX, mouseY), 10, 40, 20, lib.RAYWHITE)

    -- draw player (simple rectangle via DrawText hack)
    raylib.DrawText("#", playerX, playerY, 30, mousePressed and lib.RED or lib.BLUE)

    raylib.EndDrawing()
end

raylib.CloseWindow()