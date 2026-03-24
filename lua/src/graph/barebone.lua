local lib = require("lib/raylib")
local raylib = lib.raylib
local mymath = require("lib/mymath")

vars = {}

function init()
    raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")
end

function draw()
    raylib.ClearBackground(lib.BLACK)
end





init();

while raylib.WindowShouldClose() == 0 do
    -- draw
    raylib.BeginDrawing()
        draw()
    raylib.EndDrawing()
end

raylib.CloseWindow()
