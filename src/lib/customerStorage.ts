export interface SavedCustomerData {
  name: string;
  phone: string;
  cpf: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
}

const STORAGE_KEY = "doce_encanto_customer";

export function saveCustomerData(data: SavedCustomerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

export function getCustomerData(): SavedCustomerData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCustomerData;
  } catch {
    return null;
  }
}

export function findCustomerByIdentifier(identifier: string): SavedCustomerData | null {
  const saved = getCustomerData();
  if (!saved) return null;

  const clean = identifier.replace(/\D/g, "");
  const savedPhone = saved.phone.replace(/\D/g, "");
  const savedCpf = saved.cpf.replace(/\D/g, "");

  if (clean && (clean === savedPhone || clean === savedCpf)) {
    return saved;
  }
  return null;
}
