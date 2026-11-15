import { describe, it, expect } from '@jest/globals'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

// Bounded execution makes a regression fail rather than hanging the test worker.
// Transpile only this pure helper; do not load framework/env/provider modules.
const source = fs.readFileSync(path.join(__dirname, '../src/lib/date-range.ts'), 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const seconds = (year: number, month: number, day: number) => new Date(year, month, day).getTime() / 1000
const fixtures: [number, number, 'month' | 'year', number][] = [
  [seconds(2020, 0, 5), seconds(2020, 0, 9), 'month', 1],
  [seconds(2020, 0, 1), seconds(2020, 1, 1), 'month', 1],
  [seconds(2020, 0, 15), seconds(2020, 2, 5), 'month', 3],
  [seconds(2019, 11, 20), seconds(2021, 0, 5), 'year', 3],
  [seconds(2020, 1, 29), seconds(2020, 1, 29), 'month', 1],
  [seconds(2020, 0, 9), seconds(2020, 0, 5), 'month', 0],
]

describe('splitDateRange termination and bounds', () => {
  it.each(fixtures)('splits %i to %i by %s into %i chunks', (start, end, size, count) => {
    const range = { start, end, year: 2020, display: 'Synthetic', queryType: 'custom-range' }
    const chunks = vm.runInNewContext(`${code}\nexports.splitDateRange(range, size)`,
      { exports: {}, range, size }, { timeout: 1000 }) as { start: number; end: number }[]
    expect(chunks).toHaveLength(count)
    if (!count) return
    expect(chunks[0]?.start).toBe(start)
    expect(chunks[chunks.length - 1]?.end).toBe(end)
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i]!.start).toBe(chunks[i - 1]!.end)
      expect(chunks[i]!.end).toBeGreaterThan(chunks[i]!.start)
    }
  })
})
