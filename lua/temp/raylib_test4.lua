
local ffi = require("ffi")
local raylib = ffi.load("libraylib.so") -- or .dll/.dylib

local f = io.open("/mnt/chromeos/removable/card/apps_folder/programs/lua/lib/raylib_clean.h", "r")
local header = f:read("*a")
f:close()
ffi.cdef(header)

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

--[[
static const Color LIGHTGRAY   = { 200, 200, 200, 255 };
static const Color GRAY        = { 130, 130, 130, 255 };
static const Color DARKGRAY    = {  80,  80,  80, 255 };
static const Color YELLOW      = { 253, 249,   0, 255 };
static const Color GOLD        = { 255, 203,   0, 255 };
static const Color ORANGE      = { 255, 161,   0, 255 };
static const Color PINK        = { 255, 109, 194, 255 };
static const Color RED         = { 230,  41,  55, 255 };
static const Color MAROON      = { 190,  33,  55, 255 };
static const Color GREEN       = {   0, 228,  48, 255 };
static const Color LIME        = {   0, 158,  47, 255 };
static const Color DARKGREEN   = {   0, 117,  44, 255 };
static const Color SKYBLUE     = { 102, 191, 255, 255 };
static const Color BLUE        = {   0, 121, 241, 255 };
static const Color DARKBLUE    = {   0,  82, 172, 255 };
static const Color PURPLE      = { 200, 122, 255, 255 };
static const Color VIOLET      = { 135,  60, 190, 255 };
static const Color DARKPURPLE  = { 112,  31, 126, 255 };
static const Color BEIGE       = { 211, 176, 131, 255 };
static const Color BROWN       = { 127, 106,  79, 255 };
static const Color DARKBROWN   = {  76,  63,  47, 255 };

static const Color WHITE       = { 255, 255, 255, 255 };
static const Color BLACK       = {   0,   0,   0, 255 };
static const Color BLANK       = {   0,   0,   0,   0 };
static const Color MAGENTA     = { 255,   0, 255, 255 };
static const Color RAYWHITE    = { 245, 245, 245, 255 };
]]

local playerX = 400
local playerY = 300

while raylib.WindowShouldClose() == 0 do
    -- handle keyboard input
    if raylib.IsKeyDown(ffi.C.KEY_UP) ~= 0 then
        playerY = playerY - 2
    end
    if raylib.IsKeyDown(ffi.C.KEY_DOWN) ~= 0 then
        playerY = playerY + 2
    end
    if raylib.IsKeyDown(ffi.C.KEY_LEFT) ~= 0 then
        playerX = playerX - 2
    end
    if raylib.IsKeyDown(ffi.C.KEY_RIGHT) ~= 0 then
        playerX = playerX + 2
    end

    -- handle mouse input
    local mouseX = raylib.GetMouseX()
    local mouseY = raylib.GetMouseY()
    local mousePressed = raylib.IsMouseButtonDown(raylib.MOUSE_BUTTON_LEFT) ~= 0

    -- draw
    raylib.BeginDrawing()
    raylib.ClearBackground(BLACK)

    raylib.DrawText("Use arrow keys to move square", 10, 10, 20, RAYWHITE)
    raylib.DrawText(string.format("Mouse: %d, %d", mouseX, mouseY), 10, 40, 20, RAYWHITE)

    -- draw player (simple rectangle via DrawText hack)
    raylib.DrawText("#", playerX, playerY, 30, mousePressed and RED or BLUE)

    raylib.EndDrawing()
end

raylib.CloseWindow()