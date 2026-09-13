import { RegionSlug, REGIONS } from '@/lib/config';

export function matchRegionSlug(province?: string | null, region?: string | null): RegionSlug | null {
  const pStr = (province || '').toUpperCase().trim();
  const rStr = (region || '').toUpperCase().trim();

  // 1. Primary match using PROVINCE if present
  if (pStr) {
    // Check NTB first
    if (
      pStr.includes('BARAT') ||
      pStr.includes('NTB') ||
      pStr.includes('NUSA TENGGARA BARAT') ||
      pStr.includes('LOMBOK') ||
      pStr.includes('MATARAM') ||
      pStr.includes('SUMBAWA') ||
      pStr.includes('BIMA') ||
      pStr.includes('DOMPU')
    ) {
      return 'ntb';
    }

    // Check NTT
    if (
      pStr.includes('TIMUR') && (pStr.includes('NUSA') || pStr.includes('NTT')) ||
      pStr.includes('NTT') ||
      pStr.includes('NUSA TENGGARA TIMUR') ||
      pStr.includes('FLORES') ||
      pStr.includes('KUPANG') ||
      pStr.includes('TIMOR') ||
      pStr.includes('SUMBA') ||
      pStr.includes('ALOR') ||
      pStr.includes('LEMBATA') ||
      pStr.includes('ROTE') ||
      pStr.includes('ENDE') ||
      pStr.includes('SIKKA') ||
      pStr.includes('MANGGARAI')
    ) {
      return 'ntt';
    }

    // Check Jawa Timur
    if (
      pStr.includes('JAWA TIMUR') ||
      pStr.includes('JATIM') ||
      pStr.includes('SURABAYA') ||
      pStr.includes('MALANG') ||
      pStr.includes('SIDOARJO') ||
      pStr.includes('GRESIK') ||
      pStr.includes('JEMBER') ||
      pStr.includes('BANYUWANGI') ||
      pStr.includes('MADURA')
    ) {
      return 'jawa-timur';
    }

    // Check Bali
    if (
      (pStr.includes('BALI') && !pStr.includes('BALI NUSRA')) ||
      pStr.includes('DENPASAR') ||
      pStr.includes('BADUNG') ||
      pStr.includes('GIANYAR') ||
      pStr.includes('TABANAN') ||
      pStr.includes('BULELENG') ||
      pStr.includes('SINGARAJA') ||
      pStr.includes('BANGLI') ||
      pStr.includes('KLUNGKUNG') ||
      pStr.includes('JEMBRANA') ||
      pStr.includes('KARANGASEM')
    ) {
      return 'bali';
    }

    if (pStr === 'BALI' || pStr.startsWith('BALI ')) {
      return 'bali';
    }
  }

  // 2. Fallback to REGION if Province is empty or generic
  if (rStr) {
    if (rStr.includes('NTB') || rStr.includes('NUSA TENGGARA BARAT')) return 'ntb';
    if (rStr.includes('NTT') || rStr.includes('NUSA TENGGARA TIMUR')) return 'ntt';
    if (rStr.includes('JAWA TIMUR') || rStr.includes('JATIM')) return 'jawa-timur';
    if (rStr === 'BALI' || (rStr.includes('BALI') && !rStr.includes('BALI NUSRA'))) return 'bali';
  }

  // If Province is just "BALI NUSRA" without sub-province, fallback to bali or null
  if (pStr.includes('BALI')) return 'bali';

  return null;
}

export function getCanonicalRegionName(slug: RegionSlug): string {
  return REGIONS[slug]?.name || slug;
}

export function getCanonicalShortName(slug: RegionSlug): string {
  return REGIONS[slug]?.shortName || slug;
}
