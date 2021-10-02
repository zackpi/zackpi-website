import React, { useState, useEffect } from 'react';
import marked from 'marked';

// throttle 'bounces' to minimum delay of 'ms' between calls to 'fn'
const throttleTimer = {};
const throttle = (fn, ms) => {
	const bounce = (...args) => {
		if (!throttleTimer[fn.name]) {
			fn(...args);
			throttleTimer[fn.name] = setTimeout(() => {
				delete throttleTimer[fn.name];
			}, ms);
		}
	};
	return bounce;
};

const Editor = () => {
	const [css, setCss] = useState('');
	const [mdx, setMdx] = useState('');
	const [output, setOutput] = useState(null);
	const [leftTab, setLeftTab] = useState('mdxView');
	const [rightTab, setRightTab] = useState('compiledView');

	const handleKeys = e => {
		if (e.ctrlKey && e.key === 's') save(e);
	};
	const save = e => {
		e.preventDefault();
		localStorage.setItem('mdx', mdx);
		localStorage.setItem('css', css);
	};
	const render = raw => {
		console.log('render');
		const html = marked(raw);
		setOutput(html);
		console.log(html);
	};

	useEffect(() => {
		const localMdx = localStorage.getItem('mdx', mdx);
		const localCss = localStorage.getItem('css', css);
		const rawMdx = localMdx ? localMdx : '';
		const rawCss = localCss ? localCss : '';
		setMdx(rawCss);
		setCss(rawMdx);
		render(rawMdx, rawCss);
	}, []);

	useEffect(() => {
		throttle(render, 500)(mdx);
		window.addEventListener('keydown', handleKeys);
		return () => {
			window.removeEventListener('keydown', handleKeys);
		};
	}, [mdx]);

	return (
		<div className='w-full h-full flex bg-gray-700 text-gray-200'>
			<div className='w-1/2 h-full border-r border-gray-500'>
				<div className='h-8 w-full'>
					<button
						className='h-8 px-2 border-r border-gray-800'
						style={{
							backgroundColor: leftTab === 'mdxView' ? '#292524' : '#44403C',
						}}
						onClick={() => setLeftTab('mdxView')}
					>
						mdx
					</button>
					<button
						className='h-8 px-2 border-r border-gray-800'
						style={{
							backgroundColor: leftTab === 'cssView' ? '#292524' : '#44403C',
						}}
						onClick={() => setLeftTab('cssView')}
					>
						css
					</button>
				</div>

				<div className='w-full h-full'>
					{leftTab === 'cssView' ? (
						<textarea
							name='css'
							id='css'
							value={css}
							className='resize-none w-full h-full bg-gray-800 p-2 text-sm focus:outline-none'
							onChange={e => setCss(e.target.value)}
						/>
					) : leftTab === 'mdxView' ? (
						<textarea
							name='mdx'
							id='mdx'
							value={mdx}
							className='resize-none w-full h-full bg-gray-800 p-2 text-sm focus:outline-none'
							onChange={e => setMdx(e.target.value)}
						/>
					) : null}
				</div>
			</div>
			<div className='relative w-1/2 h-full text-sm flex flex-col'>
				<div className='h-8 w-full bg-gray-800 border-b border-gray-800'>
					<button
						className='h-8 px-2 border-r border-gray-700'
						style={{
							backgroundColor: rightTab === 'compiledView' ? '#44403C' : '#292524',
						}}
						onClick={() => setRightTab('compiledView')}
					>
						comp
					</button>
					<button
						className='h-8 px-2 border-r border-gray-700'
						style={{
							backgroundColor: rightTab === 'htmlView' ? '#44403C' : '#292524',
						}}
						onClick={() => setRightTab('htmlView')}
					>
						html
					</button>
				</div>

				<div className='w-full h-full p-2'>
					{rightTab === 'htmlView' ? (
						<div>{output}</div>
					) : rightTab === 'compiledView' ? (
						<div dangerouslySetInnerHTML={{ __html: output }} />
					) : null}
				</div>
			</div>
		</div>
	);
};

export default Editor;
