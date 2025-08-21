'use client';

import React, { useEffect, useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useTransformedTreeData } from '@/hooks/useTransformedTreeData';
import { defaultTreeConfig } from '@/constants/person';
import TreeCard from './TreeCard';
import { TreeItem } from '@/types/tree';
import TreeLine from './TreeLine';
import CreatePersonForm from './CreatePersonForm';
import PersonAutoComplete from './PersonAutoComplete';
import { useSession } from 'next-auth/react';

// Extend the session user type to include personId
import type { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    personId?: number;
  }
}

const Tree: React.FC = (): React.JSX.Element => {
  const [showCreateTree, setShowCreateTree] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(
    undefined,
  );
  const { data: session } = useSession();
  const [id, setId] = useState<number>(
    session?.user
      ? ((session.user as typeof session.user & { personId?: number })
          ?.personId ?? 1)
      : 1, // Default to treeId from session or 1 if not available
  );
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // hooks
  const transformedTreeData = useTransformedTreeData(id);

  useEffect(() => {
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

    const _width = maxX + minX; // Add padding
    const _height = maxY + minY; // Add padding
    // Set the width and height based on the bounding box of the tree items
    setWidth(_width);
    setHeight(_height);
  }, [transformedTreeData]); // Recalculate when tree data changes

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

      <div className="fixed top-8 left-8 z-50 w-80 bg-white/60 text-black rounded-xl shadow-lg">
        <PersonAutoComplete
          selectedPersonId={id}
          onSelect={(person) => {
            setId(person.id);
            // Optionally scroll to or highlight the person in the tree
          }}
          placeholder="Search for a person..."
        />
      </div>

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
