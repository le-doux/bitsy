import React, { PropsWithChildren } from 'react';
import styles from './styles.module.css';

export default function Sprite({ children }: PropsWithChildren<unknown>): JSX.Element {
	return typeof children === 'string' ? (
		<figure className={styles.sprite}>
			<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
				<rect width="8" height="8" fill="rgb(0,82,204)" />
				{children
					.trim()
					.split(/\s+/)
					.map((row, y) =>
						row
							.trim()
							.split('')
							.map((pixel, x) => (Number(pixel) ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill="white" /> : null))
					)}
			</svg>
			<figcaption>
				<pre>{children}</pre>
			</figcaption>
		</figure>
	) : <span>Invalid sprite data</span>;
}
