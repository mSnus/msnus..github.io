export type Station = { id: string; name: string }

export type RawBooking = {
    id: string
    pickupReturnStationId: string
    customerName: string
    startDate: string
    endDate: string
    pickupStation?: string
    returnStation?: string
}

export type RawStation = {
    id: string;
    name: string;
    bookings: RawBooking[];
}

export type NormalizedBooking = {
    id: string
    stationId: string
    stationName: string
    customerName: string

    bookDate: Date
    isPickup: boolean

    weekKey: string
    dayNumber: number
    dayName: string
    dayDisplay: string
    bookTime: string

    pickupDate?: Date | null
    returnDate?: Date | null
}

export type BookingRecord = { bookings: NormalizedBooking[], date: string, dayName: string }
export type BookingsByWeek = Record<string, NormalizedBooking[]>