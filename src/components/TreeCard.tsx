import React from 'react';
import Image from 'next/image';
import { defaultTreeConfig, defaultImage, gender } from '@/constants/person';
import { TreeItem } from '@/types/tree';
import { format } from 'date-fns'; // Import the format function
import { PencilSquareIcon } from '@heroicons/react/24/solid';

const TreeCard: React.FC<TreeItem> = ({
  midXPosition = 50,
  midYPosition = 100,
  person,
  onEdit = () => {},
}): React.JSX.Element => {
  // Format the birthDate
  const formattedBirthDate = person.birthDate
    ? format(new Date(person.birthDate), 'dd MMMM yyyy') // Example: "January 1, 2000"
    : '-';

  let imageUrl = person.imageUrl;
  if (!imageUrl) {
    switch (person.gender) {
      case gender.MALE:
        imageUrl = defaultImage.MALE;
        break;
      case gender.FEMALE:
        imageUrl = defaultImage.FEMALE;
        break;
      default:
        imageUrl = defaultImage.OTHER;
        break;
    }
  }

  return (
    <div
      className={`group absolute justify-center grid shadow-2xl shadow-black/60 ${
        person.gender === gender.MALE
          ? 'bg-blue-400'
          : (person.gender === gender.FEMALE && 'bg-pink-400') || 'bg-white'
      } rounded-2xl w-50 h-80 transition hover:brightness-110 hover:shadow-black hover:shadow-3xl`}
      style={{
        left: `${midXPosition - defaultTreeConfig.ITEM_WIDTH / 2}px`,
        top: `${midYPosition - defaultTreeConfig.ITEM_HEIGHT / 2}px`,
        width: `${defaultTreeConfig.ITEM_WIDTH}px`,
        height: `${defaultTreeConfig.ITEM_HEIGHT}px`,
        minWidth: `${defaultTreeConfig.ITEM_WIDTH}px`,
        minHeight: `${defaultTreeConfig.ITEM_HEIGHT}px`,
        maxWidth: `${defaultTreeConfig.ITEM_WIDTH}px`,
        maxHeight: `${defaultTreeConfig.ITEM_HEIGHT}px`,
      }}
    >
      {/* Floating edit button, only visible on hover */}
      <button
        type="button"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-blue-500 text-blue-700 hover:text-white hover:cursor-pointer rounded-full p-2 shadow transition"
        aria-label="Edit"
        // onClick={...} // Add your edit handler here
      >
        <PencilSquareIcon className="w-5 h-5" onClick={onEdit} />
      </button>
      <div className="items-center rounded-t-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${person.firstName} ${person.lastName} photo`}
          width={defaultTreeConfig.ITEM_WIDTH}
          height={defaultTreeConfig.ITEM_WIDTH}
          className="object-cover"
        />
      </div>
      <div
        className="p-2 text-black items-center justify-center text-center"
        style={{ top: defaultTreeConfig.ITEM_WIDTH }}
      >
        <h3 className="text-md md:text-md font-bold">
          {person.firstName} {person.lastName}
        </h3>
        <p className="text-sm">{person.nickName}</p>
        <p className="text-sm text-yellow-800">
          {person.birthPlace}, {formattedBirthDate}
        </p>
      </div>
    </div>
  );
};

export default TreeCard;
