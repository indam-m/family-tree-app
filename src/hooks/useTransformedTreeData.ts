'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  gender,
  defaultTreeConfig,
  DEFAULT_TREE_LINE,
  treeItemPosition,
} from '@/constants/person';
import {
  Person,
  ParentChild,
  Relationship,
  TreeItem,
  TreeLine,
} from '@/types/tree';
import { GET_EVERYTHING } from '@/lib/graphql/person/queries';

export const useTransformedTreeData = (personId: number) => {
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]);
  const [treeLines, setTreeLines] = useState<TreeLine[]>([]);
  const [peopleData, setPeopleData] = useState<Person[]>([]);
  const [personDict, setPersonDict] = useState<{ [id: number]: Person }>({});

  let maxMidX = 0;

  const { data, loading, error, refetch } = useQuery(GET_EVERYTHING, {
    variables: { rootId: personId },
    fetchPolicy: 'no-cache',
  });

  const generateTreeItem = (
    personId: number,
    depth: number,
    currentMidX: number,
    currentMidY: number,
    position: string,
    traceRelationship: boolean = true,
    traceParents: boolean = false,
    partnerIdToExclude: number,
  ) => {
    const person = personDict[personId];
    if (!person) {
      console.warn(`Person with ID ${personId} not found in personDict.`);
    }
    let parentOneId = 0,
      parentTwoId = 0;
    const parentChildRelation =
      person?.parentChildRelations && person?.parentChildRelations[0];
    if (parentChildRelation) {
      parentOneId = parentChildRelation?.parentOneId || 0;
      parentTwoId = parentChildRelation?.parentTwoId || 0;
    }
    let treeItem: TreeItem = {
      person: person,
      midXPosition: currentMidX,
      midYPosition: currentMidY,
    };
    let localMidX = currentMidX;
    const localMidY = currentMidY;

    if (traceParents) {
      // have both parents data
      if (parentOneId !== 0 && parentTwoId !== 0) {
        const parentOneItem = generateTreeItem(
          parentOneId,
          depth + 1,
          localMidX,
          localMidY,
          treeItemPosition.LEFT,
          true,
          false,
          parentTwoId,
        );
        localMidX = parentOneItem.midX;
        maxMidX = Math.max(maxMidX, localMidX);
      } else if (parentOneId !== 0 || parentTwoId !== 0) {
        // have only parent data
        const parentId = parentOneId || parentTwoId;
        return generateTreeItem(
          parentId,
          depth + 1,
          localMidX,
          localMidY,
          position,
          traceRelationship,
          false,
          0,
        );
      }
    }

    const proceed = !traceParents || (parentOneId === 0 && parentTwoId === 0);
    if (depth > 1 && proceed) {
      const childMidTop = getChildMidTop(localMidY);

      let relationships = [] as Relationship[];
      const leftRelationships: Relationship[] = [];
      const rightRelationships: Relationship[] = [];

      const leftPartnerTreeItems: {
        treeItem: TreeItem;
        relationship: Relationship;
      }[] = [];
      const rightPartnerTreeItems: {
        treeItem: TreeItem;
        relationship: Relationship;
      }[] = [];
      let selfMidXPosition = currentMidX;

      if (traceRelationship) {
        relationships = (person?.relationshipsAsPersonOne || []).concat(
          person?.relationshipsAsPersonTwo || [],
        );
        if (position === treeItemPosition.RIGHT) {
          relationships = relationships.filter(
            (relationship) =>
              relationship.personOneId !== partnerIdToExclude &&
              relationship.personTwoId !== partnerIdToExclude,
          );
        }
        relationships.forEach((relationship, index) => {
          if (
            relationship.personOneId !== partnerIdToExclude &&
            relationship.personTwoId !== partnerIdToExclude &&
            (position === treeItemPosition.LEFT ||
              (position === treeItemPosition.CENTER &&
                relationships.length === 1 &&
                person.gender !== gender.MALE) ||
              (relationships.length > 1 && index < relationships.length / 2))
          ) {
            leftRelationships.push(relationship);
          } else {
            rightRelationships.push(relationship);
          }
        });

        // Left relationships generating
        leftRelationships.forEach((relationship) => {
          const partnerId =
            relationship.personOneId === personId
              ? relationship.personTwoId
              : relationship.personOneId;

          const partnerItem = generateTreeItem(
            partnerId,
            depth,
            localMidX,
            localMidY,
            treeItemPosition.LEFT,
            false,
            false,
            0,
          );
          maxMidX = Math.max(maxMidX, localMidX);
          leftPartnerTreeItems.push({
            treeItem: partnerItem.treeItem,
            relationship,
          });
          localMidX = partnerItem.midX;
          maxMidX = Math.max(maxMidX, localMidX);
          const parentChildren = relationship.parentChildren || [];

          if (parentChildren.length > 0) {
            if (relationship.parentChildren?.length === 1) {
              localMidX +=
                defaultTreeConfig.ITEM_MARGIN_X +
                defaultTreeConfig.ITEM_WIDTH / 2;
            }
            maxMidX = Math.max(maxMidX, localMidX);
            const {
              mostLeft,
              mostRight,
              localMidX: _localMidX,
            } = processChildren(parentChildren, depth, localMidX, childMidTop);
            localMidX = _localMidX;
            maxMidX = Math.max(maxMidX, localMidX);
            const topLine =
              childMidTop -
              (defaultTreeConfig.ITEM_HEIGHT +
                defaultTreeConfig.ITEM_MARGIN_Y) /
                2;
            const midPosition = (mostLeft + mostRight) / 2;
            setTreeLines((prevLines) => [
              ...prevLines,
              {
                ...DEFAULT_TREE_LINE,
                left: mostLeft,
                right: mostRight,
                top: topLine,
                bottom: topLine,
                personOneId: parentChildren[0].childId,
                personTwoId: parentChildren[parentChildren.length - 1].childId,
                isLeftToRightSibling: true,
              },
              {
                ...DEFAULT_TREE_LINE,
                left: midPosition,
                right: midPosition,
                top: localMidY,
                bottom:
                  localMidY +
                  (defaultTreeConfig.ITEM_HEIGHT +
                    defaultTreeConfig.ITEM_MARGIN_Y) /
                    2,
                isHalfParentToChild: true,
              },
            ]);
            if (
              leftRelationships.length === 1 &&
              rightRelationships.length === 0
            ) {
              selfMidXPosition =
                midPosition +
                defaultTreeConfig.ITEM_WIDTH / 2 +
                defaultTreeConfig.ITEM_MARGIN_X;
            }
            // adjusting left partner position
            const partnerMidXPosition =
              midPosition -
              (defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X) /
                2;
            if (partnerItem.treeItem.midXPosition !== partnerMidXPosition) {
              partnerItem.treeItem.midXPosition = partnerMidXPosition;
              setTreeItems((prevItems) =>
                prevItems.map((item) =>
                  item.person?.id === partnerId
                    ? { ...partnerItem.treeItem }
                    : item,
                ),
              );
              setTreeLines((prevLines) =>
                prevLines.map((line) => {
                  if (
                    line.personOneId === partnerId ||
                    line.personTwoId === partnerId
                  ) {
                    if (line.isRelationship) {
                      return {
                        ...line,
                        right:
                          partnerMidXPosition -
                          defaultTreeConfig.ITEM_WIDTH / 2,
                      };
                    }
                    if (line.isMidChildToSingleParent) {
                      return {
                        ...line,
                        right: partnerMidXPosition,
                      };
                    }
                    if (
                      line.isHalfParentToChild &&
                      (line.personOneId === 0 || line.personTwoId === 0)
                    ) {
                      return {
                        ...line,
                        left: partnerMidXPosition,
                        right: partnerMidXPosition,
                      };
                    }
                  }
                  return line;
                }),
              );
            }
          }
        });
      }

      // If having personal children
      const personalChildren = person?.parentChildOfChildren || [];
      if (personalChildren.length > 0) {
        if (position === treeItemPosition.RIGHT) {
          localMidX = Math.max(
            localMidX +
              defaultTreeConfig.ITEM_WIDTH +
              defaultTreeConfig.ITEM_MARGIN_X,
            maxMidX,
          );
        }

        const {
          mostLeft,
          mostRight,
          localMidX: _localMidX,
        } = processChildren(
          person.parentChildOfChildren || [],
          depth,
          localMidX,
          childMidTop,
        );
        localMidX = _localMidX;
        maxMidX = Math.max(maxMidX, localMidX);

        let midXPosition = (mostLeft + mostRight) / 2;
        if (position === treeItemPosition.LEFT) {
          midXPosition =
            mostRight +
            defaultTreeConfig.ITEM_WIDTH / 2 +
            defaultTreeConfig.ITEM_MARGIN_X;
        } else if (position === treeItemPosition.RIGHT) {
          midXPosition =
            mostLeft -
            (defaultTreeConfig.ITEM_WIDTH / 2 +
              defaultTreeConfig.ITEM_MARGIN_X);
        }

        if (traceRelationship && position !== treeItemPosition.RIGHT) {
          selfMidXPosition = midXPosition;
        } else if (position === treeItemPosition.LEFT) {
          selfMidXPosition =
            mostRight +
            defaultTreeConfig.ITEM_WIDTH +
            defaultTreeConfig.ITEM_MARGIN_X;
          localMidX = selfMidXPosition;
          maxMidX = Math.max(maxMidX, localMidX);
        }

        const topLine =
          childMidTop -
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        const midPosition = (mostLeft + mostRight) / 2;
        const midBottomLine =
          localMidY +
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        setTreeLines((prevLines) => [
          ...prevLines,
          {
            ...DEFAULT_TREE_LINE,
            left: mostLeft,
            right: mostRight,
            top: topLine,
            bottom: topLine,
            personOneId: personalChildren[0].childId,
            personTwoId: personalChildren[personalChildren.length - 1].childId,
            isLeftToRightSibling: true,
          },
          {
            ...DEFAULT_TREE_LINE,
            left: midPosition,
            right: midPosition,
            top:
              localMidY +
              defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 4,
            bottom: midBottomLine,
            isHalfChildToParent: true,
          },
          {
            ...DEFAULT_TREE_LINE,
            left: selfMidXPosition,
            right: selfMidXPosition,
            top: localMidY + defaultTreeConfig.ITEM_HEIGHT / 2,
            bottom:
              localMidY +
              defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 4,
            isHalfParentToChild: true,
            personOneId: personId,
          },
          ...(selfMidXPosition !== midPosition
            ? [
                {
                  ...DEFAULT_TREE_LINE,
                  left: selfMidXPosition,
                  right: midPosition,
                  top:
                    localMidY +
                    defaultTreeConfig.ITEM_HEIGHT / 2 +
                    defaultTreeConfig.ITEM_MARGIN_Y / 4,
                  bottom:
                    localMidY +
                    defaultTreeConfig.ITEM_HEIGHT / 2 +
                    defaultTreeConfig.ITEM_MARGIN_Y / 4,
                  isMidChildToSingleParent: true,
                  personOneId: personId,
                },
              ]
            : []),
        ]);
      }

      treeItem = {
        ...treeItem,
        midXPosition: selfMidXPosition,
      };
      localMidX = selfMidXPosition;
      maxMidX = Math.max(maxMidX, localMidX);

      // Right relationships generating
      if (traceRelationship) {
        rightRelationships.forEach((relationship, index) => {
          const partnerId =
            relationship.personOneId === personId
              ? relationship.personTwoId
              : relationship.personOneId;
          let partnerMidXPosition = localMidX;
          console.log(
            `Generating right relationship for partner ID ${partnerId} at depth ${depth}`,
          );

          const parentChildren = relationship.parentChildren || [];

          if (parentChildren.length > 0) {
            if (parentChildren.length === 1) {
              localMidX +=
                defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH;
            }
            const {
              mostLeft,
              mostRight,
              localMidX: _localMidX,
            } = processChildren(parentChildren, depth, localMidX, childMidTop);
            localMidX = _localMidX;
            maxMidX = Math.max(maxMidX, localMidX);
            const topLine =
              childMidTop -
              (defaultTreeConfig.ITEM_HEIGHT / 2 +
                defaultTreeConfig.ITEM_MARGIN_Y / 2);
            const midPosition = (mostLeft + mostRight) / 2;
            setTreeLines((prevLines) => [
              ...prevLines,
              {
                ...DEFAULT_TREE_LINE,
                left: mostLeft,
                right: mostRight,
                top: topLine,
                bottom: topLine,
                personOneId: parentChildren[0].childId,
                personTwoId: parentChildren[parentChildren.length - 1].childId,
                isLeftToRightSibling: true,
              },
              {
                ...DEFAULT_TREE_LINE,
                left: midPosition,
                right: midPosition,
                bottom:
                  localMidY +
                  defaultTreeConfig.ITEM_HEIGHT / 2 +
                  defaultTreeConfig.ITEM_MARGIN_Y / 2,
                top: localMidY,
                isHalfParentToChild: true,
                relationshipId: relationship.id,
              },
            ]);
            if (
              leftRelationships.length === 0 &&
              rightRelationships.length === 1 &&
              personalChildren.length === 0
            ) {
              selfMidXPosition =
                midPosition -
                (defaultTreeConfig.ITEM_WIDTH +
                  defaultTreeConfig.ITEM_MARGIN_X) /
                  2;
            }
            partnerMidXPosition =
              midPosition +
              (defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X) /
                2;
          } else {
            partnerMidXPosition +=
              (defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X) /
              2;
          }

          const partnerItem = generateTreeItem(
            partnerId,
            depth,
            partnerMidXPosition,
            localMidY,
            treeItemPosition.RIGHT,
            false,
            false,
            partnerIdToExclude !== 0 ? personId : 0,
          );
          maxMidX = Math.max(
            partnerMidXPosition +
              defaultTreeConfig.ITEM_WIDTH / 2 +
              defaultTreeConfig.ITEM_MARGIN_X,
            localMidX,
          );
          localMidX = maxMidX;
          rightPartnerTreeItems.push({
            treeItem: partnerItem.treeItem,
            relationship,
          });
          treeItem = {
            ...treeItem,
            midXPosition: selfMidXPosition,
          };

          // adjusting localMidX
          if (
            index === rightRelationships.length - 1 &&
            ((relationship.parentChildren?.length || 0) > 0 ||
              (personDict[partnerId].parentChildOfChildren || []).length > 0)
          ) {
            localMidX -=
              defaultTreeConfig.ITEM_WIDTH / 2 +
              defaultTreeConfig.ITEM_MARGIN_X;
          }
        });

        // Generating relationship lines
        leftPartnerTreeItems.forEach((partnerTreeItem) => {
          setTreeLines((prevLines) => [
            ...prevLines,
            {
              ...DEFAULT_TREE_LINE,
              ...(partnerTreeItem.relationship.isDivorced && {
                isDotted: true,
              }),
              ...(partnerTreeItem.relationship.isMarried &&
                !partnerTreeItem.relationship.isDivorced && { width: 4 }),
              left:
                partnerTreeItem.treeItem.midXPosition +
                defaultTreeConfig.ITEM_WIDTH / 2,
              right: treeItem.midXPosition - defaultTreeConfig.ITEM_WIDTH / 2,
              top: treeItem.midYPosition,
              bottom: treeItem.midYPosition,
              personOneId: partnerTreeItem.relationship.personOneId,
              personTwoId: partnerTreeItem.relationship.personTwoId,
              relationshipId: partnerTreeItem.relationship.id,
              isRelationship: true,
            },
          ]);
        });
        rightPartnerTreeItems.forEach((partnerTreeItem) => {
          setTreeLines((prevLines) => [
            ...prevLines,
            {
              ...DEFAULT_TREE_LINE,
              ...(partnerTreeItem.relationship.isDivorced && {
                isDotted: true,
              }),
              ...(partnerTreeItem.relationship.isMarried &&
                !partnerTreeItem.relationship.isDivorced && { width: 4 }),
              right:
                partnerTreeItem.treeItem.midXPosition -
                defaultTreeConfig.ITEM_WIDTH / 2,
              left: treeItem.midXPosition + defaultTreeConfig.ITEM_WIDTH / 2,
              top: treeItem.midYPosition,
              bottom: treeItem.midYPosition,
              personOneId: partnerTreeItem.relationship.personOneId,
              personTwoId: partnerTreeItem.relationship.personTwoId,
              relationshipId: partnerTreeItem.relationship.id,
              isRelationship: true,
            },
          ]);
        });
      }
    }
    if (proceed) {
      setTreeItems((prevItems) => [...prevItems, treeItem]);
    }
    console.log(
      `Generated tree item for person ${personId} at depth ${depth} with position ${position} and localMidX ${localMidX}`,
    );
    return {
      treeItem,
      midX:
        localMidX +
        (position !== treeItemPosition.LEFT
          ? defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X
          : 0),
    };
  };

  const processChildren = (
    parentChildrens: ParentChild[],
    depth: number,
    currentMidX: number,
    localMidY: number,
  ) => {
    let localMidX = currentMidX;
    let mostLeft = 0,
      mostRight = 0;
    parentChildrens.forEach((parentChild, index) => {
      const childId = parentChild.childId;
      const childItem = generateTreeItem(
        childId,
        depth - 1,
        localMidX,
        localMidY,
        treeItemPosition.CENTER,
        true,
        false,
        0,
      );
      maxMidX = Math.max(maxMidX, localMidX);
      if (index === 0) {
        mostLeft = childItem.treeItem.midXPosition;
      }
      if (index === parentChildrens.length - 1) {
        mostRight = childItem.treeItem.midXPosition;
      }
      setTreeLines((prevLines) => [
        ...prevLines,
        {
          ...DEFAULT_TREE_LINE,
          left: childItem.treeItem.midXPosition,
          right: childItem.treeItem.midXPosition,
          top:
            localMidY -
            (defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 2),
          bottom: localMidY - defaultTreeConfig.ITEM_HEIGHT / 2,
          personOneId: childId,
          isHalfChildToParent: true,
        },
      ]);
      localMidX = childItem.midX;
      maxMidX = Math.max(maxMidX, localMidX);
    });
    return { mostLeft, mostRight, localMidX, localMidY };
  };

  const getChildMidTop = (currentMidY: number): number => {
    return (
      currentMidY +
      defaultTreeConfig.ITEM_HEIGHT +
      defaultTreeConfig.ITEM_MARGIN_Y
    );
  };

  // useEffect
  useEffect(() => {
    if (!loading && !error) {
      console.log('Data loaded:', data?.people || []);
      setPeopleData(data?.people || []);
    }
  }, [personId, loading, error, data]);

  useEffect(() => {
    if (peopleData.length > 0) {
      setPersonDict(
        peopleData.reduce(
          (acc: { [id: number]: Person }, person: Person) => {
            acc[person.id] = person;
            return acc;
          },
          {} as { [id: number]: Person },
        ),
      );
    }
  }, [peopleData]);

  useEffect(() => {
    if (personDict[personId]) {
      setTreeItems([]);
      setTreeLines([]);
      generateTreeItem(
        personId,
        defaultTreeConfig.SUCCESSOR_DEPTH,
        defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH,
        defaultTreeConfig.ITEM_MARGIN_Y + defaultTreeConfig.ITEM_HEIGHT,
        treeItemPosition.CENTER,
        true,
        true,
        0,
      );
    }
  }, [personDict, personId]);

  return { treeItems, treeLines, loading, error, refetch };
};
