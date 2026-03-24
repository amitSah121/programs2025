local M = {}


-- single variable
function M.pointDerivative(x1,x2,dt)
    dt = dt or 0.0000001
    return ((x2-x1)/dt) or 0
end

function M.derivative(f,t,dt)
    dt = dt or 0.001
    local x1 = f(t)
    local x2 = f(t+dt)
    return M.pointDerivative(x1,x2,dt)
end


function M.derivative2(f,t,dt)
    dt = dt or 0.001
    local x1 = f(t)
    local x2 = f(t+dt)
    local x3 = f(t+2*dt)
    return M.pointDerivative(M.pointDerivative(x1,x2,dt), M.pointDerivative(x2,x3,dt),dt)
end



function M.derivative3(f,t,dt)
    dt = dt or 0.1
    local x1 = f(t)
    local x2 = f(t+dt)
    local x3 = f(t+2*dt)
    local x4 = f(t+3*dt)
    return M.pointDerivative(
        M.pointDerivative(
            M.pointDerivative(x1,x2,dt), 
            M.pointDerivative(x2,x3,dt),
            dt
        ),
        M.pointDerivative(
            M.pointDerivative(x2,x3,dt), 
            M.pointDerivative(x3,x4,dt),
            dt
        ),
        dt
    )
end


function M.makeDerivative123(f,s,dt)
    dt = dt or 0.000001
    local dt1 = dt
    local dt2 = dt*1000
    local dt3 = dt2*100
    s = s or 1

    if(s==1) then
        return function(x)
            return M.derivative(f,x,dt1)
        end
    end


    if(s==2) then
        return function(x)
            return M.derivative2(f,x,dt2)
        end
    end


    if(s==3) then
        return function(x)
            return M.derivative3(f,x,dt3)
        end
    end

end


function M.derivativeC(f, x, dt)
    return (f(x+dt) - f(x-dt)) / (2*dt)
end

function M.nderivativeC(f, x, n, dt)
    if n == 0 then return f(x) end
    return M.nderivative(function(t)
        return M.derivative(f, t, dt)
    end, x, n-1, dt)
end


function M.nderivative(f,t,itr,dt)
    dt = dt or 0.001
    local res = {}

    local temp_t = t
    for i=1,itr+1 do
        res[i] = f(temp_t)
        temp_t = temp_t + dt
    end

    for k = 1, itr do
        for i = 1, itr - k + 1 do
            res[i] = (res[i+1] - res[i]) / dt
        end
    end
    return res[1]
end

function M.makeNDerivative(f,itr,dt)
    dt = dt or 0.0001

    return function(t)
        local res = {}
        local temp_t = t
        for i=1,itr+1 do
            res[i] = f(temp_t)
            temp_t = temp_t + dt
        end

        for i=1,itr do
            for j=itr,i,-1 do
                res[itr-j+1] = M.pointDerivative(res[itr - j+1],res[itr - j + 2],dt)
            end
        end
        return res[1]
    end
end

-- single variable
function M.integrate(f,t1,t2,dt)
    dt = dt or 0.0001
    local n = math.floor((t2-t1)/dt)
    local res = 0
    for i=0,n do
        res = res + f(t1)*dt
        t1 = t1+dt
    end
    return res
end


-- functions
function M.linear(x)
    return x
end


function M.signCircle(i)
    return (i % 2 == 0) and -1 or 1
end

function M.factorial(x)
    if(x<=0) then 
        return 1
    else
        return x*M.factorial(x-1)
    end
end

function M.power(x,i)
    local res = 1
    for i=1,i do
        res = res*x
    end
    return res
end

function M.makeQuadratic(a,b,c)
    return function(x)
        return a*x*x+b*x+c
    end
end

function M.makeNFunction(listOfCoff)
    return function(x)
        local res = 0
        for i=#listOfCoff-1,0,-1 do
            res = res + math.pow(x,#listOfCoff-i-1)*listOfCoff[i+1]
        end
        return res
    end
end

function M.makeTaylor(f, a, n, dt)
    n = n or 5
    dt = dt or 1e-3

    local coeffs = {}

    for k = 0, n do
        local deriv
        if k == 0 then
            deriv = f(a)
        else
            deriv = M.nderivative(f, a, k, dt)
        end
        coeffs[k] = deriv / M.factorial(k)
    end

    return function(x)
        local res = 0
        for k = 0, n do
            res = res + coeffs[k] * (x - a)^k
        end
        return res
    end
end

function M.makeTaylorCoeff(f, a, n, dt)
    n = n or 5
    dt = dt or 1e-3

    local coeffs = {}

    for k = 0, n do
        local deriv
        if k == 0 then
            deriv = f(a)
        else
            deriv = M.nderivative(f, a, k, dt)
        end
        coeffs[k] = deriv / M.factorial(k)
    end

    return coeffs
end


--[[
    vars.quadratic = mymath.makeQuadratic(2,4,1)
    local i,j,m = Bracketing(vars.quadratic, -2,-1)
    print("---------------------------------",i,j,m)

    i,j,m = Bracketing(vars.quadratic, -1,0)
    print("---------------------------------",i,j,m)

]]
-- finding roots
function M.Bracketing(f, guessX1, guessX2, count, e)
    local error = e or 0.005
    if(guessX1 >=  guessX2) then return 0,false,guessX1..">"..guessX2 end
    if(guessX2 -  guessX1) <= error then return 0,false,guessX1.."-"..guessX2.." is less" end
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
            local t1,t2,m1 = M.Bracketing(f,guessX1, midx)
            if t2 then
                return t1,t2,m1
            else 
                -- print("-----------goint in 2")
                return M.Bracketing(f,midx,guessX2)
            end
        end

    end
    return root, found, "Return After: "..count
end


--[[


    vars.ex = function(x) 
        e = 2.718281
        return e^(-x)-x
    end


    local i,j,m = NewtonRaphson(vars.ex, 5)
    print("---------------------------------",i)


    local i,j,m = NewtonRaphson(vars.ex, -5)
    print("---------------------------------",i)
]]
function M.NewtonRaphson(f,guessX,count,e)
    count = count or 100
    e = e or 0.05
    local f_ = M.makeDerivative123(f,1)

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




return M