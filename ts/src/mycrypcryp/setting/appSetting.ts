namespace mycrypcryp { export namespace setting { 

    interface AppSettingData {
        currency?: string
        quoteAsset?: string
        favourite?: string[]
        markers?: {
            [key: string]: number[]
        }
    }

    export class AppSetting {
        static readonly shared = new AppSetting()

        private localStorageKey = "mycrypcryp.setting.AppSetting.data"
        private _data: AppSettingData = JSON.parse( localStorage.getItem(this.localStorageKey) ) || {}

        get currency(){
            return this._data.currency || "HKD"
        }
        
        get quoteAsset(){
            return this._data.quoteAsset || "USDT"
        }

        readonly favourite = new Set(this._data.favourite || ["BTC", "ETH", "PAXG"])
        readonly markers = new Map<string,Date[]>()

        constructor(){
            for( let baseAsset in this._data.markers || {} ){
                this.markers.set( baseAsset, this._data.markers[baseAsset].map(i=>new Date(i)) )
            }
        }

        private updateInternalData(){
            this._data.favourite = Array.from(this.favourite.keys())
            this._data.markers = this._data.markers || {}
            for( let e of this.markers){
                this._data.markers[e[0]] = e[1].map(d=>d.getTime())
            }
        }

        commit(){
            this.updateInternalData()
            localStorage.setItem(this.localStorageKey, JSON.stringify(this._data))
        }

        export(){
            this.updateInternalData()
            return btoa(JSON.stringify(this._data))
        }

        import( setting: string ){
            localStorage.setItem(this.localStorageKey, atob(setting))
            location.reload()
        }
    }

}}