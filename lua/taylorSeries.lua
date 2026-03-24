
-- single variable
function pointDerivative(x1,x2,dt)
    dt = dt or 0.0000001
    return ((x2-x1)/dt) or 0
end

function derivative(f,t,dt)
    dt = dt or 0.0000001
    local x1 = f(t)
    local x2 = f(t+dt)
    return pointDerivative(x1,x2,dt)
end


function derivativeC(f, x, dt)
    return (f(x+dt) - f(x-dt)) / (2*dt)
end

function nderivativeC(f, x, n, dt)
    if n == 0 then return f(x) end
    return nderivative(function(t)
        return derivative(f, t, dt)
    end, x, n-1, dt)
end


function nderivative(f,t,itr,dt)
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

function makeNDerivative(f,itr,dt)
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
                res[itr-j+1] = pointDerivative(res[itr - j+1],res[itr - j + 2],dt)
            end
        end
        return res[1]
    end
end

-- single variable
function integrate(f,t1,t2,dt)
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
function linear(x)
    return x
end


function signCircle(i)
    return (i % 2 == 0) and -1 or 1
end

function factorial(x)
    if(x<=0) then 
        return 1
    else
        return x*factorial(x-1)
    end
end

function power(x,i)
    local res = 1
    for i=1,i do
        res = res*x
    end
    return res
end

function makeQuadratic(a,b,c)
    return function(x)
        return a*x*x+b*x+c
    end
end

function makeNFunction(listOfCoff)
    return function(x)
        local res = 0
        for i=#listOfCoff-1,0,-1 do
            res = res + math.pow(x,#listOfCoff-i-1)*listOfCoff[i+1]
        end
        return res
    end
end

function makeTaylor(f, a, n, dt)
    n = n or 5
    dt = dt or 1e-3

    local coeffs = {}

    for k = 0, n do
        local deriv
        if k == 0 then
            deriv = f(a)
        else
            deriv = nderivative(f, a, k, dt)
        end
        coeffs[k] = deriv / factorial(k)
    end

    return function(x)
        local res = 0
        for k = 0, n do
            res = res + coeffs[k] * (x - a)^k
        end
        return res
    end
end

function makeTaylorCoeff(f, a, n, dt)
    n = n or 5
    dt = dt or 1e-3

    local coeffs = {}

    for k = 0, n do
        local deriv
        if k == 0 then
            deriv = f(a)
        else
            deriv = nderivative(f, a, k, dt)
        end
        coeffs[k] = deriv / factorial(k)
    end

    return coeffs
end

quadratic = makeQuadratic(2,3,5)
quadratic1 = makeNDerivative(quadratic,1)
quadratic2 = makeNDerivative(quadratic,2)
quadratic3 = makeNDerivative(quadratic,3)

--[[
2x2 + 3x + 5

4x + 3

4
]]

-- coeffQ = makeTaylorCoeff(quadratic2,0,3,0.1)
coeffQ = makeTaylorCoeff(math.sin,0,10)
for i=0,#coeffQ do
    print(coeffQ[i])
end
-- for i=1,10 do
--     print(derivative(linear,i), derivative(quadratic,i))
-- end

-- print(integrate(quadratic,1,4), (1/3*4*4*4+1/2*4*4+4-1))

-- print(nderivative(linear,3,2))

-- print(nderivative(quadratic,3,2))

-- local point = 80
-- print(quadratic(point),quadratic1(point),quadratic2(point),quadratic3(point))
-- print(quadratic(point),nderivative(quadratic,point,1),nderivative(quadratic,point,2),nderivative(quadratic,point,3))

-- --[[
-- 2x2+3x+5
-- - 4x+3
-- - 4

-- 2*9+3*3+5 = 18+9+5 = 32 
-- ]]

-- print(nderivative(quadratic,point,2,0.01))

-- func3 = makeNFunction({2,3,5,4,1,1})
-- print(quadratic(3),func3(3))
-- print(nderivative(func3,30,5,1))

--[[
2*5*4*3*2*1 = 12*4*5 = 48*5 = 240
]]

