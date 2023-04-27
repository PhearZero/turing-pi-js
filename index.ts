import fetch from 'isomorphic-fetch'

type GetterType = "nodeinfo" | "usb" | "power" | "other" | "sdcard" | "uart"
type SetterType = "usb" | "power" | "firmware" | "network" | "uart"
type OnOff = 0 | 1
type NodeIndex = 0 | 1 | 2 | 3


interface UART {
    uart: string
}

interface UARTResponse{
    response: UART[]
}
interface Other {
    version: string
    buildtime: string
    ip: string
    mac: string
}

interface OtherResponse {
    response: Other[]
}

interface USB {
    mode: OnOff
    node: NodeIndex
}

interface USBResponse {
    response: USB[]
}

interface SDCard {
    total: number
    free: number
    use: number
}

interface SDCardResponse {
    response: SDCard[]
}

interface NodePower {
    node1: OnOff
    node2: OnOff
    node3: OnOff
    node4: OnOff
}

interface NodePowerResponse {
    response: NodePower[]
}

interface NodeInfo {
    node1: string
    node2: string
    node3: string
    node4: string
}

interface NodeInfoResponse {
    response: NodeInfo[]
}

type GetResponse = Promise<NodeInfoResponse | NodePowerResponse | SDCardResponse | USBResponse | OtherResponse | UARTResponse>

interface USBQuery {
    [k: string]: OnOff | NodeIndex

    mode: OnOff,
    node: NodeIndex,
}

interface PowerQuery {
    [k: string]: OnOff
    node1: OnOff
    node2: OnOff
    node3: OnOff
    node4: OnOff
}

interface NetworkQuery {
    [k: string]: "reset"
    cmd: "reset"
}

interface FirmwareQuery {
    [k: string]: File
    file: File
}

interface UARTQuery {
    [k: string]: NodeIndex | string
    node: NodeIndex,
    cmd: string,
}

interface UARTGetQuery {
    [k: string]: NodeIndex
    node: NodeIndex
}

type Query = USBQuery | PowerQuery | NetworkQuery | FirmwareQuery | UARTQuery

interface OkResult {
    result: "ok"
}

interface OkResponse {
    response: OkResult[]
}

type SetResponse = Promise<OkResponse>

interface TuringPiInterface {
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
