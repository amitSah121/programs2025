local ffi = require("ffi")
local raylib = ffi.load("libraylib.so")

ffi.cdef[[
void InitWindow(int width, int height, const char *title);
void CloseWindow(void);
int WindowShouldClose(void);
void BeginDrawing(void);
void EndDrawing(void);
void ClearBackground(unsigned int color);
void DrawText(const char *text, int posX, int posY, int fontSize, unsigned int color);
typedef struct Vector2 {
    float x;                // Vector x component
    float y;                // Vector y component
} Vector2;
void GetScreenToWorldRay(Vector2 position);
int usleep(unsigned int usec);
]]

local RAYWHITE = 0xFFFFFFFF  -- fully opaque white (AA=FF)
local BLACK    = 0xFF000000  -- fully opaque black
local RED      = 0xFFFF0000  -- fully opaque red
local GREEN    = 0xFF00FF00  -- fully opaque green
local BLUE     = 0xFF0000FF  -- fully opaque blue
local YELLOW   = 0xFFFFFF00  -- fully opaque yellow
local MAGENTA  = 0xFFFF00FF  -- fully opaque magenta
local ORANGE   = 0xFFFFA500  -- fully opaque orange
local PURPLE   = 0xFF800080  -- fully opaque purple
local GRAY     = 0xFF808080  -- fully opaque gray

raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")

while raylib.WindowShouldClose() == 0 do
    raylib.BeginDrawing()
    raylib.ClearBackground(BLACK)
    raylib.DrawText("Hello LuaJIT + Raylib!", 100, 100, 20, RAYWHITE)
    raylib.EndDrawing()
    ffi.C.usleep(16000)
end
raylib.CloseWindow()