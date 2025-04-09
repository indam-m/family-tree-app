import React from 'react';
import Image from 'next/image';
import { defaultTreeConfig, defaultImage, gender } from '@/constants/person';
import { TreeItem } from '@/types/tree';
import { format } from 'date-fns'; // Import the format function

const TreeCard: React.FC<TreeItem> = ({
  midXPosition = 50,
  midYPosition = 100,
  person,
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
      className={`group absolute justify-center grid shadow-amber-50 shadow-md ${
        person.gender === gender.MALE
          ? 'bg-blue-400'
          : (person.gender === gender.FEMALE && 'bg-pink-400') || 'bg-white'
      } rounded-2xl w-50 h-80`}
      style={{
        left: `${midXPosition - defaultTreeConfig.ITEM_WIDTH / 2}px`,
        top: `${midYPosition - defaultTreeConfig.ITEM_HEIGHT / 2}px`,
      }}
    >
      <div className="items-center min-h-50 max-h-50 rounded-t-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${person.firstName} ${person.lastName} photo`}
          width={200}
          height={200}
        />
      </div>
      <div className="p-2 text-black items-center">
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
