import fetch from 'isomorphic-fetch'

type GetterType = "nodeinfo" | "usb" | "power" | "other" | "sdcard" | "uart"
type SetterType = "usb" | "power" | "firmware" | "network" | "uart"
type OnOff = 0 | 1
type NodeIndex = 0 | 1 | 2 | 3


export interface UART {
    uart: string
}

export interface UARTResponse{
    response: UART[]
}
export interface Other {
    version: string
    buildtime: string
    ip: string
    mac: string
}

export interface OtherResponse {
    response: Other[]
}

export interface USB {
    mode: OnOff
    node: NodeIndex
}

export interface USBResponse {
    response: USB[]
}

export interface SDCard {
    total: number
    free: number
    use: number
}

export interface SDCardResponse {
    response: SDCard[]
}

export interface NodePower {
    node1: OnOff
    node2: OnOff
    node3: OnOff
    node4: OnOff
}

export interface NodePowerResponse {
    response: NodePower[]
}

export interface NodeInfo {
    node1: string
    node2: string
    node3: string
    node4: string
}

export interface NodeInfoResponse {
    response: NodeInfo[]
}

export type GetResponse = Promise<NodeInfoResponse | NodePowerResponse | SDCardResponse | USBResponse | OtherResponse | UARTResponse>

export interface USBQuery {
    [k: string]: OnOff | NodeIndex

    mode: OnOff,
    node: NodeIndex,
}

export interface PowerQuery {
    [k: string]: OnOff
    node1: OnOff
    node2: OnOff
    node3: OnOff
    node4: OnOff
}

export interface NetworkQuery {
    [k: string]: "reset"
    cmd: "reset"
}

export interface FirmwareQuery {
    [k: string]: File
    file: File
}

export interface UARTQuery {
    [k: string]: NodeIndex | string
    node: NodeIndex,
    cmd: string,
}

export interface UARTGetQuery {
    [k: string]: NodeIndex
    node: NodeIndex
}

export type Query = USBQuery | PowerQuery | NetworkQuery | FirmwareQuery | UARTQuery

export interface OkResult {
    result: "ok"
}

export interface OkResponse {
    response: OkResult[]
}

export type SetResponse = Promise<OkResponse>

export interface TuringPiInterface {
    get(type: GetterType,  query?: UARTGetQuery, options?: RequestInit): GetResponse
    set(type: SetterType, query: Query, options?: RequestInit): SetResponse
}

/**
 * Turing Pi JavaScript Interface
 * @param url
 */
export const tpi = (url: URL): TuringPiInterface => {
    return {
        /**
         * Get State from the BMC
         * @param type
         * @param [query]
         * @param [options]
         */
        async get(
            type: GetterType,
            query?: UARTGetQuery, // Only UART has extra parameters, might change in the future
            options?: RequestInit,
        ): GetResponse {
            // Set Params
            const params = new URLSearchParams();
            params.set('opt', 'get')
            params.set('type', type)
            if(typeof query !== 'undefined'){
                Object.keys(query).forEach((k)=>{
                    params.set(k, query[k].toString())
                })
            }
            // Fetch
            return fetch(`${url}?${params}`, options)
                .then(r => r.json())
        },
        /**
         * Set State in the BMC
         * @param type
         * @param query
         * @param options
         */
        async set(
            type: SetterType,
            query: Query,
            options?: RequestInit
        ): SetResponse {

            const params = new URLSearchParams();
            params.set('opt', 'set')
            params.set('type', type)

            // Additional option keys
            let extra: { body?: File } = {}
            if (query.file instanceof File) {
                extra.body = query.file
            }

            // Set params
            Object.keys(query).forEach((k) => {
                if(k !== 'file'){
                    params.set(k, query[k].toString())
                }
            })

            // Fetch
            return fetch(`${url}?${params}`, {
                ...options,
                ...extra,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            }).then(r => r.json())
        }
    }
}
