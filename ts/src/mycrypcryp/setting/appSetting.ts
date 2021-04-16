namespace mycrypcryp { export namespace setting { 

    interface AppSettingData {
        currency?: string
        quoteAsset?: string
        favourite?: string[]
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

        commit(){
            this._data.favourite = Array.from(this.favourite.keys())
            localStorage.setItem(this.localStorageKey, JSON.stringify(this._data))
        }
    }

}}