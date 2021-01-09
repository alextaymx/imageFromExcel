module.exports.sortCoordinates = (imageMeta: any) => {
    let assignedRow = 0;
    let currentUB = -1;
    let currentLB = -1;
    const sortedImageMeta = imageMeta.sort((a: any, b: any) => {
        return a.rowFrom - b.rowFrom;
    });
    for (let element of sortedImageMeta) {
        if (element.rowFrom > currentUB || element.rowFrom < currentLB) {
        assignedRow += 1;
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'midpoint'.
        midpoint = (element.rowTo - element.rowFrom) / 2;
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'midpoint'.
        currentUB = element.rowFrom + midpoint;
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'midpoint'.
        currentLB = element.rowFrom - midpoint;
        }
        element.rowGiven = assignedRow;
    }
    sortedImageMeta.sort((a: any, b: any) => {
        return a.rowGiven - b.rowGiven || a.colFrom - b.colFrom;
    });

    return sortedImageMeta;
};