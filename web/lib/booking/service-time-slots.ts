export const SERVICE_TIME_SLOTS = [
  "08:00",
  "10:30",
  "13:00",
  "16:00",
  "18:30",
] as const;

export type ServiceTimeSlot = (typeof SERVICE_TIME_SLOTS)[number];

export const DEFAULT_SERVICE_TIME_SLOT: ServiceTimeSlot = SERVICE_TIME_SLOTS[0];

const SERVICE_TIME_SLOT_SET = new Set<string>(SERVICE_TIME_SLOTS);

export function isServiceTimeSlot(value: string): value is ServiceTimeSlot {
  return SERVICE_TIME_SLOT_SET.has(value);
}

export const SERVICE_SLOT_CAPACITY_BY_CODE: Record<string, number> = {
  conference_room_rental: 14,
  infused_drink_tasting: 20,
  local_culinary_experience: 24,
  scenic_drive_picnic: 6,
  stretch_think_workshop: 12,
  wellness_addons: 8,
};
