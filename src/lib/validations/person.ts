import { z } from 'zod';
import { gender } from '@/constants/person';

export const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  nickName: z.string().min(1, 'Nickname is required'),
  gender: z.enum([gender.FEMALE, gender.MALE, gender.OTHER]),
  birthDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
  birthPlace: z.string().optional(),
  deathDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
  deathPlace: z.string().optional(),
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const UpdatePersonSchema = CreatePersonSchema.extend({
  id: z.number(),
});

export type CreatePersonInput = z.infer<typeof CreatePersonSchema>;
