Wanted to make some ArtDeco, so I went to Figma and started mocking something up

This is the image that I made in Figma, and it includes some tricky inner shadows and drop shadows to give the engraved part and the curtain a 'beveled' effect.

with bevels:
without bevels:
(show these zoomed in on the curtain parts so it's clear that the effect I'm looking for is the shadows / highlights)
The difference is subtle, but I think it adds to the realism.
Unfortunately, this is surprisingly difficult to accomplish with CSS and SVG.

At first, I tried using the clip-path property to reference a clipPath element in an internal SVG, and I was able to get the curtain shape as intended. But when I tried to add an inner shadow, I realized that neither drop-shadow or box-shadow would do the trick because the brushed gold texture is in front, and I need to create an inner shadow in front of that image.

I also tried faking it by putting a drop-shadow on a parent element, child element, :before or :after pseudo-elements, and nothing seemed to be able to create this effect properly.

Finally, I tried to add filter effects (link) directly into the SVG itself, because there are a couple filters available to add dropshadows (feDropShadow), add a Gaussian blur (feGaussianBlur), and merge the resutls (feMerge and feMergeNode). I had a bit of trouble finding good documentation on these filter effects (at least ones with visual examples so I could figure out the best way to mix and match these filters to get the desired effect).

But luckily, Figma has already implemented good drop-shadow, inner-shadow, and blur effects when you click on an SVG, so I decided to reverse-engineer Figma's SVG output to figure out how they achieved the effect. This is what came out:

```xml
<svg width="1152" height="319" viewBox="0 0 1152 319" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<g filter="url(#filter0_dii)">
		<path d="M96 240C88 256.167 57.6 288.5 0 288.5V0H1152V288.5C1092 288.5 1062.83 256.167 1056 240C1048 256.167 1018 288.5 960 288.5C902 288.5 871.833 256.167 864 240C856 256.167 825.6 288.5 768 288.5C710.4 288.5 680 256.167 672 240C664.167 256 633.6 288 576 288C518.4 288 488.167 256 480 240C472.167 256 442 288 384 288C326 288 295.667 256 288 240C279.833 256.167 249.6 288.5 192 288.5C134.4 288.5 104 256.167 96 240Z" fill="url(#pattern0)" shape-rendering="crispEdges"/>
	</g>
	<defs>
		<filter id="filter0_dii" x="-20" y="-10" width="1192" height="328.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
			<!-- Drop Shadow / background Image -->
			<feFlood flood-opacity="0" result="BackgroundImageFix"/>
			<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
			<feOffset dy="10"/>
			<feGaussianBlur stdDeviation="10"/>
			<feComposite in2="hardAlpha" operator="out"/>
			<feColorMatrix type="matrix" values="0 0 0 0 0.0458333 0 0 0 0 0.0377569 0 0 0 0 0.020816 0 0 0 1 0"/>
			<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
			<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>

			<!-- Inner Highlight -->
			<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
			<feOffset dx="1" dy="-0.5"/>
			<feGaussianBlur stdDeviation="1"/>
			<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
			<feColorMatrix type="matrix" values="0 0 0 0 0.954167 0 0 0 0 0.726379 0 0 0 0 0.234566 0 0 0 1 0"/>
			<feBlend mode="normal" in2="shape" result="effect2_innerShadow"/>

			<!-- Inner Shadow -->
			<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
			<feOffset dx="-1" dy="1"/>
			<feGaussianBlur stdDeviation="1"/>
			<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
			<feColorMatrix type="matrix" values="0 0 0 0 0.090625 0 0 0 0 0.125 0 0 0 0 0.114687 0 0 0 1 0"/>
			<feBlend mode="normal" in2="effect2_innerShadow" result="effect3_innerShadow"/>
		</filter>

		<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
			<use xlink:href="#image0" transform="translate(0 1.74783) scale(0.00078125 0.00311958) rotate(-90)"/>
		</pattern>
		<image id="image0" width="800" height="1280" xlink:href="data:image/..."/>
	</defs>
</svg>
```

I've labeled the three parts of the filter that achieve the 3 effects: Drop Shadow (DS), Inner Highlight (IH1), and Inner Shadow (IS).
Now to figure out how they work.

Here's a brief description of each of the filter effects, from (link: https://alistapart.com/article/finessing-fecolormatrix/):

feBlend: similar to CSS blend modes, this function describes how images interact via a blend mode
feComponentTransfer: an umbrella term for a function that alters individual RGBA channels (i.e. , feFuncG)
feComposite: a filter primitive that defines pixel-level image interactions
feConvolveMatrix: this filter dictates how pixels interact with their close neighbors (i.e., blurring or sharpening)
feDiffuseLighting: defines a light source
feDisplacementMap: displaces an image (in) using the pixel values of another input (in2)
feFlood: complete fill of the filter subregion with a specified color and alpha level
feGaussianBlur: blurs input pixels using an input standard deviation
feImage: for use within other filters (like feBlend or feComposite)
feMerge: allows for asynchronous application of filter effects, instead of layering them
feMorphology: erodes or dilates lines of source graphic (think strokes on text)
feOffset: used for creating drop shadows
feSpecularLighting: source for the alpha component as a bump map, a.k.a. the “specular” portion of the Phong Reflection Model
feTile: refers to how an image is repeated to fill a space
feTurbulence: allows the creation of synthetic textures using Perlin Noise

So I'll first try to understand the IH, then the IS, and finally the DS effect.

Here's a filter that just applies the IH, and I've removed the textured background to make the effect clear:
show image (innerHighlight.png)

```xml
<filter id="filter0_i" x="-477" y="-238" width="958" height="322" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
	<!-- Fixing the backgroundImage -->
	<feFlood flood-opacity="0" result="BackgroundImageFix"/>
	<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>

	<!-- Inner Highlight effect -->
	<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
	<feOffset dx="3" dy="-1"/>
	<feGaussianBlur stdDeviation="1"/>
	<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
	<feColorMatrix type="matrix" values="0 0 0 0 0.904167 0 0 0 0 0.904167 0 0 0 0 0.904167 0 0 0 1 0"/>
	<feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
</filter>
```

Comparing this to the more verbose one, it's clear that the first two lines of the filter (the feFlood and the feBlend) are "fixing" the background (even though there's no background image in this case, just a gray background fill). And this probably happens every time a filter is added, to make sure that the filter only affects the parts of the image that we want it to target. The rest of the code in the filter must then be the innerHighlight effect (it's called innerShadow in Figma, but for me it's a highlight so that's what I was calling it instead).

These are the settings that I used for this effect, so we should be able to reverse engineer the IH effect line-by-line to figure out how it achieves these settings,
show image (settingsIH.png)

| x | 3 |
| y | -1 |
| blur | 2 |
| color | #E7E7E7 |
| opacity | 100% |

First off, there is a reference to 'SourceAlpha' link(https://www.w3.org/TR/SVG11/filters.html#SourceAlpha), which is the alpha channel of the source graphic. Thus, anything that is supposed to be clipped out of the image shouldn't be affected by this filter. This is good because we are making an inner filter so it should get clipped by the path we've specified.

```xml
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
```

link(https://www.w3.org/TR/SVG11/filters.html#feColorMatrixElement)
This multiplies the input image by the specified color matrix:

| R   | G   | B   | A   | M   |
| --- | --- | --- | --- | --- |
| 0   | 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 127 | 0   |

These matrix appears to set all of the color channels to 0 to create black, and then uses 127 (out of 255 I presume) in the alpha channel to fade out the black half-way, basically creating a black mask of the source image with half opacity.
I used link(https://fecolormatrix.com/) and put this color matrix into the calculator to verify my thought process, and it seems to be correct. I had to swap 127 out for 0.5 because these appear to be mapped from the range [0,255] to [0,1].
show image (feColorMatrix.png)

Applying this to SourceAlpha basically creates a filled in version of SourceAlpha with the desired color.
show image (sourceAlphaGray.png)

```xml
<feOffset dx="3" dy="-1"/>
```

Just by looking at it, it's pretty clear this is what applies the x=3 and y=-1 offsets. It chooses between hardAlpha (the output of the feColorMatrix) or shape (the output of the "fixed background part") based on what was most recently operated on, so I'm guessing the order that these filters are applied affects performance because the image primitives might need to be loaded and unloaded from memory. Unclear on that though, it's possible they all fit in memory and then it's just about saving those precious bytes by not having to specify the 'in' property.

Either way, this offsets the thing that we made gray in the previous step, which we weren't actually able to see before.
show image (withOffset.png)

```xml
<feGaussianBlur stdDeviation="1"/>
```

This applies a Gaussian blur, which is a pretty standard image manipulation operation that just applies a kernel to the image. The size of the kernel and the standard deviation specify the effect of the blur.

show image (withBlur.png)

```xml
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
```

Then, the two images are composited together, which means they are overlapped and some operation is applied to both to combine them together. In this case the mask is subtracted from hardAlpha, so only the parts that are inside of the clipped path end up in the result. This creates the exact shape and gradient of the desired shadow, but the color is all black instead of the #E7E7E7 color we chose.
show image (withComposite.png)

```xml
<feColorMatrix type="matrix" values="0 0 0 0 0.904167 0 0 0 0 0.904167 0 0 0 0 0.904167 0 0 0 1 0"/>
```

Now we have to fill in the mask with the correct color. To do that, we apply a color matrix to the result of the composite, which turns all the parts that were black into the exact color we're looking for:

| R   | G   | B   | A   | M   |
| --- | --- | --- | --- | --- |
| 0   | 0   | 0   | 0   | 0.9 |
| 0   | 0   | 0   | 0   | 0.9 |
| 0   | 0   | 0   | 0   | 0.9 |
| 0   | 0   | 0   | 1   | 0   |

show image ()
indeed if you use the color picker, you'll find that the color on the right is #E7E7E7 color.

```xml
<feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
```

Finally, the colored mask is blended with shape to create the final output image.
show image (innerHighlight.png)
