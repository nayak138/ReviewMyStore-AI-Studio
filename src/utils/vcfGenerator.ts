import { Store } from '../types';

export function generateVCard(store: Store): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${store.name}`,
    `ORG:${store.name}`,
    `TITLE:${store.category}`,
    `TEL;TYPE=WORK,VOICE:${store.phone}`,
    store.email ? `EMAIL;TYPE=PREF,INTERNET:${store.email}` : '',
    store.website ? `URL:${store.website}` : '',
    `ADR;TYPE=WORK:;;${store.address};${store.locality};;;`,
    `NOTE:${store.tagline || 'Thank you for visiting! Review us on Google: ' + store.googleReviewUrl}`,
    'END:VCARD'
  ].filter(Boolean);

  return lines.join('\r\n');
}

export function downloadVCard(store: Store): void {
  const vcfContent = generateVCard(store);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_Contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
