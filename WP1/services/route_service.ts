import yaml from 'yaml';
import fs from 'node:fs';
import path from 'node:path';

const CONFIG = process.argv.slice(2)[0] || 'config.yml';
let config: any;
export const ROOT_DIR = process.cwd();

try{
    config = yaml.parse(
        fs.readFileSync(path.join(ROOT_DIR, CONFIG), 'utf8')
    );
}catch(error){
    console.error(`Error reading or parsing config: ${error}`);
    process.exit(1);
}

export {config};

function getEmbeddedDataOwners(data: any){
    const persons = config["persons"];
    if (Array.isArray(data)){
        const embedded_data = data.map((p:any) => {
            if(!p.ownerIds){
                return p;
            }
            let matchedOwners = persons.filter((person:any) => {
                return p.ownerIds.includes(person.id);
            });
            return {
                ...p,
                owners: matchedOwners 
            }
        });
        return embedded_data;
    }else{
        let matchedOwners = persons.filter((person:any) => {
            return data.ownerIds.includes(person.id);
        });
        return {...data, owners: matchedOwners};
    }
}

export function getRoute(route: string, embed?: string): any[]{
    const data = config[route] ||  [];

    if(route === 'pets' && embed === 'owners'){
        return getEmbeddedDataOwners(data);
    }

    return data;
}

export function getRouteById(route: string, id: string, embed?: string){
    const data = config[route] || [];
    const record = data.find((item:any) => item.id == id);

    if(route === 'pets' && embed === 'owners'){
        return getEmbeddedDataOwners(record);
    }

    return record;
}