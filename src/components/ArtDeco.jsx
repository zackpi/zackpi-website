import React, { useState, useEffect } from 'react';
import 'fs';
import goldfoil from './goldfoil.png';
import './artdeco.css';
import { ReactComponent as CurtainSvg } from './dontdelete/innerHighlight.svg';

const ArtDeco = () => {
	const [writeup, setWriteup] = useState('');

	return (
		<div className='w-full h-full bg-gray-700'>
			<CurtainSvg />
			{/*<svg
				width='100%'
				height='50%'
				viewBox='0 0 1 1'
				preserveAspectRatio='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<defs>
					<clipPath id='curtain' clipPathUnits='objectBoundingBox'>
						<path d='M0.083 0.83C0.076 0.886 0.05 1 0 1V0H1V1C0.948 1 0.923 0.886 0.917 0.83C0.91 0.886 0.884 1 0.833 1C0.783 1 0.757 0.886 0.75 0.83C0.743 0.886 0.717 1 0.667 1C0.617 1 0.59 0.886 0.583 0.83C0.577 0.886 0.55 1 0.5 1C0.45 1 0.424 0.886 0.417 0.83C0.41 0.886 0.384 1 0.333 1C0.283 1 0.257 0.886 0.25 0.83C0.243 0.886 0.217 1 0.167 1C0.117 1 0.09 0.886 0.083 0.83Z' />
					</clipPath>
				</defs>
				<image width='1' clip-path='url(#curtain)' href={goldfoil}></image>
			</svg>*/}
		</div>
	);
};

export default ArtDeco;
