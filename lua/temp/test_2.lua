

-- function a()
-- 	local c1 = coroutine.wrap(function ()
-- 		while true do
-- 			print("C1") 
-- 			coroutine.yield()
-- 		end
-- 	end)
-- 	local c2 = coroutine.wrap(function ()
-- 		while true do
-- 			print("C2") 
-- 			coroutine.yield()
-- 		end
-- 	end)
-- 	while true do
-- 		c1();c2();
-- 	end
-- end


-- -- a()
-- function traceback ()
-- 	print(debug.traceback(traceback))
-- 	for level = 1, math.huge do
-- 		local info = debug.getinfo(level, "Sl")
-- 		if not info then break end
-- 		print(string.format("%d\t[%s]\t%s\t%s\t%s:%d", level, info.source, info.namewhat, info.what, info.short_src, info.currentline))
-- 	end
-- end

-- traceback()

function trace (event, line)
local s = debug.getinfo(2).short_src
print(s .. ":" .. line, event)
end
debug.sethook(trace, "l")

function debug1 ()
while true do
-- io.write("debug> ")
	local line = [[print("fello")\nprint("blello")]]
	print("ehllo")
	if line == "cont" then break end
	assert(load(line)())
end
end

debug1()