export const SvgAppendix = ({ side }: { side: 'left' | 'right' }) => {
  const common = 'absolute bottom-0 w-2 h-2 bg-inherit rotate-45';
  return <span className={`${common} ${side === 'left' ? '-left-1' : '-right-1'}`} />;
};

export default SvgAppendix;
