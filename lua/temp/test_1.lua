
queens = {
	{x=1,y=1},
	{x=1,y=2},
	{x=1,y=3},
	{x=1,y=4},

	{x=1,y=5},
	{x=1,y=6},
	{x=1,y=7},
	{x=1,y=8},
}

function find_and_print(queens)
	for yn=2, 8 do
		txn = 1
		for xn=1, 8 do
			trust = true
			for yo=1, yn-1 do
				queen = queens[yo]
				--print(yo, queen.x, queen.y, xn, yn, not(queen.x == xn or math.abs(queen.x-xn) == math.abs(queen.y - yn)))
				trust = trust and not(queen.x == xn or math.abs(queen.x-xn) == math.abs(queen.y - yn))
			end
			-- print("trust= ",trust)
			if(trust) then
				txn = xn
				break
			end
		end
		queens[yn].x = txn
	end

	-- for i=1,8 do
	-- 	print(queens[i].x, queens[i].y)
	-- end

	for i=1,8 do
		p1 = ""
		for j=1,queens[i].x-1 do p1 = p1.."_ " end
		p1 = p1.."X "
		for j=queens[i].x+1,8 do p1 = p1.."_ " end
		print(p1)
	end
end

for i=1,8 do
	queens[1].x = i
	find_and_print(queens)
	print("----------------------------------\n\n")
end