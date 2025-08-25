'use client';

import { useEffect, useState } from 'react';
import { gender } from '@/constants/person';
import {
  useGetPersonById,
  useCreatePerson,
  useUpdatePerson,
} from '@/hooks/usePerson';
import { useUpsertRelationships } from '@/hooks/useRelationship';
import { Person } from '@/types/tree';
import PersonAutocomplete from '@/components/PersonAutoComplete';
import { PartnerForm } from '@/types/form';

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

const defaultPartnerForm: PartnerForm = {
  id: null,
  search: '',
  isMarried: false,
  isDivorced: false,
  isSeparated: false,
  isEngaged: false,
  isCohabitated: false,
  isTogether: false,
  marriageDate: '',
  marriagePlace: '',
  divorcedDate: '',
  divorcedPlace: '',
  engagementDate: '',
  engagementPlace: '',
  cohabitationDate: '',
  cohabitationPlace: '',
  togetherDate: '',
  togetherPlace: '',
  notes: '',
};

export default function CreatePersonForm({
  id,
  onSubmit,
  onClose,
}: {
  id?: number;
  onSubmit?: (person: Person) => void;
  onClose?: () => void;
}) {
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
  const [upsertRelationships, upsertRelationshipsState] =
    useUpsertRelationships();
  const [parentOneId, setParentOneId] = useState<number | null>(null);
  const [parentTwoId, setParentTwoId] = useState<number | null>(null);
  const [partnerForms, setPartnerForms] = useState<PartnerForm[]>([
    { ...defaultPartnerForm },
  ]);

  const [form, setForm] = useState({
    ...defaultForm,
  });

  const handleInputChange = (
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
        parentOneId: parentOneId || null,
        parentTwoId: parentTwoId || null,
      };
      let thePerson = {} as Person;
      if (!id) {
        const createResult = await createPerson({
          variables: input,
        });
        thePerson = createResult.data?.createPerson as Person;
      } else {
        const updateResult = await updatePerson({
          variables: {
            ...input,
            id,
          },
        });
        thePerson = updateResult.data?.updatePerson as Person;
      }

      const newRelationshipInputs = partnerForms
        .filter((partner) => partner.id !== null)
        .map((partner) => ({
          personOneId: id || thePerson.id,
          personTwoId: partner.id,
          isMarried: partner.isMarried,
          isDivorced: partner.isDivorced,
          isSeparated: partner.isSeparated,
          isEngaged: partner.isEngaged,
          isCohabitated: partner.isCohabitated,
          isTogether: partner.isTogether,
          marriageDate: partner.marriageDate || null,
          marriagePlace: partner.marriagePlace || null,
          divorcedDate: partner.divorcedDate || null,
          divorcedPlace: partner.divorcedPlace || null,
          engagementDate: partner.engagementDate || null,
          engagementPlace: partner.engagementPlace || null,
          cohabitationDate: partner.cohabitationDate || null,
          cohabitationPlace: partner.cohabitationPlace || null,
          togetherDate: partner.togetherDate || null,
          togetherPlace: partner.togetherPlace || null,
        }));

      if (newRelationshipInputs.length > 0) {
        await upsertRelationships({
          variables: {
            relationships: newRelationshipInputs,
          },
        });
      }

      alert(`🎉 Person ${id ? 'updated' : 'created'}!`);
      if (onSubmit) {
        onSubmit(thePerson);
      }
      if (!id) {
        // Reset form if creating a new person
        setForm({ ...defaultForm });
        setParentOneId(null);
        setParentTwoId(null);
        setPartnerForms([{ ...defaultPartnerForm }]);
      }
    } catch (err) {
      console.error('Mutation error:', err);
    }
  };

  const handleAddPartner = () => {
    setPartnerForms((prev) => [...prev, { ...defaultPartnerForm }]);
  };

  const handleRemovePartner = (index: number) => {
    setPartnerForms((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePartnerChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { value, name } = e.target;
    const { checked } = e.target as HTMLInputElement;
    setPartnerForms((prev) =>
      prev.map((partner, i) =>
        i === index
          ? {
              ...partner,
              [name]: [
                'isMarried',
                'isDivorced',
                'isEngaged',
                'isCohabitated',
                'isTogether',
              ].includes(name)
                ? checked
                : value,
              ...(name === 'isMarried' &&
                !checked && {
                  marriageDate: '',
                  marriagePlace: '',
                }),
              ...(name === 'isDivorced' &&
                !checked && {
                  divorcedDate: '',
                  divorcedPlace: '',
                }),
              ...(name === 'isEngaged' &&
                !checked && {
                  engagementDate: '',
                  engagementPlace: '',
                }),
              ...(name === 'isCohabitated' &&
                !checked && {
                  cohabitationDate: '',
                  cohabitationPlace: '',
                }),
              ...(name === 'isTogether' &&
                !checked && {
                  togetherDate: '',
                  togetherPlace: '',
                }),
            }
          : partner,
      ),
    );
  };

  const loading =
    getLoading ||
    createState.loading ||
    updateState.loading ||
    upsertRelationshipsState.loading;
  const error =
    getError ||
    createState.error ||
    updateState.error ||
    upsertRelationshipsState.error;

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
      if (person.parentChildRelations?.length) {
        const parentOneId = person.parentChildRelations[0].parentOneId;
        const parentTwoId = person.parentChildRelations[0].parentTwoId;
        setParentOneId(parentOneId || null);
        setParentTwoId(parentTwoId || null);
      }
      const relationships = (person.relationshipsAsPersonOne || []).concat(
        person.relationshipsAsPersonTwo || [],
      );
      if (relationships.length) {
        setPartnerForms(
          relationships.map((relationshipItem) => ({
            id:
              relationshipItem.personOneId === id
                ? relationshipItem.personTwoId
                : relationshipItem.personOneId,
            search:
              relationshipItem.personOneId === id
                ? `${relationshipItem.personTwo?.firstName}${relationshipItem.personTwo?.lastName ? ' ' + relationshipItem.personTwo?.lastName : ''}`
                : `${relationshipItem.personOne?.firstName}${relationshipItem.personOne?.lastName ? ' ' + relationshipItem.personOne?.lastName : ''}`,
            isMarried: relationshipItem.isMarried,
            isDivorced: relationshipItem.isDivorced,
            isSeparated: relationshipItem.isSeparated,
            isEngaged: relationshipItem.isEngaged,
            isCohabitated: relationshipItem.isCohabitated,
            isTogether: relationshipItem.isTogether,
            marriageDate: relationshipItem.marriageDate || '',
            marriagePlace: relationshipItem.marriagePlace || '',
            divorcedDate: relationshipItem.divorcedDate || '',
            divorcedPlace: relationshipItem.divorcedPlace || '',
            engagementDate: relationshipItem.engagementDate || '',
            engagementPlace: relationshipItem.engagementPlace || '',
            cohabitationDate: relationshipItem.cohabitationDate || '',
            cohabitationPlace: relationshipItem.cohabitationPlace || '',
            togetherDate: relationshipItem.togetherDate || '',
            togetherPlace: relationshipItem.togetherPlace || '',
            notes: relationshipItem.notes || '',
          })),
        );
      } else {
        setPartnerForms([{ ...defaultPartnerForm }]);
      }
    } else if (!id) {
      // Reset form for create
      setForm({ ...defaultForm });
    }
  }, [id, data, getLoading, getError]);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto mt-10 bg-white text-black shadow-xl p-6 rounded-2xl space-y-6 relative max-h-[80vh] overflow-y-auto"
    >
      {onClose && (
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      )}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          selectedPersonId={parentOneId || 0} // Pass selected person ID to avoid conflicts
        />

        <p className="text-sm text-gray-500">Selected ID: {parentOneId}</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Parent Two</label>
        <PersonAutocomplete
          onSelect={(person) => setParentTwoId(person.id)}
          placeholder="Search parent two..."
          excludeIds={(id ? [id] : []).concat(parentOneId ? [parentOneId] : [])}
          selectedPersonId={parentTwoId || 0} // Pass selected person ID to avoid conflicts
        />

        <p className="text-sm text-gray-500">Selected ID: {parentTwoId}</p>
      </div>

      {partnerForms.map((partnerForm, index) => (
        <div key={index} className="border p-4 rounded-lg shadow-md">
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Partner {index + 1}
            </label>
            <PersonAutocomplete
              onSelect={(person) => {
                setPartnerForms((prevData) =>
                  prevData.map((partner, i) =>
                    i === index
                      ? {
                          ...partner,
                          id: person.id,
                        }
                      : partner,
                  ),
                );
              }}
              placeholder="Search partner..."
              excludeIds={(id ? [id] : []).concat(
                partnerForm.id ? [partnerForm.id] : [],
              )}
              selectedPersonId={partnerForm.id || 0}
            />
            <p className="text-sm text-gray-500">
              Selected ID: {partnerForm.id}
            </p>
          </div>
          {/* Marriage section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Is Married
            </label>
            <input
              type="checkbox"
              name="isMarried"
              checked={partnerForm.isMarried ?? false}
              onChange={(e) => handlePartnerChange(index, e)}
              className="w-5 h-5 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {partnerForm.isMarried && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Marriage Date
                </label>
                <input
                  type="date"
                  name="marriageDate"
                  value={partnerForm.marriageDate ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Marriage Place
                </label>
                <input
                  name="marriagePlace"
                  value={partnerForm.marriagePlace ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
            </>
          )}
          {/* Divorce section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Is Divorced
            </label>
            <input
              type="checkbox"
              name="isDivorced"
              checked={partnerForm.isDivorced ?? false}
              onChange={(e) => handlePartnerChange(index, e)}
              className="w-5 h-5 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {partnerForm.isDivorced && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Divorced Date
                </label>
                <input
                  type="date"
                  name="divorcedDate"
                  value={partnerForm.divorcedDate ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Divorced Place
                </label>
                <input
                  name="divorcedPlace"
                  value={partnerForm.divorcedPlace ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
            </>
          )}
          {/* Engagement section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Is Engaged
            </label>
            <input
              type="checkbox"
              name="isEngaged"
              checked={partnerForm.isEngaged ?? false}
              onChange={(e) => handlePartnerChange(index, e)}
              className="w-5 h-5 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {partnerForm.isEngaged && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Engagement Date
                </label>
                <input
                  type="date"
                  name="engagementDate"
                  value={partnerForm.engagementDate ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Engagement Place
                </label>
                <input
                  name="engagementPlace"
                  value={partnerForm.engagementPlace ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
            </>
          )}
          {/* Cohabitation section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Is Cohabitated
            </label>
            <input
              type="checkbox"
              name="isCohabitated"
              checked={partnerForm.isCohabitated ?? false}
              onChange={(e) => handlePartnerChange(index, e)}
              className="w-5 h-5 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {partnerForm.isCohabitated && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Cohabitation Date
                </label>
                <input
                  type="date"
                  name="cohabitationDate"
                  value={partnerForm.cohabitationDate ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Cohabitation Place
                </label>
                <input
                  name="cohabitationPlace"
                  value={partnerForm.cohabitationPlace ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
            </>
          )}
          {/* Together section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Is Together
            </label>
            <input
              type="checkbox"
              name="isTogether"
              checked={partnerForm.isTogether ?? false}
              onChange={(e) => handlePartnerChange(index, e)}
              className="w-5 h-5 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {partnerForm.isTogether && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Together Date
                </label>
                <input
                  type="date"
                  name="togetherDate"
                  value={partnerForm.togetherDate ?? ''}
                  onChange={(e) =>
                    setPartnerForms((prev) =>
                      prev.map((partner, i) =>
                        i === index
                          ? { ...partner, togetherDate: e.target.value }
                          : partner,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Together Place
                </label>
                <input
                  name="togetherPlace"
                  value={partnerForm.togetherPlace ?? ''}
                  onChange={(e) => handlePartnerChange(index, e)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
                />
              </div>
            </>
          )}
          {/* Notes section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Partner {index + 1} Notes
            </label>
            <textarea
              name="notes"
              value={partnerForm.notes ?? ''}
              onChange={(e) => handlePartnerChange(index, e)}
              rows={3}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            />
          </div>
          {/* Remove partner button */}
          <button
            type="button"
            onClick={() => handleRemovePartner(index)}
            className="text-red-500 hover:underline"
          ></button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddPartner}
        className={
          partnerForms[partnerForms.length - 1].id !== null
            ? `text-blue-500 hover:underline hover:cursor-pointer`
            : `text-gray-500 cursor-not-allowed`
        }
        disabled={partnerForms[partnerForms.length - 1].id === null}
      >
        Add Partner
      </button>

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
