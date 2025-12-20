import Papa from 'papaparse'

export function parseCsvText(text: string): string[][] {
    const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true })
    if (result.errors.length > 0) {
        throw new Error(result.errors[0].message)
    }
    return result.data
}
