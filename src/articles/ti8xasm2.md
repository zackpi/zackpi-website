---
title: Ti8x Z80 ASM Project Euler 00b
description: Printing Hexadecimal and Decimal Numbers
date: 2019-08-04 10:54
layout: hobbyproj
---

### how bcalls work

Texas Instruments provided a lot of useful subroutines, dubbed `bcalls`, that perform some repetitive or complicated task such as interfacing with the LCD screen. These system routines are stored in ROM, so they can only by accessed by a "callback" of sorts and an interrupt from user memory. If we unpack the bcall() macro in the standard `ti83plus.inc` include file, we can see that it simply interrupts and places the address of the system routine in code memory right below the interrupting line. The interrupt vector reads off the last two bytes in the stack, which together form the 16-bit address of the line after the interrupt--where the system routine's address is located. Then it simply dispatches to that routine. So bcalls are pretty powerful, because they mean I don't have to write as much code and it's a lot easier to interact with the hardware on the Ti8x because most of those functions are available in some form of bcall.

```
#define bcall(xxxx) 	rst 28h 	\ .dw xxxx
```

### printing using PutS

One such bcall is `_PutS`, which prints the ASCII-encoded zero-terminated string stored at the location pointed to by the HL register on the Home Screen of the LCD. Here is an example of its usage:

```
main:
	bcall(_ClrLCDFull)
	ld hl, 0
	ld (PenCol), hl 	; set cursor to (0,0)
	ld (CurRow), hl 	; the top left corner of the LCD
	ld hl, yolo 			; load address of string into hl
	bcall(_PutS) 			; print the string
	ret

yolo:
.db "#YOLO", 0
```

### printing hexadecimal

There a million places where printing something would be useful, and for the greater purpose of solving and debugging the Project Euler problems, my main use for `_PutS` will be for printing numbers. But everything in memory is stored as a bunch of bits, which only make sense when you apply some context or format to them. So the problem I need to solve now is a matter of juggling encodings.

When I'm doing calculations, the bits in memory represent numbers, specifically binary numbers stored in 8-bit segments. But the `_PutS` subroutine assumes that the address it's reading from is ASCII-encoded. If I ignore this discrepancy and apply `_PutS` to a number stored in 8-bit binary bytes (assuming none of the bytes are zero, which would cause the printing to stop prematurely), I get a jumbled mess. Therefore, I have to format the string buffer passed to `_PutS`. But translating the binary directly to ASCII-encoding would be very wasteful because each byte turns into eight ASCII characters (2^8 = 256) instead of one. It's also hard for humans to interpret binary directly at a glance, so a standard alternative is hexadecimal. With hexadecimal, each 8-bit byte would only expand into two ASCII characters (16^2 = 256), so the number won't overload the LCD when I try to print large numbers. Furthermore, it's much easier to get a sense of the scale of a hexadecimal number than a binary number.

Luckily, it's simple to convert 8-bit binary bytes to hexadecimal by simply splitting the high and low nibbles apart. Each of these nibbles is 4-bits, which is exactly enough to represent a base-16 number (2^4 = 16). Since the distinction between a hexadecimal representation in memory and binary one is just a matter of perspective, we don't actually need to operate on the bits, but this will help us write the code that makes the hexadecimal printable.

The possible values of a single hex nibble are (0-9,A-F), which should become (30-39,65-70). Therefore, to print one hex nibble, we can add 30 to it to put it into the lower range. If it's above 39, then it must have been A-F, in which case, we can add 25 to skip the gap between the numeral and alphabetic characters. The following code prints a single hex nibble:

```
; prints a hex nibble
; @param: 	a 	contains nibble to be printed
; @reg:	a
prtnbl:
	cp $0a
	jr c, pnbnum	; compare with $A to test if letter or number
pnbltr:	add a, $07
pnbnum:	add a, $30		; convert to ascii for both cases
	bcall(_PutC)	; print the ascii char in a
	ret
; end prtnbl
```

Keep in mind, however, that there are two nibbles per location in memory, so these should be split up and translated separately, then placed consecutively in memory.
Since each byte turns into two hex nibbles, which need to be printed separately, then a hex number of length n will require a 2n-length buffer for the ASCII string to be printed. The following code prints a length-n hex number whose length is stored in the memory location directly before the number.

```
; prints data as hex bytes (little-endian)
; @param: 	hl	contains pointer to data to be printed
; @reg:	a,b,c
prthex:
	dec hl
	ld b, 0
	ld c, (hl)		; c <- length of data in bytes
	add hl, bc 		; jump to end of data
	ld b, c
phxfor:	ld a, (hl)		; a <- byte of data to be printed
	and a, $f0
	rrca
	rrca
	rrca
	rrca		; a <- high nibble
	call prtnbl
	ld a, (hl)
	and a, $0f		; a <- low nibble
	call prtnbl
	dec hl
	djnz phxfor
	ret
; end prthex

```

### converting hexadecimal to decimal

I used the [double dabble](https://en.wikipedia.org/wiki/Double_dabble) algorithm to convert hex values to binary coded decimal so that I could print the decimal value to the screen.
Once it's written in BCD form, you can read off the bytes and convert to characters to print using the prthex function since the decimal value of each place value in BCD (0-9) is the same as the hex character (0x0 - 0x9).

```
; converts a hex value to binary coded decimal
; uses double dabble algorithm
; len_h = floor(log16(n)) + 1
; len_d = floor(log10(n)) + 1
;
; len_d_max = floor(len_h*log10(16)) + 1
; len_d < len_h*5/4 + 1
;
; @param:	hl
; @reg:	a,b,c
hex2bcd:
	dec hl
	ld a, (hl)		; load length of data in bytes
	ld c, a 		; number of iterations of h2dshhx

	add a, a
	add a, a
	add a, a		; multiply by 8 for number of bits
	ld b, a 		; number of iterations of h2dfor

	ld a, c 		; len_h
	add a, a
	add a, a
	add a, c 		; multiply by 5
	and $fc
	rrca
	rrca 		; divide by 4
	add a, $01
	ld (bcdlen), a
	inc hl

h2dfor:	push bc

	ld hl, valbuf
	ld b, c 		; number of iterations of h2dshhx
h2dshhx:	rl (hl)		; shift the whole thing left one
	inc hl
	djnz h2dshhx

	push af

	ld hl, bcdbuf
	ld b, d
h2dadd3:
lonibchk:	ld a, (hl)
	and $0f
	cp $05
	jr c, hinibchk
	add a, $03		; add 3 to low nibble if > 4
hinibchk:	ld c, a
	ld a, (hl)
	and $f0
	cp $50
	jr c, endchk
	add a, $30		; add 3 to high nibble if > 4
endchk:	add a, c
	ld (hl), a 		; write back
	inc hl
	djnz h2dadd3

	pop af

	ld hl, bcdbuf
	ld b, d		; number of iterations of h2dshdc
h2dshdc:	rl (hl)
	inc hl
	djnz h2dshdc	; shift carry into bcd

	scf
	ccf
	pop bc
	djnz h2dfor
	ret

bcdlen:	.db $00		; number of bytes in bcd representation
bcdbuf:	.fill $100
; end prtdec
```

Finally, I could print the hexadecimal and decimal values that I was operating on!
The next step is to expand the 8-bit and (limited) 16-bit math that the z80 allows to 24-bits and beyond so I can calculate the answer to problem 001.
