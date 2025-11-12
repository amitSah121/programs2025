package main

import "fmt"

func main() {
	var i [1][2]int

	i[0][0] = 2
	i[0][1] = 3
	cap()

	fmt.Print(i)
}
