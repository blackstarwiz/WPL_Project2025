import * as fs from "fs";
import * as path from "path";

let naam : string[] = ["Calzone","Capricciosa","Frutti di Mare","Fungi","Hawaii","Margarita","Pepperoni","Prosciutto","Prosciutto","Prosciutto","Quattro Stagioni","Salami","Tonno"];
// Data, als je items toevoegd zal deze te voorschijn komen in de live view
export interface MenuItem {
  naam: string;
  foto: string;
}

export let bestellingen: string[] = [];

function humanNameFromFilename(filename: string) {
  
  try{
    naam.forEach(element => {
      return element.toString(); 
    });
  }catch(err){
    return "";
  }
}

function loadMenuFromDir(relDir = "public/assets/images/pizza_images"): MenuItem[]{
  try{
      const imagesDir = path.join(process.cwd(), relDir);

      if(!fs.existsSync(imagesDir)) return [];

      const files = fs
      .readdirSync(imagesDir)
      .filter((f) => /^pizza_.+\.(png|png)$/i.test(f));

      return files.map((f) => ({
        naam : humanNameFromFilename(f) || "",
        foto:`assets/images/pizza_images/${f}`,
      }))
  }catch(err){
    return [];
  }

}

export let menu: MenuItem[] = loadMenuFromDir();
