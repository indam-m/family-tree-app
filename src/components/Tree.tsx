'use client';

import React, { useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useTransformedTreeData } from '@/hooks/useTransformedTreeData';
import { defaultTreeConfig } from '@/constants/person';
import TreeCard from './TreeCard';
import { TreeItem, WholeTree } from '@/types/tree';
import TreeLine from './TreeLine';
import CreatePersonForm from './CreatePersonForm';

const Tree: React.FC<WholeTree> = ({ id }): React.JSX.Element => {
  const [showCreateTree, setShowCreateTree] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(
    undefined,
  );
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
          onEdit={() => {
            setSelectedPersonId(item.person.id);
            setShowCreateTree(true);
          }}
          onClick={() => setSelectedPersonId(item.person.id)}
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

      {/* Floating Home button */}
      <button
        type="button"
        className="fixed bottom-28 right-8 z-50 bg-white text-blue-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg hover:bg-blue-100 hover:text-blue-800 hover:cursor-pointer transition"
        onClick={() => (window.location.href = '/')} // Change to your home route if needed
        aria-label="Home"
      >
        <HomeIcon className="w-8 h-8" />
      </button>
      {/* Floating "+" button */}
      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg hover:bg-blue-700 hover:cursor-pointer transition"
        onClick={() => setShowCreateTree(true)}
        aria-label="Create new tree"
      >
        +
      </button>

      {/* Popup for CreateTree */}
      {showCreateTree && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto"
          onClick={() => setShowCreateTree(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <CreatePersonForm
              id={selectedPersonId}
              onClose={() => {
                setShowCreateTree(false);
                setSelectedPersonId(undefined);
              }}
              onSubmit={async () => {
                setShowCreateTree(false);
                setSelectedPersonId(undefined);
                await transformedTreeData.refetch(); // This will re-fetch the tree data
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tree;
