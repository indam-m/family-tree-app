'use client';

import React from 'react';
import { useTransformedTreeData } from '@/hooks/useTransformedTreeData';
import { defaultTreeConfig } from '@/constants/person';
import TreeCard from './TreeCard';
import { TreeItem, WholeTree } from '@/types/tree';
import TreeLine from './TreeLine';

const Tree: React.FC<WholeTree> = ({ id }): React.JSX.Element => {
  // hooks
  const transformedTreeData = useTransformedTreeData(id);

  // Calculate the bounding box of all TreeCards and TreeLines
  const minX =
    Math.min(
      ...transformedTreeData.treeItems.map((item) => item.midXPosition),
    ) -
    defaultTreeConfig.ITEM_WIDTH / 2;
  const maxX =
    Math.max(
      ...transformedTreeData.treeItems.map((item) => item.midXPosition),
    ) +
    defaultTreeConfig.ITEM_WIDTH / 2;
  const minY =
    Math.min(
      ...transformedTreeData.treeItems.map((item) => item.midYPosition),
    ) -
    defaultTreeConfig.ITEM_HEIGHT / 2;
  const maxY =
    Math.max(
      ...transformedTreeData.treeItems.map((item) => item.midYPosition),
    ) +
    defaultTreeConfig.ITEM_HEIGHT / 2;

  const width = maxX + minX; // Add padding
  const height = maxY + minY; // Add padding

  return (
    <div
      className="absolute"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {transformedTreeData.treeItems.map((item: TreeItem, index: number) => (
        <TreeCard
          key={index}
          midXPosition={item.midXPosition}
          midYPosition={item.midYPosition}
          person={item.person}
        />
      ))}
      <svg className="group absolute w-full h-full left-0 top-0 pointer-events-none">
        {transformedTreeData.treeLines.map((line, index) => (
          <TreeLine
            key={index}
            left={line.left}
            right={line.right}
            top={line.top}
            bottom={line.bottom}
            width={line.width}
            isDotted={line.isDotted}
            color={line.color}
            personOneId={line.personOneId}
            personTwoId={line.personTwoId}
            relationshipId={line.relationshipId}
            parentChildId={line.parentChildId}
            isHalfChildToParent={line.isHalfChildToParent}
            isHalfParentToChild={line.isHalfParentToChild}
            isLeftToRightSibling={line.isLeftToRightSibling}
            isMidChildToSingleParent={line.isMidChildToSingleParent}
            isRelationship={line.isRelationship}
            hoverMessage={line.hoverMessage}
            onClick={line.onClick}
          />
        ))}
      </svg>
    </div>
  );
};

export default Tree;
