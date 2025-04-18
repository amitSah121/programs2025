.global _start
_start:
	ldr r0, =list // loading the reference of list
.data
list:
	.word 1,2,3,4
	