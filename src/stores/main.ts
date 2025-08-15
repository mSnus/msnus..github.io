import dayjs from 'dayjs';
import { defineStore } from 'pinia'
import { toWeekKey, formatWeekRangeDisplay, sortWeekKeysAsc } from '@/weekKey'
import { Station, RawStation, NormalizedBooking, BookingsByWeek } from '@/types/booking'

const CACHE_TTL_MS = import.meta.env.VITE_CACHE_TTL_MS ? parseInt(import.meta.env.VITE_CACHE_TTL_MS) : 60 * 1000 // default 1 minute

function cacheKey(startDate: string) {
  return `stations?startDate=${startDate}`
}

function getCached(startDate: string): RawStation[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(startDate))
    if (!raw) return null

    const { value, ts } = JSON.parse(raw) as { value: RawStation[]; ts: number }
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return value

  } catch {
    console.warn('Failed to parse cached data')
    return null
  }
}

function setCached(startDate: string, value: RawStation[]) {
  try {
    localStorage.setItem(cacheKey(startDate), JSON.stringify({ value, ts: Date.now() }))
  } catch {
    console.warn('Failed to cache data')
  }
}

export const useDataStore = defineStore('data', {
  state: () => ({
    stations: [] as Station[],
    bookingsByWeek: {} as BookingsByWeek,
    loading: true,
    error: null as null | string,
    selectedWeek: null as string | null, // in weekKey format
    selectedStation: '' as string,
    eventSelectedStationCleared: false,
  }),

  getters: {
    allBookings: (state) => {
      return Object.values(state.bookingsByWeek).flat()
    },    
    weekKeysAsc: (state) => sortWeekKeysAsc(Object.keys(state.bookingsByWeek)),
    weekDisplayMap: (state) => {
      const map: Record<string, string> = {}
      for (const k of Object.keys(state.bookingsByWeek)) {
        map[k] = formatWeekRangeDisplay(k)
      }
      return map
    },

    bookingsForSelectedWeek: (state) => {
      if (!state.selectedWeek) return []
      return state.bookingsByWeek[state.selectedWeek] ?? []
    },

    selectedWeekIndex: (state) => {
      const keys = sortWeekKeysAsc(Object.keys(state.bookingsByWeek))
      return state.selectedWeek ? keys.indexOf(state.selectedWeek) : -1
    }
  },

  actions: {
    async load(startDate: string) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchDataCached(startDate)

        // flatten bookings with station info, fill stations
        const allBookings: NormalizedBooking[] = []
        const allStations: Station[] = []

        for (const record of data) {
          // normalize station info
          let stationId = parseInt(record.id)
          let stationName = record.name.trim()
          if (stationId > 0
            && (stationName !== '')
            && !allStations.find(s => s.id === stationId.toString())
          ) {
            allStations.push({
              id: stationId.toString(),
              name: allStations.find(s => s.name === stationName) ? stationName + ` (#${record.id})` : stationName
            })
          }
        }

        for (const record of data) {
          for (const b of record.bookings ?? []) {
            const start = new Date(b.startDate)
            const end = new Date(b.endDate)

            const dayjsStart = dayjs(b.startDate)
            const dayjsEnd = dayjs(b.endDate)

            if (isNaN(start.getTime())) {
              console.warn(`Invalid startDate for booking ${b.id} at station ${record.name}: ${b.startDate}`)
              continue
            }

            if (isNaN(end.getTime())) {
              console.warn(`Invalid endDate for booking ${b.id} at station ${record.name}: ${b.endDate}`)
              continue
            }

            const stationName = allStations.find(s => s.id === record.id)?.name ?? '#' + record.id

            //pick-up
            allBookings.push({
              id: b.id,
              stationId: record.id,
              stationName: stationName,
              customerName: b.customerName,
              bookDate: start,
              isPickup: true,
              weekKey: toWeekKey(b.startDate),
              dayNumber: dayjsStart.isoWeekday(),
              dayName: dayjsStart.format('ddd'),
              dayDisplay: dayjsStart.format('MMM, D'),
              bookTime: dayjsStart.format('HH:mm'),
              pickupDate: start,
              returnDate: end
            })

            //return
            allBookings.push({
              id: b.id,
              stationId: record.id,
              stationName: stationName,
              customerName: b.customerName,
              bookDate: end,
              isPickup: false,
              weekKey: toWeekKey(b.endDate),
              dayNumber: dayjsEnd.isoWeekday(),
              dayName: dayjsEnd.format('ddd'),
              dayDisplay: dayjsEnd.format('MMM, D'),
              bookTime: dayjsEnd.format('HH:mm'),
              pickupDate: start,
              returnDate: end
            })
          }
        }

        // group by weekKey and sort each by endDate
        const grouped: BookingsByWeek = {}

        for (const bk of allBookings) {
          if (!grouped[bk.weekKey]) grouped[bk.weekKey] = []
          grouped[bk.weekKey].push(bk)
        }

        for (const key of Object.keys(grouped)) {
          grouped[key].sort((a, b) => a.bookDate.getTime() - b.bookDate.getTime())
        }

        this.bookingsByWeek = grouped
        this.stations = allStations

        // if no week is selected, set to earliest one
        const keysAsc = sortWeekKeysAsc(Object.keys(grouped))
        if (!this.selectedWeek && keysAsc.length) {
          this.selectedWeek = keysAsc[0]
        }

      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load'
        console.error('Data loading error:', this.error, e?.stack ?? 'no stack available')

      } finally {
        this.loading = false
        console.info('Data loading finished')
      }

      console.info('Stations loaded:', this.stations?.length ?? 0, this.stations.map(s => s.name))
      console.info('Bookings count:', Object.keys(this.bookingsByWeek).length)
    },

    setSelectedStation(stationId: string) {
      this.selectedStation = stationId
    },

    setSelectedWeek(weekKey: string | null) {
      this.selectedWeek = weekKey
    },

    selectNextWeek() {
      const keys = sortWeekKeysAsc(Object.keys(this.bookingsByWeek))
      if (!keys.length) return
      const idx = this.selectedWeek ? keys.indexOf(this.selectedWeek) : -1
      const next = idx < keys.length - 1 ? keys[idx + 1] : null
      if (next) this.selectedWeek = next
    },

    selectPrevWeek() {
      const keys = sortWeekKeysAsc(Object.keys(this.bookingsByWeek))
      if (!keys.length) return
      const idx = this.selectedWeek ? keys.indexOf(this.selectedWeek) : -1
      const prev = idx > 0 ? keys[idx - 1] : null
      if (prev) this.selectedWeek = prev
    },
  },
})


async function fetchDataCached(startDate: string): Promise<RawStation[]> {
  const cached = getCached(startDate)
  if (cached) {
    console.info('Using cached stations for', startDate)
    return cached
  }

  const url = new URL(import.meta.env.VITE_API_URL) // ?startDate=YYYY-MM-DD
  console.info('Fetching stations from API:', url.toString())
  //TODO: mock API with start date
  //url.searchParams.set('startDate', startDate)

  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = (await res.json()) as RawStation[]

  setCached(startDate, data)

  return data
}
