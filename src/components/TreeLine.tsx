import { TreeLine } from '@/types/tree';

const TreeLineComponent: React.FC<TreeLine> = ({
  left,
  right,
  top,
  bottom,
  width,
  isDotted,
  color,
  hoverMessage,
  onClick,
}: TreeLine): React.JSX.Element => {
  return (
    <line
      x1={left}
      y1={top}
      x2={right}
      y2={bottom}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={isDotted ? '5,5' : '0'}
      className="cursor-pointer pointer-events-auto"
      onClick={onClick}
    >
      <title>{hoverMessage}</title>
    </line>
  );
};

export default TreeLineComponent;
