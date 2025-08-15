import dayjs from 'dayjs';

// Get key from a date as "YYYY-ww"
export function toWeekKey(dateString: string): string {
    const year = dayjs(dateString).year()
    const weekNo = dayjs(dateString).isoWeek()
    return `${year}-W${String(weekNo).padStart(2, '0')}`
}

// Get date of monday of the week in weekKey
export function weekKeyToMonday(weekKey: string): Date {
    const m = weekKey.split('-')
    if (!m || m.length !== 2) throw new Error('Bad weekKey: ' + weekKey)

    const yearFirstJan = m[0] + '-01-01'
    const week = parseInt(m[1].substring(1)) - 1
    const day = dayjs(yearFirstJan).add(week, 'week').startOf('isoWeek').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).toDate()

    return day
}

// Return start and end date display for a weekKey
export function formatWeekRangeDisplay(weekKey: string): string {
    const start = weekKeyToMonday(weekKey)
    const end = dayjs(start).add(6, 'day').toDate()

    const monthName = (d: Date) => d.toLocaleString('en', { month: 'long' })

    const dayjsStart = dayjs(start).format('MMMM, D')

    const startMonth = monthName(start)
    const endMonth = monthName(end)

    const dayjsEnd = startMonth !== endMonth ? dayjs(end).format('MMMM, D') : dayjs(end).format('D')

    const display = `${dayjsStart} - ${dayjsEnd}`

    return display
}

// sort week keys by time
export function sortWeekKeysAsc(keys: string[]) {
    return [...keys].sort((a, b) => weekKeyToMonday(a).getTime() - weekKeyToMonday(b).getTime())
}
