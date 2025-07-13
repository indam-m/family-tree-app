'use client';

import { useParams } from 'next/navigation';
import CreatePersonForm from '@/components/CreatePersonForm';

const PersonForm = () => {
  const { id } = useParams(); // Get the `id` from the route parameters
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return <div>Invalid ID</div>;
  }

  return (
    <div>
      <CreatePersonForm id={idNum} />
    </div>
  );
};

export default PersonForm;
