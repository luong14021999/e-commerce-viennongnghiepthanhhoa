/** Strip Vietnamese diacritics so searches like "lua" match "lúa", "lùa", "lũa", etc. */
export function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
