export type Staff = {
    id: number,
    name: string,
    unavailable: string[],
    preferred: string[],
    assigned: string[]
    isOkay: boolean
}

export type Schedule = {
    id: string,
    name: string,
    day: string,
    assigned: number[],
    preferred: number[],
    unavailable: number[],
    isOkay: boolean,
    isLocked: boolean,
}
