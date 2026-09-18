/** Minimal CSV parser — handles quoted fields (incl. escaped "" and embedded commas). No external dependency needed for a simple contacts export. */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  const parseLine = (line: string): string[] => {
    const cells: string[] = []
    let cur = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          cur += ch
        }
      } else if (ch === '"') {
        inQuotes = true
      } else if (ch === ",") {
        cells.push(cur)
        cur = ""
      } else {
        cur += ch
      }
    }
    cells.push(cur)
    return cells.map((c) => c.trim())
  }

  const [headerLine, ...rest] = lines
  return { headers: parseLine(headerLine), rows: rest.map(parseLine) }
}
