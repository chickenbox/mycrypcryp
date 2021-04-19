namespace mycrypcryp { export namespace setting { 

    const defaultAssetWhiteList = [
        "BTC",
        "ETH",
        "BNB",
        "BUSD",
        "USDT",
        "TUSD",
        "iINCH",
        "AAVE",
        "ADA",
        "ADXOLD",
        "ALGO",
        "ALPHA",
        "ANTOLD",
        "ATOM",
        "AUD",
        "AUDIO",
        "BAL",
        "BAND",
        "BAT",
        "BCH",
        "BEAM",
        "BGBP",
        "BOT",
        "BRL",
        "BTT",
        "CHZ",
        "COMP",
        "CRV",
        "DAI",
        "DASH",
        "DOGE",
        "DOT",
        "DREPOLD",
        "ENJ",
        "EOS",
        "ERD",
        "ETC",
        "EUR",
        "FIL",
        "FTM",
        "GBP",
        "GNT",
        "GRT",
        "HBAR",
        "HNT",
        "JST",
        "KNC",
        "LEND",
        "LINK",
        "LOOMOLD",
        "LTC",
        "LUNA",
        "MATIC",
        "MITH",
        "MKR",
        "NEO",
        "NGN",
        "NPXS",
        "OMGOMOLD",
        "ONT",
        "PAX",
        "PAXG",
        "PERLOD",
        "QTUM",
        "REN",
        "REPV1",
        "RSR",
        "RUNE",
        "SNX",
        "SOL",
        "SRM",
        "SUN",
        "SUSHU",
        "SXP",
        "TOMO",
        "TRX",
        "TRY",
        "UNI",
        "VET",
        "WAVES",
        "WBNB",
        "WETH",
        "WRX",
        "XLM",
        "XMR",
        "XRP",
        "XTZ",
        "XVG",
        "YFI",
        "YFII",
        "ZEC",
        "ZEN"
    ]


    interface AppSettingData {
        currency?: string
        quoteAsset?: string
        assetWhiteList?: string[]
        favourite?: string[]
        markers?: {
            [key: string]: number[]
        }
    }

    export class AppSetting {
        static readonly shared = new AppSetting()

        private localStorageKey = "mycrypcryp.setting.AppSetting.data"
        private _data: AppSettingData

        get currency(){
            return this._data.currency || "HKD"
        }
        
        get quoteAsset(){
            return this._data.quoteAsset || "USDT"
        }

        readonly favourite: Set<string>
        readonly assetWhiteList: Set<string>
        readonly markers = new Map<string,Date[]>()

        constructor(){
            try{
                this._data = JSON.parse( localStorage.getItem(this.localStorageKey) ) || {}
            }catch(_){
                this._data = {}
            }
            this.favourite = new Set(this._data.favourite || ["BTC", "ETH", "PAXG"])
            this.assetWhiteList = new Set( this._data.assetWhiteList || defaultAssetWhiteList )
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