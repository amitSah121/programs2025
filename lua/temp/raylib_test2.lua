
local ffi = require("ffi")
local raylib = ffi.load("libraylib.so") -- or .dll/.dylib

local f = io.open("/mnt/chromeos/removable/card/apps_folder/programs/lua/lib/raylib_clean.h", "r")
local header = f:read("*a")
f:close()
ffi.cdef(header)

ffi.cdef [[
int usleep(unsigned int usec);
]]

local RAYWHITE = ffi.new("Color", {r=255, g=255, b=255, a=255})
local BLACK    = ffi.new("Color", {r=0,   g=0,   b=0,   a=255})
local RED      = ffi.new("Color", {r=255, g=0,   b=0,   a=255})
local GREEN    = ffi.new("Color", {r=0,   g=255, b=0,   a=255})
local BLUE     = ffi.new("Color", {r=0,   g=0,   b=255, a=255})
local YELLOW   = ffi.new("Color", {r=255, g=255, b=0,   a=255})
local MAGENTA  = ffi.new("Color", {r=255, g=0,   b=255, a=255})
local ORANGE   = ffi.new("Color", {r=255, g=165, b=0,   a=255})
local PURPLE   = ffi.new("Color", {r=128, g=0,   b=128, a=255})
local GRAY     = ffi.new("Color", {r=128, g=128, b=128, a=255})

raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")

while raylib.WindowShouldClose() == 0 do
    raylib.BeginDrawing()
    raylib.ClearBackground(raylib.BLACK)
    raylib.DrawText("Hello LuaJIT + Raylib!", 100, 100, 20, RAYWHITE)
    raylib.EndDrawing()

    ffi.C.usleep(16000)
end


raylib.CloseWindow()