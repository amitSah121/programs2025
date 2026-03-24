--[[
- Finding roots
- Bracketing
- False point
- Modified false point
]]

local lib = require("lib/raylib")
local raylib = lib.raylib
local mymath = require("lib/mymath")

vars = {}

-- finding roots
function Bracketing(f, guessX1, guessX2, count)
    local error = 0.005
    if(guessX1 >=  guessX2) then return 0,false,guessX1..">"..guessX2 end
    if(guessX2 -  guessX1) <= error then return 0,false,guessX2.."-"..guessX1.." is less" end
    -- Must bracket root
    -- if f(guessX1) * f(guessX2) > 0 then
    --     return nil, false,"cannot bracket"
    -- end

    count = count or 100
    local root = 0 
    local found = false

    for i=1,count do
        midx = (guessX1+guessX2)/2
        midy = f(midx)
        if f(guessX1)*midy < 0 then
            guessX2 = midx
            if math.abs(guessX1-midx) < error then
                found = true
                root = (midx+guessX1)/2
                count = i
                break
            end
        elseif f(guessX2)*midy < 0 then
            guessX1 = midx
            if math.abs(guessX2-midx) < error then
                found = true
                root = (midx+guessX2)/2
                count = i
                break
            end
        else


            -- if math.abs(guessX1-midx) < error then
            --     found = true
            --     root = midx
            --     count = i
            --     break
            -- end
            -- if math.abs(guessX2-midx) < error then
            --     found = true
            --     root = midx
            --     count = i
            --     break
            -- end
            -- print("-----------goint in 1")
            local t1,t2,m1 = Bracketing(f,guessX1, midx)
            if t2 then
                return t1,t2,m1
            else 
                -- print("-----------goint in 2")
                return Bracketing(f,midx,guessX2)
            end
        end

    end
    return root, found, "must be on end "..count
end

function falsePoint(f,guessX1, guessX2, count)
    local error = 0.0005
    if(guessX1 >=  guessX2) then return 0,false,"guess1>guess2" end
    if math.abs(guessX2 -  guessX1) <= error then return 0,false,"guess2-guess1 is less" end

    count = count or 100
    local root = 0 
    local found = false

    for i=1,count do
        xr = guessX2 - ((f(guessX2)*(guessX1-guessX2))/(f(guessX1)-f(guessX2)))
        print(guessX1, guessX2,xr)
        yr = f(xr)
        if f(guessX1)*yr <= 0 then
            guessX2 = xr
            -- print(yr)
            if math.abs(yr) < error then
                found = true
                root = xr
                count = i
                break
            end
        elseif f(guessX2)*yr <= 0 then
            guessX1 = xr
            if math.abs(yr) < error then
                found = true
                root = xr
                count = i
                break
            end
        else
            -- print("-----------goint in 1")
            local t1,t2,m1 = falsePoint(f,guessX1, xr)
            if t2 then
                return t1,t2,m1
            else 
                -- print("-----------goint in 2")
                return falsePoint(f,xr,guessX2)
            end
        end
    end
    return root, found, "must be on end "..count
end

function init()
    raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")

    vars.quadratic = mymath.makeQuadratic(2,4,1)
    vars.points = {}

    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.quadratic(p1))
    -- end

    -- local i,j,m = Bracketing(vars.quadratic, -2,-1)
    -- print("---------------------------------",i,j,m)

    -- i,j,m = Bracketing(vars.quadratic, -1,0)
    -- print("---------------------------------",i,j,m)



    -- local i,j,m = falsePoint(vars.quadratic, -2,-1)
    -- print("---------------------------------",i,j,m)

    -- i,j,m = falsePoint(vars.quadratic, -1,0)
    -- print("---------------------------------",i,j,m)


    -- i,j,m = falsePoint(vars.quadratic, -2,-1)
    -- print("---------------------------------",i,j,m)


    vars.q = mymath.makeQuadratic(-0.6,2.4,5.5)


    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.q(p1))
    -- end

    -- local i,j,m = Bracketing(vars.q, -2,2)
    -- print("---------------------------------",i,j,m)


    -- local i,j,m = Bracketing(vars.q, 2,10)
    -- print("---------------------------------",i,j,m)



    vars.tri1 = mymath.makeNFunction({4,-6,7,-2.3})

    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.tri1(p1))
    -- end

    -- local i,j,m = Bracketing(vars.tri1, -7,0)
    -- print("---------------------------------",i,j,m)


    -- local i,j,m = Bracketing(vars.tri1, 0,7)
    -- print("---------------------------------",i,j,m)


    vars.funf1 = mymath.makeNFunction({1,-8,44,-91,85,-26})

    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.funf1(p1))
    -- end

    -- local i,j,m = Bracketing(vars.funf1, -100,0)
    -- print("---------------------------------",i,j,m)


    -- local i,j,m = Bracketing(vars.funf1, 0,100)
    -- print("---------------------------------",i,j,m)

    vars.temp_linear1 = mymath.makeQuadratic(0,-0.3,0.8)
    vars.temp_linear2 = mymath.makeQuadratic(0,1,0)
    vars.quo1 = function(x) return vars.temp_linear1(x)/vars.temp_linear2(x) end


    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.quo1(p1))
    -- end

    -- local i,j,m = Bracketing(vars.quo1, -5,0)
    -- print("---------------------------------",i,j,m)


    -- local i,j,m = Bracketing(vars.quo1, 0,5)
    -- print("---------------------------------",i,j,m)

    vars.temp_cos1 = function(x) return math.abs(math.cos(math.sqrt(x))) end
    vars.temp_some1 = mymath.makeQuadratic(1,0,0)
    vars.somefunc = function(x) return vars.temp_cos1(x)*vars.temp_some1(x) end


    for i=1,1000 do
        local p1 = (i-200)/10
        vars.points[i] = lib.Vector2(p1,vars.somefunc(p1))
    end

    local i,j,m = Bracketing(vars.somefunc, -0.2,0.2)
    print("---------------------------------",i,j,m)


    local i,j,m = Bracketing(vars.somefunc, 2,3)
    print("---------------------------------",i,j,m)

end

function draw()
    raylib.ClearBackground(lib.RAYWHITE)
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
