'use client';

import { useParams } from 'next/navigation';
import CreatePersonForm from '@/components/CreatePersonForm';

const PersonForm = () => {
  const params = useParams(); // Get the route parameters
  const id = params?.id;
  const idNum =
    typeof id === 'string'
      ? Number(id)
      : Array.isArray(id)
        ? Number(id[0])
        : NaN;

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
