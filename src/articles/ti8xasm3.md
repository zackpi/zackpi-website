---
title: Ti8x Z80 ASM Project Euler 01
description: Implementing int24 math, and solving Problem 01
date: 2019-08-15 4:34
layout: hobbyproj
---

For those that don't know, [Project Euler](https://www.projecteuler.net) is a website that provides several math problems, most of which require some programming approach to solve, whether the approach is a clever algorithm or brute force calculation. It's one of many sites that provides programming problems for its visitors, but it's the only one I've seen that mixes in the mathematics aspect to create some fun (and quite challenging) nerdy puzzles.

The first Project Euler problem is quite easy, and Python code that solves the problem is shorter than the problem statement itself.

```
Problem 1: Multiples of 3 and 5
	If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23.
	Find the sum of all the multiples of 3 or 5 below 1000.
```

```python
print(sum([i for i in range(1000) if i % 3 == 0 or i % 5 == 0]))
```

By the way, the answer to the problem is `233168`, but that's not very satisfying, and the python code isn't very enlightening either. I could easily look up all the answers online if I wanted, but my goal is to try to write some assembly code on the calculator that will solve the problem. Assembly is a different beast from python. In order to get the z80 processor on my Ti84 calculator to print the answer, I not only had to write custom code to print decimal values, but also expand the mathematical capabilities beyond 8-bit and 16-bit to store the 24-bit answer to the problem! Here's how I did it:

# Big Math

Unfortunately, the answer is pretty large. In binary, it's `0b111000111011010000`, or 18 bits. This poses a small problem for the z80, which is a 8-bit processor but has some support for 16-bit arithmetic. This problem will require at least 3 registers or memory locations to store the result and all intermediate values that the resuit takes on during the calculation.

In fact, since I [did look up all the answers online](https://github.com/luckytoilet/projecteuler-solutions) to verify that this challenge would be possible on the z80 (most won't be feasible due to space requirements, but if I couldn't get past the first problem, I wouldn't have even bothered). It turns out that all of the answers are within 64-bits, so any 64-bit machine would be able to compute any of them using most languages. That was a good choice on the part of the Project Euler team, because it increases accessibility and compatibility across everyone's devices and choice of programming language.

So I wrote some code that allows me to add "BIG" numbers, aka ones that are larger than 8- or even 16-bits

```
; add de to big number at (hl)
bigadd:
	dec hl
	push hl 		; length of bignum
	ld a, (hl)
	ld b, a

	inc hl
	ld a, e
	add a, (hl)
	ld (hl), a

	inc hl
	ld a, d
	adc a, (hl)
	ld (hl), a

	jr nc, bgadnc

	dec b
	djnz bgadloop 	; only do loop if > 2 bytes
	jr bgadc

bgadloop:	inc hl
	ld a, $0
	adc a, (hl)
	ld (hl), a
	djnz bgadloop

	jr nc, bgadnc 	; if overflow, update bignum length

bgadc:	inc hl
	inc (hl) 		; overflow $01 into next byte

	pop hl
	inc (hl) 		; overflow causes inc in bignum length
	inc hl 		; return hl unmodified
	ret

bgadnc:	pop hl 		; clean up stack
	inc hl 		; return hl unmodified
 	ret
```

This allows me to create and add to an infinitely large (constrained only by the size of memory) value by overflowing into the next byte in memory whenever the currently-highest byte goes beyond 0xFF.
Luckily, addition is all that's needed for Problem 001, but in order to solve later problems I would probably have to expand the features of this Big Math implementation.

# Fast Algorithm

The naive algorithm is the one that I implemented in python, which simply checks for each number if it's divisible by 3 or 5, then adds it to the total sum if it is.
The problem with the z80 is that it's both much slower compared to modern processors and also not capable of doing the division / modulo operators.

The algorithm that I came up with is both faster and possible to run on the z80 without implementing division and modulo arithmetic.
The numbers that are divisible by 3 or 5 repeat modulo 15:

15 mod 15 = 0 mod 15 = 0
16 mod 15 = 1 mod 15 = 1
17 mod 15 = 2 mod 15 = 2
**18 mod 15 = 3 mod 15 = 3**
19 mod 15 = 4 mod 15 = 4
**20 mod 15 = 5 mod 15 = 5**
**21 mod 15 = 6 mod 15 = 6**
22 mod 15 = 7 mod 15 = 7
23 mod 15 = 8 mod 15 = 8
**24 mod 15 = 9 mod 15 = 9**
**25 mod 15 = 10 mod 15 = 10**
26 mod 15 = 11 mod 15 = 11
**27 mod 15 = 12 mod 15 = 12**
28 mod 15 = 13 mod 15 = 13
29 mod 15 = 14 mod 15 = 14

This also means that the distance from one of these numbers to the next is constant modulo 15 also.
So starting at 0, I skip 3 to get to the next number that should be added to the total sum. Then I skip 2 to get to the next.
And so on and so forth until I would wrap around to the next set of numbers to add modulo 15.
Then I loop over that 1000/15 times to get the total sum. There is a small correction value at the end since 15 doesn't divide 1000 evenly:

```
p001loop:
	push bc

	inc de
	inc de
	inc de
	call bigadd 	; + 3

	inc de
	inc de
	call bigadd 	; + 5

	inc de
	call bigadd 	; + 6

	inc de
	inc de
	inc de
	call bigadd 	; + 9

	inc de
	call bigadd 	; + 10

	inc de
	inc de
	call bigadd 	; + 12

	inc de
	inc de
	inc de
	call bigadd 	; + 15

	pop bc
	djnz p001loop 	; 15*66 = 990 so this loop does < 990

	ld de, $f8f 	; from problem statement 990 -> 999 = 990*4 + 23
	call bigadd

	ret

```

Finally, I just needed to call this loop from a main routine and then print the result using the print subroutine I implemented in the previous installment.
And it worked!!!

```
; execution starts here
main:
	bcall(_ClrLCDFull)	; clear the home screen
	ld hl, 0
	ld (CurRow), hl	; set CurRow to 0

	ld hl, valbuf
	call prob001

	ld hl, valbuf
	call hex2bcd

	ld hl, bcdbuf
	call prthex		; print value
	bcall(_NewLine)
	ret
; end main


vallen:	.db $02		; number of bytes in value
valbuf:	.fill 100
```
