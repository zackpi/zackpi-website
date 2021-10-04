import React, { useState, useEffect } from 'react';
import './artdeco.css';
import thumbnail_1 from './goldfoil.png';
import { ReactComponent as CurtainSvg } from './curtain.svg';

const ArtDeco = () => {
	const [writeup, setWriteup] = useState('');

	return (
		<div className='w-full h-full pin-stripes overflow-auto scrollbar-none font-artdeco'>
			<div className='z-20 relative w-full h-96'>
				<CurtainSvg className='w-full h-auto' />
				<button
					className='absolute w-20 font-responsive engraved grid place-content-center'
					style={{
						top: '4vw',
						left: '2vw',
						height: '10vw',
					}}
				>
					{'🢦'}
				</button>
				<div
					className='absolute w-1/2 left-1/4 font-responsive border-fancy engraved grid place-content-center'
					style={{
						top: '4vw',
						height: '10vw',
					}}
				>
					<h1>ZACKPI</h1>
				</div>
				<button
					className='absolute w-20 font-responsive engraved grid place-content-center'
					style={{
						top: '4vw',
						right: '2vw',
						height: '10vw',
					}}
				>
					{'🢧'}
				</button>
			</div>

			<div className='-mt-12 pb-36 z-10 w-full flex flex-col space-y-16 items-center'>
				<div className='w-3/4 h-64 card-fancy'>
					<div className='absolute w-full z-20 p-16 flex flex-col space-y-8 justify-start items-center text-3xl'>
						<h1 className='text-4xl'>I.</h1>
						<h2 className=''>Introduction</h2>
					</div>
				</div>

				<div className='w-3/4 h-112 card-fancy'>
					<div className='absolute w-full z-20 p-16 flex flex-col space-y-8 justify-start items-center text-3xl'>
						<h1 className='text-4xl'>II.</h1>
						<h2 className=''>Making the Metal Curtain</h2>
						<img alt='thumbnail' src={thumbnail_1} className='h-48 w-96 fit-cover shadow' />
					</div>
				</div>

				<div className='w-3/4 h-112 card-fancy'>
					<div className='absolute w-full z-20 p-16 flex flex-col space-y-8 justify-start items-center text-3xl'>
						<h1 className='text-4xl'>III.</h1>
						<h2 className=''>Making the Engraved Title</h2>
						<img alt='thumbnail' src={thumbnail_1} className='h-48 w-96 fit-cover shadow' />
					</div>
				</div>

				<div className='w-3/4 h-112 card-fancy'>
					<div className='absolute w-full z-20 p-16 flex flex-col space-y-8 justify-start items-center text-3xl'>
						<h1 className='text-4xl'>IV.</h1>
						<h2 className=''>Making the Pin-Stripe Background</h2>
						<img alt='thumbnail' src={thumbnail_1} className='h-48 w-96 fit-cover shadow' />
					</div>
				</div>

				<div className='w-3/4 h-112 card-fancy'>
					<div className='absolute w-full z-20 p-16 flex flex-col space-y-8 justify-start items-center text-3xl'>
						<h1 className='text-4xl'>V.</h1>
						<h2 className=''>Making the Plaque Cards</h2>
						<img alt='thumbnail' src={thumbnail_1} className='h-48 w-96 fit-cover shadow' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ArtDeco;
