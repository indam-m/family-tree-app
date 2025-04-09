'use client';

import { useEffect, useState } from 'react';
import { gender } from '@/constants/person';
import {
  useGetPersonById,
  useCreatePerson,
  useUpdatePerson,
} from '@/hooks/usePerson';
import { Person } from '@/types/tree';
import PersonAutocomplete from '@/components/PersonAutoComplete';

const defaultForm = {
  firstName: '',
  lastName: '',
  nickName: '',
  gender: '',
  birthDate: '',
  birthPlace: '',
  isDeceased: false,
  deathDate: '',
  deathPlace: '',
  imageUrl: '',
  notes: '',
  createdBy: 'admin',
  updatedBy: 'admin',
};

export default function CreatePersonForm({ id }: { id: number }) {
  const {
    data,
    loading: getLoading,
    error: getError,
  } = useGetPersonById({
    variables: { id }, // Pass the id as a variable to fetch the person
    skip: !id, // Skip the query if id is not provided
  });

  const [createPerson, createState] = useCreatePerson();
  const [updatePerson, updateState] = useUpdatePerson();
  const [parentOneId, setParentOneId] = useState<number | null>(null);
  const [parentTwoId, setParentTwoId] = useState<number | null>(null);

  const [form, setForm] = useState({
    ...defaultForm,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const input = {
        ...form,
        birthDate: form.birthDate
          ? new Date(form.birthDate).toISOString()
          : null,
        birthPlace: form.birthPlace || null,
        deathDate: form.deathDate
          ? new Date(form.deathDate).toISOString()
          : null,
        deathPlace: form.deathPlace || null,
        imageUrl: form.imageUrl || null,
        notes: form.notes || null,
      };
      if (!id) {
        await createPerson({
          variables: input,
        });
      } else {
        await updatePerson({
          variables: {
            id,
            input,
          },
        });
      }

      alert('🎉 Person created!');
      setForm({
        ...defaultForm,
      });
    } catch (err) {
      console.error('Mutation error:', err);
    }
  };

  const loading = getLoading || createState.loading || updateState.loading;
  const error = getError || createState.error || updateState.error;

  useEffect(() => {
    if (id && data && !getLoading && !getError) {
      const person: Person = data.person;
      const birthDate = person.birthDate
        ? new Date(person.birthDate).toISOString().split('T')[0]
        : '';
      const deathDate = person.deathDate
        ? new Date(person.deathDate).toISOString().split('T')[0]
        : '';
      setForm({
        firstName: person.firstName,
        lastName: person.lastName,
        nickName: person.nickName,
        gender: person.gender,
        birthDate,
        birthPlace: person.birthPlace,
        isDeceased: person.isDeceased,
        deathDate,
        deathPlace: person.deathPlace || '',
        imageUrl: person.imageUrl || '',
        notes: person.notes || '',
        createdBy: person.createdBy,
        updatedBy: person.updatedBy,
      });
    }
  }, [id, data, getLoading, getError]);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto mt-10 bg-white shadow-xl p-6 rounded-2xl space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">
        {id ? 'Update Person' : 'Create New Person'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Nickname
        </label>
        <input
          name="nickName"
          value={form.nickName}
          onChange={handleChange}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Gender
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
          required
        >
          <option value="">Select gender</option>
          <option value={gender.MALE}>Male</option>
          <option value={gender.FEMALE}>Female</option>
          <option value={gender.OTHER}>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Birth Date
        </label>
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={handleChange}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Birth Place
        </label>
        <input
          name="birthPlace"
          value={form.birthPlace}
          onChange={handleChange}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Is Deceased
        </label>
        <input
          type="checkbox"
          name="isDeceased"
          checked={form.isDeceased}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              isDeceased: e.target.checked,
              ...(!e.target.checked && {
                deathDate: '',
                deathPlace: '',
              }),
            }))
          }
          className="w-5 h-5 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {form.isDeceased && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Death Date
            </label>
            <input
              type="date"
              name="deathDate"
              value={form.deathDate}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Death Place
            </label>
            <input
              name="deathPlace"
              value={form.deathPlace}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Image URL
        </label>
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Parent One</label>
        <PersonAutocomplete
          onSelect={(person) => setParentOneId(person.id)}
          placeholder="Search parent one..."
          excludeIds={(id ? [id] : []).concat(parentTwoId ? [parentTwoId] : [])}
        />

        <p className="text-sm text-gray-500">Selected ID: {parentOneId}</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Parent Two</label>
        <PersonAutocomplete
          onSelect={(person) => setParentTwoId(person.id)}
          placeholder="Search parent two..."
          excludeIds={(id ? [id] : []).concat(parentOneId ? [parentOneId] : [])}
        />

        <p className="text-sm text-gray-500">Selected ID: {parentTwoId}</p>
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition duration-200 shadow-lg hover:cursor-pointer"
      >
        {loading
          ? id
            ? 'Updating...'
            : 'Creating...'
          : id
            ? 'Update Person'
            : 'Create Person'}
      </button>

      {error && <p className="text-red-500 text-sm">⚠️ {error.message}</p>}
    </form>
  );
}
