local lib = require("lib/raylib")
local raylib = lib.raylib
local mymath = require("lib/mymath")

vars = {}

-- t = {{1,1,2},{1,1,3},{coeff,powerOf1stVar,powerOf2ndVar...}}
function makeMultiVarEquation(t,numvars)
    if t == nil then return mymath.linear end


    return function(...)
        local p1 = {}
        local res = 0

        for i, v in ipairs({...}) do
            p1[i] = v
        end

        for i=1,#t do
            local temp_res = 0
            for j=1,numvars+1 do
                if(j==1) then
                    temp_res = t[i][j]
                else
                    temp_res = temp_res * (p1[j-1])^(t[i][j])
                end
            end
            res = res + temp_res
        end
        return res
    end
end

function multiDerivative(f,points,dt)
    dt = dt or 0.0001

    local res = 0

    for i=1,#points do
        
    end
end

function init()raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")


    vars.quadratic = mymath.makeQuadratic(2,4,1)
    vars.points = {}

    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.quadratic(p1))
    -- end

    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i+1000] = lib.Vector2(p1,p1)
    -- end


    -- local i,j,m = ConstantItr(vars.quadratic, -0.5)
    -- print("---------------------------------",i,j,m)

    vars.fxy = makeMultiVarEquation({{2,1,1},{3,2,3},{1,0,0}},2) -- 2xy+3x2y3+1
    print(vars.fxy(2,3)) 

end

function draw()
    raylib.ClearBackground(lib.BLACK)
    local offsetX = 400
    local offsetY = 300

    raylib.DrawLine(offsetX,0, offsetX,600,lib.BLUE)
    raylib.DrawLine(0,offsetY,800,offsetY,lib.BLUE)

    for i=1,#vars.points - 1 do
        local x1, y1 = vars.points[i].x, vars.points[i].y
        local x2, y2 = vars.points[i+1].x, vars.points[i+1].y
        x1,y1,x2,y2 = x1+offsetX, y1+offsetY, x2+offsetX, y2+offsetY
        raylib.DrawLine(x1,y1,x2,y2,lib.RED)
    end

end





init();

while raylib.WindowShouldClose() == 0 do
    -- draw
    raylib.BeginDrawing()
        draw()
    raylib.EndDrawing()
end

raylib.CloseWindow()
