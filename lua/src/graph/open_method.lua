local lib = require("lib/raylib")
local raylib = lib.raylib
local mymath = require("lib/mymath")

vars = {}

function ConstantItr(f, guessX, count, e)
    guessX = guessX or 0
    count =  count or 100
    e = e or 0.005

    local res = 0
    local found = false

    local f1 = function(x) return x end
    local f2 = function(x) return f(x) + x end

    for i=1,count do
        yp = f1(guessX)
        yr = f2(guessX)
        print(yp,yr)
        if math.abs(yp-yr) < e then
            count = i
            found = true
            res = guessX
            break
        end
        guessX = f1(yr)
    end

    return res, found, "must be last "..count
end

function NewtonRaphson(f,guessX,count,e)
    count = count or 100
    e = e or 0.05
    local f_ = mymath.makeDerivative123(f,1)

    local res = 0

    for i=1,count do 
        if (f(guessX) < e) and (-e < f(guessX)) then
            res = guessX
            break
        end
        guessX = guessX - (f(guessX)/f_(guessX))
    end

    return res
end

function init()
    raylib.InitWindow(800, 600, "Raylib + LuaJIT FFI")


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

    vars.tri = mymath.makeNFunction({2,-4,3,1})
    -- for i=1,10 do
    --     local d1 = mymath.derivative(vars.tri,i)
    --     local d2 = mymath.derivative2(vars.tri,i)
    --     local d3 = mymath.derivative3(vars.tri,i)
    --     print(d1,d2,d3)
    -- end

    --[[
        2x3-4x2+3x+1
        = 6x2-8x+3 = 1  11  33  67 ...
        = 12x-8    = 4  16  28  ...
        = 12       = 12 12  12  12  ...
    ]]



    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.quadratic(p1))
    -- end


    -- local i,j,m = NewtonRaphson(vars.quadratic, 0)
    -- print("---------------------------------",i)


    -- local i,j,m = NewtonRaphson(vars.quadratic, -2)
    -- print("---------------------------------",i)


    vars.ex = function(x) 
        e = 2.718281
        return e^(-x)-x
    end

    -- for i=1,1000 do
    --     local p1 = (i-200)/10
    --     vars.points[i] = lib.Vector2(p1,vars.ex(p1))
    -- end


    -- local i,j,m = NewtonRaphson(vars.ex, 5)
    -- print("---------------------------------",i)


    -- local i,j,m = NewtonRaphson(vars.ex, -5)
    -- print("---------------------------------",i)
    

    vars.x10 = mymath.makeNFunction({1,0,0,0,0,0,0,0,0,0,0})


    for i=1,1000 do
        local p1 = (i-200)/10
        vars.points[i] = lib.Vector2(p1,vars.x10(p1))
    end


    local i,j,m = NewtonRaphson(vars.x10, 5)
    print("---------------------------------",i)


    local i,j,m = NewtonRaphson(vars.x10, -5)
    print("---------------------------------",i)
    

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
