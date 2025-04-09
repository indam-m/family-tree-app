import { useRouter } from 'next/router';
import CreatePersonForm from '@/components/CreatePersonForm';

const PersonForm = () => {
  const router = useRouter();
  const { id } = router.query;
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
