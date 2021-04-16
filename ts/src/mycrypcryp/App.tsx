namespace mycrypcryp {

    export const version = "0.0.1"

    export class App{
        async run(){
            document.body.append( new scene.Landing().htmlElement )
        }
   }

}