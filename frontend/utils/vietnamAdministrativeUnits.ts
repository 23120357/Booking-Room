import rawUnits from '@/data/vietnamAdministrativeUnits.json';

export interface WardUnit {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

export interface DistrictUnit {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards: WardUnit[];
}

export interface ProvinceUnit {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  phone_code: number;
  districts: DistrictUnit[];
}

export const vietnamAdministrativeUnits = rawUnits as ProvinceUnit[];

const ADMIN_PREFIXES = [
  'thanh pho',
  'tp',
  'tinh',
  'quan',
  'huyen',
  'thi xa',
  'thi tran',
  'phuong',
  'xa',
];

export function normalizeAdminName(value: string): string {
  let normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const prefix of ADMIN_PREFIXES) {
    if (normalized === prefix) return normalized;
    if (normalized.startsWith(`${prefix} `)) {
      normalized = normalized.slice(prefix.length + 1).trim();
      break;
    }
  }

  return normalized;
}

function namesMatch(left: string, right: string): boolean {
  const a = normalizeAdminName(left);
  const b = normalizeAdminName(right);
  return a === b || a.includes(b) || b.includes(a);
}

export function findProvinceByName(name: string): ProvinceUnit | null {
  if (!name) return null;
  return vietnamAdministrativeUnits.find((province) => namesMatch(province.name, name)) || null;
}

export function findDistrictByName(province: ProvinceUnit | null, name: string): DistrictUnit | null {
  if (!province || !name) return null;
  return province.districts.find((district) => namesMatch(district.name, name)) || null;
}

export function findWardByName(district: DistrictUnit | null, name: string): WardUnit | null {
  if (!district || !name) return null;
  return district.wards.find((ward) => namesMatch(ward.name, name)) || null;
}

export function getProvinceName(code: string): string {
  return vietnamAdministrativeUnits.find((province) => String(province.code) === code)?.name || '';
}

export function getDistrictName(provinceCode: string, districtCode: string): string {
  const province = vietnamAdministrativeUnits.find((item) => String(item.code) === provinceCode);
  return province?.districts.find((district) => String(district.code) === districtCode)?.name || '';
}

export function getWardName(provinceCode: string, districtCode: string, wardCode: string): string {
  const province = vietnamAdministrativeUnits.find((item) => String(item.code) === provinceCode);
  const district = province?.districts.find((item) => String(item.code) === districtCode);
  return district?.wards.find((ward) => String(ward.code) === wardCode)?.name || '';
}
