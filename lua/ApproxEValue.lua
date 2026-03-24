
e = 2.718281828459

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

function approxEMiunsX(x, max)
    max = max or 10
    local res = 0

    for i=1,max do
        local f = factorial(i-1)
        local p = power(x,i-1)
        local s = signCircle(i)
        res = res + 1/f* p*s
        -- print(i,f,p,res)
    end
    return res
end

for i=1,10 do
    local approx = approxEMiunsX(i,100)
    local exact = math.pow(e,-i)  
    print(string.format("exact = %.8f  approx = %.8f  error = %e", exact, approx, exact-approx))
end