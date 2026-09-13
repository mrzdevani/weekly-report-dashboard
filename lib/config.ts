// Central Configuration File

export const HIGH_UTILIZATION_THRESHOLD = 80;
export const WARNING_UTILIZATION_THRESHOLD = 70;

export type RegionSlug = 'overview' | 'bali' | 'ntb' | 'ntt' | 'jawa-timur';

export interface RegionInfo {
  slug: RegionSlug;
  name: string;
  shortName: string;
  aliases: string[];
  description: string;
}

export const REGIONS: Record<string, RegionInfo> = {
  overview: {
    slug: 'overview',
    name: 'All Regions (Overview)',
    shortName: 'Overview',
    aliases: ['ALL', 'SEMUA', 'NATIONAL', 'BALI NUSRA'],
    description: 'Seluruh region dan klaster microwave link',
  },
  bali: {
    slug: 'bali',
    name: 'Bali',
    shortName: 'Bali',
    aliases: ['BALI', 'DENPASAR', 'BADUNG', 'GIANYAR', 'TABANAN', 'BULELENG', 'BANGLI', 'KLUNGKUNG', 'JEMBRANA', 'KARANGASEM'],
    description: 'Provinsi Bali',
  },
  ntb: {
    slug: 'ntb',
    name: 'Nusa Tenggara Barat',
    shortName: 'NTB',
    aliases: ['NUSA TENGGARA BARAT', 'NTB', 'LOMBOK', 'MATARAM', 'SUMBAWA', 'BIMA', 'DOMPU'],
    description: 'Provinsi Nusa Tenggara Barat',
  },
  ntt: {
    slug: 'ntt',
    name: 'Nusa Tenggara Timur',
    shortName: 'NTT',
    aliases: ['NUSA TENGGARA TIMUR', 'NTT', 'KUPANG', 'FLORES', 'TIMOR', 'SUMBA', 'ALOR', 'LEMBATA', 'ROTE', 'ENDE', 'MANGGARAI', 'SIKKA'],
    description: 'Provinsi Nusa Tenggara Timur',
  },
  'jawa-timur': {
    slug: 'jawa-timur',
    name: 'Jawa Timur',
    shortName: 'Jawa Timur',
    aliases: ['JAWA TIMUR', 'JATIM', 'SURABAYA', 'MALANG', 'SIDOARJO', 'GRESIK', 'KEDIRI', 'JEMBER', 'BANYUWANGI', 'MADIUN', 'MADURA'],
    description: 'Provinsi Jawa Timur',
  },
};

export type UtilizationStatus = 'High' | 'Warning' | 'Normal' | 'Unknown';

export function getUtilizationStatus(
  val: number | null | undefined,
  levelStr?: string | null
): UtilizationStatus {
  if (typeof val === 'number' && !isNaN(val)) {
    if (val >= HIGH_UTILIZATION_THRESHOLD) return 'High';
    if (val >= WARNING_UTILIZATION_THRESHOLD) return 'Warning';
    return 'Normal';
  }
  
  if (levelStr) {
    const l = levelStr.toLowerCase().trim();
    if (l.includes('high') || l.includes('critical')) return 'High';
    if (l.includes('medium')) return 'Warning';
    if (l.includes('low')) return 'Normal';
  }

  return 'Unknown';
}
