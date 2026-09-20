// Minimal RFC 4180 parser — handles quoted fields, embedded commas, and
// doubled-quote escaping (""). Good enough for our two well-formed source
// files; no external dependency needed.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\r') {
      // skip — \n handles the row break
    } else if (c === '\n') {
      row.push(field); field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

// "a|b|c" -> ["a","b","c"]; "" or missing -> []
export function splitPipeList(value: string | undefined): string[] {
  if (!value) return []
  return value.split('|').map(s => s.trim()).filter(Boolean)
}
