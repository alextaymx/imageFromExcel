module.exports.ab2str = (buf: any) => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Uint16Array' is not assignable t... Remove this comment to see the full error message
    return String.fromCharCode.apply(null, new Uint16Array(buf));
};