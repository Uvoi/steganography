export function getPixelsCount(ctx: CanvasRenderingContext2D, width: number, height: number): number {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    return data.length / 4;
}

export function getPosition(ctx: CanvasRenderingContext2D, width: number, height: number): number {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelFrequency: { [key: string]: number } = {};

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const color = `${r},${g},${b},${a}`;
        pixelFrequency[color] = (pixelFrequency[color] || 0) + 1;
    }

    let minFrequentColor: string | null = null;
    let mostFrequentColor: string | null = null;
    let minCount = Infinity;
    let maxCount = 0;
    const pixelsCount = getPixelsCount(ctx, width, height);

    for (const color in pixelFrequency) {
        if (pixelFrequency[color] < minCount) {
            minCount = pixelFrequency[color];
            minFrequentColor = color;
        }
    }

    for (const color in pixelFrequency) {
        if (pixelFrequency[color] > maxCount) {
            maxCount = pixelFrequency[color];
            mostFrequentColor = color;
        }
    }

    // console.log(
    //     'minFrequentColor :', minFrequentColor,
    //     ' mostFrequentColor: ', mostFrequentColor,
    //     ' minCount: ', minCount,
    //     ' maxCount: ', maxCount,
    //     ' pixelsCount: ', pixelsCount
    // );

    const minBorder = (x: number) => x > 500;
    const maxBorder = (x: number) => x < pixelsCount * (4 / 6);
    const minMaxBorder = (num: number) => minBorder(num) && maxBorder(num);

    if (minMaxBorder(Math.round(pixelsCount / maxCount))) {
        // console.log('if1');
        return Math.round(pixelsCount / maxCount);
    } else if (maxBorder(Math.round(pixelsCount / maxCount))) {
        if (
            minMaxBorder(
                Math.round(
                    pixelsCount /
                    (maxCount /
                        (minFrequentColor!.split(',').slice(0, 3).map(Number).reduce((a, b) => a + b, 0) + 50000))
                )
            )
        ) {
            // console.log('if2');
            return Math.round(
                pixelsCount /
                (maxCount /
                    (mostFrequentColor!.split(',').slice(0, 3).map(Number).reduce((a, b) => a + b, 0) + 50000))
            );
        } else if (
            maxBorder(
                Math.round(
                    pixelsCount /
                    (maxCount /
                        (mostFrequentColor!.split(',').slice(0, 3).map(Number).reduce((a, b) => a + b, 0) + 50000))
                )
            )
        ) {
            // console.log('if3');
            return Math.round(
                pixelsCount /
                (maxCount /
                    (mostFrequentColor!.split(',').slice(0, 3).map(Number).reduce((a, b) => a + b, 0) + 50000))
            );
        } else {
            // console.log('if4');
            return Math.round(
                pixelsCount * (3 / 5) - minFrequentColor!.split(',').slice(0, 3).map(Number).reduce((a, b) => a + b, 0)
            );
        }
    } else {
        // console.log('if5');
        return Math.round(
            pixelsCount / 2 - mostFrequentColor!.split(',').slice(0, 3).map(Number).reduce((a, b) => a + b, 0)
        );
    }
}
