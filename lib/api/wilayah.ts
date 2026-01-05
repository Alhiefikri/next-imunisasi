// /lib/api-wilayah.ts
// Service khusus untuk API Anda
export interface WilayahItem {
  id: string;
  name: string;
}

export async function fetchDistricts(regencyId: string = "7202"): Promise<WilayahItem[]> {
  try {
    const res = await fetch(
      `https://alhiefikri.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`,
      { cache: 'force-cache' } // Data statis, cache selama build
    );
    
    if (!res.ok) throw new Error(`Failed to fetch districts: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}

export async function fetchVillages(districtId: string): Promise<WilayahItem[]> {
  if (!districtId) return [];
  
  try {
    const res = await fetch(
      `https://alhiefikri.github.io/api-wilayah-indonesia/api/villages/${districtId}.json`,
      { cache: 'force-cache' }
    );
    
    if (!res.ok) throw new Error(`Failed to fetch villages: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching villages:', error);
    return [];
  }
}