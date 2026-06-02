export const TargetType = {
  PHOTO: 'photo',
  VIDEO: 'video',
  MOMENT: 'moment',
} as const;

export type TargetType = (typeof TargetType)[keyof typeof TargetType];
