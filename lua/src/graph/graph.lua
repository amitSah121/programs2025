local lib = require("lib/raylib")
local raylib = lib.raylib
local mymath = require("lib/mymath")

Point = {}
Point.__index = Point

function Point:create(x,y)
    local this = {}
    setmetatable(this,Point)
    this.x = x
    this.y = y
    return this
end

function Point:set(x,y)
    self.x = x or self.x
    self.y = y or self.y 
end


function Point:get()
    return self.x, self.y 
end

quadratic = mymath.makeQuadratic(2,4,5)
points = {}
for i=-100,100 do
    points[i] = Point:create(2*i,quadratic(2*i))
end


raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")

while raylib.WindowShouldClose() == 0 do
    -- handle keyboard input
    -- if raylib.IsKeyDown(raylib.KEY_UP) ~= 0 then
    -- end
    -- if raylib.IsKeyDown(raylib.KEY_DOWN) ~= 0 then
    -- end
    -- if raylib.IsKeyDown(raylib.KEY_LEFT) ~= 0 then
    -- end
    -- if raylib.IsKeyDown(raylib.KEY_RIGHT) ~= 0 then
    -- end

    -- handle mouse input
    -- local mouseX = raylib.GetMouseX()
    -- local mouseY = raylib.GetMouseY()
    -- local mousePressed = raylib.IsMouseButtonDown(raylib.MOUSE_BUTTON_LEFT) ~= 0

    -- draw
    raylib.BeginDrawing()
    raylib.ClearBackground(lib.BLACK)

    
    -- raylib.DrawText("Quadratic(5) = "..,10,10, 20, lib.RED)
    for i=1,#points-1 do
        local px,py = points[i]:get()
        local qx,qy = points[i+1]:get()
        local const = 20
        raylib.DrawLine(px*const,py,qx*const,qy,lib.RED)
    end

    raylib.EndDrawing()
end

raylib.CloseWindow()