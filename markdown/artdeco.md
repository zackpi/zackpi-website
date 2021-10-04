I wanted to make some ArtDeco (as you do), so I went to [Figma]('https://figma.com') and started mocking something up.

This is the image that I made in Figma, and it includes some tricky inner shadows and drop shadows to give the engraved part and the curtain a *beveled* effect.

![art deco style page](/home/zackpi/Documents/zackpi-website/src/components/ArtDeco/dontdelete/with_bevels.png)

I wanted to replicate this effect in CSS so I could make the webpage that you're looking at right now, but there were several problems to solve along the way.

1. Create the brushed metal curtain
2. Make the engraving appear beveled
3. How to make the pinstripes in the background of the dark section

I'm sure the first question you're wondering is why not just use a raster image of the thing I made in Figma and call it a day? The answer is, well, because I can. And it's also fun to learn all of these techniques to see how they could be used in other situations. So with that aside, I'll just proceed with my indulgent CSS / SVG adventure!

## Making the Metal Curtain

The first problem of making the shape of the metal curtain with the desired texture can be done in at least two ways:

- use the CSS `clip-path` property with a `url(#my-path)` to a `clipPath` element
- use the `<image>`  element of an SVG with its `clip-path` property pointing to an internal `path`

The former seems easier at first because it integrates more easily with the rest of my styling. But it was surprisingly difficult to emulate the beveled effect using only CSS. The main issue was the inner shadow and inner highlight that I placed at the bottom of the curtain. This effect is easy to achieve using `inset` with the `box-shadow` property on a rectangular div, but that's not compatible with an arbitrary path and `drop-shadow` doesn't have an `inset` equivalent.

I also tried faking it by putting a `drop-shadow` on a parent element, child element, `:before` or `:after` pseudo-elements, and nothing seemed to be able to create this effect properly.

Finally, I tried to add [filter effects](https://www.w3.org/TR/SVG11/filters.html)  directly into the SVG itself, because there are a couple filters available to add drop-shadows (`feDropShadow`), add a Gaussian blur (`feGaussianBlur`), and merge the results (`feMerge` and `feMergeNode`). It turns out Figma has already implemented good drop-shadow, inner-shadow, and blur effects when you click on an SVG, so I decided to reverse-engineer Figma's SVG output to figure out how they achieved the effect. This is what came out when I downloaded the SVG from Figma:

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

It's kind of overwhelming to look at initially, but it's actually easy to understand the gist of how it works if you look at it step by step (like we're about to do). I labeled the three parts of the filter that achieve the 3 effects: Drop Shadow, Inner Highlight (really an inner shadow, but it's a highlight in this case), and Inner Shadow.
Now to figure out how they work! I'm only going to go through the Inner Highlight effect, because the other two are very similar.

Here's a filter that just applies the Inner Highlight, and I've removed the textured background and changed the colors to demonstrate the effect better (it's the blue part on the rim of the curtain):

![inner highlight](/home/zackpi/Documents/zackpi-website/markdown/img/InnerHighlight.svg)

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

Comparing this to the more verbose one, it's clear that the first two lines of the filter (the `feFlood` and the `feBlend`) are *fixing* the background (even though there's no background image in this case, just a gray background fill). And this probably happens every time a filter is added, to make sure that the filter only affects the parts of the image that we want it to target. The rest of the code in the filter must then be the Inner Highlight effect.

The `feFlood` fills the background with 0 opacity pixels, in other words it makes the background transparent. I'd  show you what that looks like, but... I can't. But I can show you what happens if it's filled with 50% green! I'll also add a kitten in the background so you can distinguish transparent things from opaque things.

```xml
<!-- Flood background with 50% green -->
<feFlood flood-color='green' flood-opacity="0.5" result="BackgroundImageFix"/>
```

With transparent background:

![transparent before](/home/zackpi/Documents/zackpi-website/markdown/img/transparentBefore.png)

With 50% green background:

![50% green before](/home/zackpi/Documents/zackpi-website/markdown/img/50greenBefore.png)

Then the `feBlend` takes the `SourceGraphic` and pastes it on top.

```xml
<!-- Blend in SourceGraphic with the flooded background -->
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
```

With transparent background:

![transparent after](/home/zackpi/Documents/zackpi-website/markdown/img/transparentAfter.png)

With 50% green background:

![50% green after](/home/zackpi/Documents/zackpi-website/markdown/img/50greenAfter.png)

These are the settings that I used for this effect, so we should be able to find the parts of the Inner Highlight effect line-by-line that match these settings.

![inner highlight settings](/home/zackpi/Documents/zackpi-website/markdown/img/settingsIH.png)

First off, there is a reference to [`SourceAlpha`](https://www.w3.org/TR/SVG11/filters.html#SourceAlpha), which is the alpha channel of the `SourceGraphic`. Thus, anything that is supposed to be clipped out of the image shouldn't be affected by this filter. This is good because we are making an *inner* filter so it should get clipped by the path boundary.

```xml
<!-- Apply a 5x4 color matrix to SourceAlpha, turning hardAlpha a #000000 mask -->
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
```
[feColorMatrix](https://www.w3.org/TR/SVG11/filters.html#feColorMatrixElement) multiplies the input image by the specified color matrix:

| R    | G    | B    | A    | M    |
| ---- | ---- | ---- | ---- | ---- |
| 0    | 0    | 0    | 0    | 0    |
| 0    | 0    | 0    | 0    | 0    |
| 0    | 0    | 0    | 0    | 0    |
| 0    | 0    | 0    | 127  | 0    |

This matrix appears to set all of the color channels to 0 to create black, and then uses 127 (out of 255 I presume) in the alpha channel to fade out the black half-way, basically creating a black mask of the source image.
Applying this `feColorMatrix` to `SourceAlpha` creates the black region of the image below:

![masked SourceAlpha](/home/zackpi/Documents/zackpi-website/src/components/ArtDeco/sourceAlphaGray.png)




```xml
<!-- Offset the input image (the mask since 'in' is not specified) by <dx,dy> pixels -->
<feOffset dx="12" dy="-7"/>
```
Just by looking at it, it's pretty clear this is responsible for the x=12 and y=-7 offsets. It chooses between `hardAlpha` (the output of the `feColorMatrix`) or `shape` (the output of the `feBlend`) based on what was most recently operated on. In this case, it chooses `hardAlpha` because the `feColorMatrix` operation was most recent. This probably means that the order that these filters are applied affects performance because the image primitives might need to be loaded and unloaded from memory. Unclear on that though, it's possible they all fit in memory and then it's just about saving those precious bytes by not having to specify the 'in' property.

Anyway, this offsets the mask. The blue region is added by me to indicate where the curtain was before this step.

![with offset](/home/zackpi/Documents/zackpi-website/markdown/img/withOffset.png)




```xml
<!-- Apply a Gaussian blur to the output of the previous step -->
<feGaussianBlur stdDeviation="1"/>
```
This applies a Gaussian blur, which is a pretty standard image manipulation operation that just applies a kernel to the image. The size of the kernel and the standard deviation specify the effect of the blur. I've removed the blue indicator now, but this is still offset as in the previous step.

![with blur](/home/zackpi/Documents/zackpi-website/markdown/img/withBlur.png)



```xml
<!-- Subtract the blurred image from hardAlpha -->
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
```
Then, the two images are composited together, which means they are overlapped and some operation is applied to both to combine them together. In this case the mask is subtracted from `hardAlpha`, so only the parts of `hardAlpha` that are outside of the black region of the previous image end up in the result. This creates the exact shape and gradient of the desired shadow, but the color is all black instead of the `#5ACBE4` color we chose.

![with composite](/home/zackpi/Documents/zackpi-website/markdown/img/withComposite.png)



```xml
<!-- Apply a ColorMatrix to color in the black regions with #5ACBE4 -->
<feColorMatrix type="matrix" values="0 0 0 0 0.904167 0 0 0 0 0.904167 0 0 0 0 0.904167 0 0 0 1 0"/>
```
Now we have to fill in the mask with the correct color. To do that, we apply a color matrix to the result of the composite, which turns all the parts that were black into the exact color we're looking for:

![feColorMatrix cyan color](/home/zackpi/Documents/zackpi-website/markdown/img/feColorMatrix.png)

I used [feColorMatrix.com](https://fecolormatrix.com) to check what color this color matrix creates. Indeed if you use the color picker and check in the image above, you'll find that the color on the right is `#A1E7F3`... hold on, what? We were trying to get `#5ACBE4`, so what gives? I really tried messing around with this to figure out what there's a difference, but I couldn't figure out why. Here are the two hex strings broken into their RGB channels. I also listed the result of taking the last column and multiplying the entries by 255, and they look suspiciously similar to the desired values `rgb(90, 203, 228)` for `#5ACBE4`. My only choice is to conclude that something is wrong with feColorMatrix.com, or the way I was using it.

| input                     | R    | G      | B     |
| ------------------------- | ---- | ------ | ----- |
| #A1E7F3                   | 161  | 231    | 243   |
| #5ACBE4                   | 90   | 203    | 228   |
| 255*(0.355, 0.798, 0.895) | 90.5 | 203.49 | 228.2 |

Anyway, applying this color matrix to the composited mask makes a nice cyan highlight effect:

![withColorMatrix](/home/zackpi/Documents/zackpi-website/markdown/img/withColorMatrix.png)



```xml
<!-- Blend the effect with the source image 'shape' -->
<feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
```
Finally, the colored mask is blended with `shape` to create the final output image (to be clear, the SVG is only the red and cyan parts of this image, but to be consistent with the other images, I've left the gray background).

![inner highlight again](/home/zackpi/Documents/zackpi-website/markdown/img/withBlend.png)

The final move is to use a textured background instead of a solid color. This is the texture I want to use, because I'm going for a *brushed gold* effect. What? Don't judge.

![brushed gold](/home/zackpi/Documents/zackpi-website/markdown/img/goldfoil.png)

This is pretty easy to accomplish using an `<image>` element in the SVG, and set the `clip-path` to the curtain path. Figma does is slightly differently, though. They create an `<image>` called `#image0`and a corresponding `<pattern>` called `#pattern0` in the `defs` section, then use that as the `fill` for the curtain path.

```xml
<g filter="url(#filter0_dii)">
    <path d="..." fill="url(#pattern0)" shape-rendering="crispEdges"/>
</g>
<defs>
    <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlink:href="#image0" transform="translate(0 1.74783) scale(0.00078125 0.00311958)"/>
    </pattern>
    <image id="image0" width="800" height="1280" xlink:href="data:image/..."/>
</defs>
```

![withTexture](/home/zackpi/Documents/zackpi-website/markdown/img/withTexture.png)

Here are the two other effects isolated. The first is the Inner Shadow, and the second is the Drop Shadow.

![InnerShadow](/home/zackpi/Documents/zackpi-website/markdown/img/InnerShadow.png)

![DropShadow](/home/zackpi/Documents/zackpi-website/markdown/img/DropShadow.png)

And finally, the combined image, after making the shadow and highlight effects a little more subtle:

![FullEffect](/home/zackpi/Documents/zackpi-website/markdown/img/FullEffect.png)

It definitely achieves a 3D effect, especially if you don't look too closely :wink:

## Making the Engraved Title

### Custom Title Font

First I have to make the text and the rectangular border. The markup for this is easy, just a `div` and an `h1`:

```html
<div class='border-fancy engraved'>
	<h1 class='font-responsive font-artdeco-title'>ZACKPI</h1>
</div>
```

The CSS for the `h1` tag is two classes, `font-responsive` and `font-artdeco-title`. The former makes the text responsive with respective to the width of the window, and the latter makes the font face match the [Porter Sans Block](https://www.dafont.com/porter-sans-block.font) font I used in Figma.

```css
/* make the font size respond to window width */
.font-responsive {
	font-size: 5vw;
}

/* generate the Porter Sans Block font-face, courtesy of https://www.tylerfinck.com/ */
@font-face {
	font-family: 'porter_sans_blockblock';
	src: url('porter-sans-inline-block-webfont.eot');
	src: url('porter-sans-inline-block-webfont.eot?#iefix') format('embedded-opentype'),
		url('porter-sans-inline-block-webfont.woff') format('woff'),
		url('porter-sans-inline-block-webfont.ttf') format('truetype'),
		url('porter-sans-inline-block-webfont.svg#porter_sans_blockblock') format('svg');
	font-weight: normal;
	font-style: normal;
}
.font-artdeco-title {
	font-family: 'porter_sans_blockblock', sans-serif;
}
```

![titleFont](/home/zackpi/Documents/zackpi-website/markdown/img/titleFont.png)



### Making a Fancy Border

Next, even though 3 rectangles are visible in the image, I managed to avoid using multiple `div` elements by using the `:before` and `:after` pseudo-elements on the one class. The base element of the class has a thick black border, whereas the `:before` pseudo-element creates the thin and tall fine border and the `:after` pseudo-element creates the wide and short fine border. 

```css
/* make the thick main border */
.border-fancy {
	border: 0.5vw solid black;
	box-sizing: border-box;
}

/* make the vertically stretched thin border relative to the main border */
.border-fancy:before {
	content: '';
	position: absolute;
	left: 0.5vw;
	top: -1vw;
	width: calc(100% - 1vw);
	height: calc(100% + 2vw);
	border: 0.125vw solid black;
}

/* make the horizontally stretched thin border relative to the main border */
.border-fancy:after {
	content: '';
	position: absolute;
	left: -1vw;
	top: 0.5vw;
	width: calc(100% + 2vw);
	height: calc(100% - 1vw);
	border: 0.125vw solid black;
}

```

Here, the 3 rectangles are colored red, blue, and yellow so you can tell how it's done:

![titleBorderColored](/home/zackpi/Documents/zackpi-website/markdown/img/titleBorderColored.png)

And this is the final `border-fancy` effect:

![titleBorderBlack](/home/zackpi/Documents/zackpi-website/markdown/img/titleBorderBlack.png)

### Engraved Effect

This is the effect I created in Figma that I'm trying to recreate, where the text and the black rectangles appear to be engraved into the gold background:

![engraveFinalThin](/home/zackpi/Documents/zackpi-website/markdown/img/engraveFinalThin.png)

If that's too subtle to see what's going on, here is the version of the image with no texture in the background. It shows the starting image without the engrave effect, and the process of adding multiple `drop-shadows` to get the full effect.

![engrave animation](/home/zackpi/Documents/zackpi-website/markdown/img/engrave.gif)

There are four `drop-shadows` in the effect, two for highlights and two for shading. But how do you make something look *engraved*? Well if you imagine how engraving works, it's basically take a sharp metal object--the engraver--and scraping and pushing metal material out of the way. From a cross-sectional view, I imagine it looks something like this (stylized and not to scale and probably wrong, so take this with a grain of salt):

![engraveCrossSection](/home/zackpi/Documents/zackpi-website/markdown/img/engraveCrossSection.png)

If you have a light source somewhere above and to the left, the light hits the ridges formed by the engraving process, and creates highlights on the left side of each ridge, and shadows on the right. Something like this:

![engraveSunlight](/home/zackpi/Documents/zackpi-website/markdown/img/engraveSunlight.png)

So we need four `drop-shadows` to target the 4 situations:

* top-left corner highlight
* top-left corner shadow
* bottom-right corner highlight
* bottom-right corner shadow

The settings I used in Figma look like this:

![settingsEngrave1](/home/zackpi/Documents/zackpi-website/markdown/img/settingsEngrave1.png)

![settingsEngrave2](/home/zackpi/Documents/zackpi-website/markdown/img/settingsEngrave2.png)

![settingsEngrave3](/home/zackpi/Documents/zackpi-website/markdown/img/settingsEngrave3.png)

![settingsEngrave4](/home/zackpi/Documents/zackpi-website/markdown/img/settingsEngrave4.png)

While the CSS to achieve this effect looks like this (I tweaked a bunch of the individual values to make something responsive and that works better in context):

```css
/* add 4 drop-shadows to simulate an engraved effect */
.engraved {
	filter: drop-shadow(-0.1vw -0.1vw 0.1vw rgba(61, 48, 22, 0.7)) /* top-left shadow */
		drop-shadow(-0.15vw -0.15vw 0.15vw rgba(243, 185, 60, 0.5)) /* top-left hilite */
		drop-shadow(0.1vw 0.1vw 0.1vw rgba(243, 185, 60, 0.7)) /* bot-right hilite */
		drop-shadow(0.15vw 0.15vw 0.15vw rgba(61, 48, 22, 0.5)); /* bot-right shadow */
}
```

Finally, applying this to the `div` element that contains the title yields the following:

![titleFinal](/home/zackpi/Documents/zackpi-website/markdown/img/titleFinal.png)



## Making the Pin-Stripe Background

Next, I wanted to make a pin-stripe background. I don't even know if this is something that's normal in Art-Deco, but I just thought it would fit the aesthetic (I'm taking a lot of artistic liberties here). I wasn't able to make this effect using the basic tools in Figma, but maybe there is a plugin that makes this type of thing. Anyway, I set out to make it myself.

My first thought is to use a `repeating-linear-gradient` because I can use that to make stripes and then tweak it to make the stripes thin and possibly have some other subtle gradient effect to sell it. Here's an image of the pin-stripe pattern that I want to emulate. There is a thin white line every so often, and then bisecting the white lines is a fainter thick, dark blue line that is barely visible among a dark gray background.

![pinstripeReference](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeReference.jpg)

I'll start by making a `linear-gradient` and a `repeating-linear-gradient`for each step in the process of designing the pattern, that way you can compare what I'm doing on the micro scale with the effect it's having on the macro scale.

The first step is making a gradient that repeats sections of white, then navy, then the dark blue color, then navy again. I'm going to use green to signify the dark blue color until a later step when I choose the precise colors I want:

```css
/* solid-color alternating sequence */
.pin-stripes {
	background: gradient(
		navy,
        navy 25%,
        white 25%,
        white 50%,
        navy 50%,
        navy 75%,
        green 75%,
        green 100%,
        navy 100%,
    );
}
```

![pinstripeSolid](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeSolid.png)

![pinstripeSolidRepeating](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeSolidRepeating.png)



Next, I added some pillow-shaded highlights and shadows, considering that the white and blue stripes would be raised up like stitches, and the navy part would be flatter like fabric:

```css
/* adding highlights and shadows 
 * slight blending to simulate stitching when zoomed out
 */
.pin-stripes {
	background: linear-gradient(
		navy,
		blue 17.5%,
		cyan 35%,
		lightgray 37.5%,
		white 42.5%,
		gray 47.5%,
		navy 50%,
		blue 67.5%,
		cyan 85%,
		yellowgreen 87.5%,
		yellow 92.5%,
		green 97.5%,
		navy 100%
	);
}
```



![pinstripeBlend](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeBlend.png)

![pinstripeBlendRepeating](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeBlendRepeating.png)



Now, I want to consider the direction that the light is coming from in this scene, which is the top-left. But since this will have vertical pin-stripes, the light should basically just be coming from the left (above, since this isn't rotated yet). Therefore, I shift the highlights up for the embossed features (the two stitch lines), and the shadows back for the background features (the fabric).

```css
/* 
shift highlights towards leading edge of stripes, and increase shadows beneath stripes
and adjust sizing of the two stripes
*/
.pin-stripes {
	background: linear-gradient(
		navy,
		blue 15%,
		blue 25%,
		cyan 30%,
		lightgray 32.5%,
		white 33.75%,
		gray 37.5%,
		navy 40%,
		blue 60%,
		cyan 70%,
		yellowgreen 72.5%,
		yellow 82.5%,
		green 97.5%,
		navy 100%
	);
}
```



![pinstripeLighting](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeLighting.png)

![pinstripeLightingRepeating](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeLightingRepeating.png)



Well, it has lighting and stuff, but it still looks **extremely ugly**. At least one reason for that is because it doesn't have the right colors. So in this next step I'm going to map all the colors in the gradient to something that makes more sense. Most are sampled from the image itself, and then tweaked to my liking.

```css
/* 
applying the following color changes:
navy => #231217
blue => #292a2e
cyan => #3c3b40
lightgray => #7e7e6e
white => #98988B
gray => #544646
yellowgreen => #353941
yellow => #40404a
green => #302126
*/
.pin-stripes {
	background: linear-gradient(
		#231217,
		#292a2e 15%,
		#292a2e 25%,
		#3c3b40 30%,
		#7e7e6e 32.5%,
		#98988b 33.75%,
		#544646 37.5%,
		#231217 40%,
		#292a2e 60%,
		#3c3b40 70%,
		#353941 72.5%,
		#40404a 82.5%,
		#302126 97.5%,
		#231217 100%
	);
}
```



![pinstripeColor](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeColor.png)

![pinstripeColorRepeating](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeColorRepeating.png)



The last thing to do is convert the `%` to something that the `repeating-linear-gradient` can work with, in this case I chose `vw` units because they're responsive and this pattern will be rotated vertically--oh yeah, this is a good time to add a `0.25turn`.

```css
/*
choose responsive width and rotate
*/
.pin-stripes {
	background: repeating-linear-gradient(
		0.25turn,
		#231217,
		#292a2e 0.3vw,
		#292a2e 0.5vw,
		#3c3b40 0.6vw,
		#7e7e6e 0.65vw,
		#98988b 0.675vw,
		#544646 0.75vw,
		#231217 0.8vw,
		#292a2e 1.2vw,
		#3c3b40 1.4vw,
		#353941 1.45vw,
		#40404a 1.65vw,
		#302126 1.95vw,
		#231217 2vw
	);
}
```

The final effect looks like really funky, but kind of cool:

![pinstripeFinal](/home/zackpi/Documents/zackpi-website/markdown/img/pinstripeFinal.png)



## Making the Cards





