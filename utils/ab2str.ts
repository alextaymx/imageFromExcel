export const ab2str = (buf: any) => {
  let str: string = "";
  new Uint8Array(buf).forEach((byte: number) => {
    str += String.fromCharCode(byte);
  });
  return str;
  //   return String.fromCharCode.apply(null, new Uint16Array(buf));
};
