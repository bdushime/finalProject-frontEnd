import { EquipmentCategory } from "../enums/EquipmentCategort";

export const categoryColors = {
  [EquipmentCategory.LAPTOP]: 'bg-indigo-600/20 text-indigo-900 border border-indigo-600/30',
  [EquipmentCategory.DESKTOP]: 'bg-blue-600/20 text-blue-900 border border-blue-600/30',
  [EquipmentCategory.PRINTER]: 'bg-green-600/20 text-green-900 border border-green-600/30',
  [EquipmentCategory.SCANNER]: 'bg-yellow-600/20 text-yellow-900 border border-yellow-600/30',
  [EquipmentCategory.PROJECTOR]: 'bg-red-600/20 text-red-900 border border-red-600/30',
  [EquipmentCategory.OTHER]: 'bg-gray-600/20 text-gray-900 border border-gray-600/30',
};

