import React, { useMemo } from 'react';

const hashString = (value) => {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
};

const isFinderCell = (x, y, size) => {
    const finderSize = 7;
    const zones = [
        [0, 0],
        [size - finderSize, 0],
        [0, size - finderSize],
    ];

    return zones.some(([startX, startY]) => (
        x >= startX &&
        x < startX + finderSize &&
        y >= startY &&
        y < startY + finderSize
    ));
};

const renderFinder = (x, y, cellSize) => {
    const outer = 7 * cellSize;
    const inner = 5 * cellSize;
    const core = 3 * cellSize;

    return (
        <g key={`finder-${x}-${y}`} transform={`translate(${x * cellSize}, ${y * cellSize})`}>
            <rect width={outer} height={outer} fill="#111827" rx={cellSize * 0.5} />
            <rect x={cellSize} y={cellSize} width={inner} height={inner} fill="#ffffff" rx={cellSize * 0.4} />
            <rect x={cellSize * 2} y={cellSize * 2} width={core} height={core} fill="#111827" rx={cellSize * 0.3} />
        </g>
    );
};

const QRCode = ({
    value = '',
    size = 200,
    includeMargin = true,
    id,
}) => {
    const gridSize = 29;
    const margin = includeMargin ? 2 : 0;
    const totalCells = gridSize + margin * 2;
    const cellSize = size / totalCells;
    const hashedValue = hashString(value);

    const cells = useMemo(() => {
        const activeCells = [];

        for (let y = 0; y < gridSize; y += 1) {
            for (let x = 0; x < gridSize; x += 1) {
                if (isFinderCell(x, y, gridSize)) {
                    continue;
                }

                const noise = hashString(`${value}-${x}-${y}-${hashedValue}`);
                const shouldFill = (noise + x * 17 + y * 31 + hashedValue) % 3 === 0;

                if (shouldFill) {
                    activeCells.push({ x: x + margin, y: y + margin });
                }
            }
        }

        return activeCells;
    }, [hashedValue, margin, value]);

    return (
        <svg
            id={id}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            role="img"
            aria-label="QR code"
        >
            <rect width={size} height={size} fill="#ffffff" rx={size * 0.04} />
            {cells.map((cell) => (
                <rect
                    key={`${cell.x}-${cell.y}`}
                    x={cell.x * cellSize}
                    y={cell.y * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill="#111827"
                    rx={cellSize * 0.18}
                />
            ))}
            {renderFinder(margin, margin, cellSize)}
            {renderFinder(gridSize - 7 + margin, margin, cellSize)}
            {renderFinder(margin, gridSize - 7 + margin, cellSize)}
        </svg>
    );
};

export default QRCode;
