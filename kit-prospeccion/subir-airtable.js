const fs = require('fs');
const token = process.env.AIRTABLE_TOKEN;
const BASE_ID = 'appuhtI4ybSBeJRb4';
const TABLE_NAME = 'Leads';
const data = JSON.parse(fs.readFileSync('prospectos-clinicas-granada.json', 'utf8'));
async function subirProspecto(p) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { 'Nombre': p.nombre, 'Web': p.web, 'Email': p.email || '', 'Teléfono': p.telefono?.[0] || '', 'Oportunidad': p.oportunidad, 'Carencias': p.carencias.join(', ') } })
  });
  const r = await res.json();
  console.log(r.id ? `✓ ${p.nombre}` : `✗ ${p.nombre}: ${JSON.stringify(r)}`);
}
async function main() { for (const p of data.prospectos) { await subirProspecto(p); await new Promise(r => setTimeout(r, 300)); } console.log('Listo.'); }
main();
