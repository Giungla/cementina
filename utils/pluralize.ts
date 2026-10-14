
export function pluralize (count: number, singular: string, plural: string): string {
  const rule = new Intl.PluralRules('en-US').select(count)

  return rule === 'one'
    ? singular
    : plural
}
