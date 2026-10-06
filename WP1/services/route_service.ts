import yaml from 'yaml';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

function getEmbeddedDataOwners(data: any, embed: string, routeRelationships: any){
    const singularEmbed = embed.endsWith('s') ? embed.slice(0, -1) : embed;
    const relation = routeRelationships.find((rel:any) => {
        return rel.foreignKey.toLowerCase().startsWith(singularEmbed.toLowerCase())
    });
    
    if(!relation) return data;

    const targetData = config[relation.relatedRoute] || [];
    const foreignKey = relation.foreignKey;

    if(Array.isArray(data)){
        return data.map((item:any) => {
            if(!item[foreignKey]) return item;
            let matchedItems = targetData.filter((tItem:any) => {
                return item[foreignKey].includes(tItem.id);
            });

            return {
                ...item, [embed]: matchedItems
            }
        });
    }

    if(!data[foreignKey]) return data;
    let matchedItems = targetData.filter((tItem:any) => {
        return data[foreignKey].includes(tItem.id);
    });

    return {
        ...data,
        [embed]: matchedItems
    };
}

export function getRoute(route: string, embed?: string): any[]{
    const data = config[route] ||  [];
    const routeRelationships = config.relationships?.[route] || [];

    if(embed && routeRelationships.length > 0){
        return getEmbeddedDataOwners(data, embed, routeRelationships);
    }

    return data;
}

export function getRouteById(route: string, id: string, embed?: string){
    const data = config[route] || [];
    const record = data.find((item:any) => String(item.id) === id);
    const routeRelationships = config.relationships?.[route] || [];

    if (!record) {return record}

    if(embed && routeRelationships.length > 0){
        return getEmbeddedDataOwners(record, embed, routeRelationships);
    }

    return record;
}

export function addDataToRoute(route: string, body: any): [boolean, string]{
    try{
        config[route].push({
            id: body.id || crypto.randomUUID(),
            ...body
        });

        // const yamlStr = yaml.stringify(config);
        // fs.writeFileSync(path.join(ROOT_DIR, CONFIG), yamlStr, 'utf8');

        return [true, ""];
    }catch(err){
        console.error(err);
        return [false, `${err}`];
    }
}

export function deleteDataFromRoute(route: string, id: string): [boolean, string]{
    try{
        const initialLength = config[route].length;

        config[route] = config[route].filter((item:any) => String(item.id) !== id);

        if(config[route].length === initialLength){
            return [false, `There is no data with id: ${id}`];
        }

        // const yamlStr = yaml.stringify(config);
        // fs.writeFileSync(path.join(ROOT_DIR, CONFIG), yamlStr, 'utf8');

        return [true, ""];
    }catch(err){
        console.error(err);
        return [false, `${err}`];
    }
}

export function updateDataFromRoute(route: string, id: string, body: any): [boolean, string]{
    try{
        const exists = config[route].some((item:any) => String(item.id) === id);
        
        if(!exists){
            return [false, `There is no data with id: ${id}`];
        }

        config[route] = config[route].map((item:any) => {
            return String(item.id) === id ? {id: item.id, ...body} : item
        });

        // const yamlStr = yaml.stringify(config);
        // fs.writeFileSync(path.join(ROOT_DIR, CONFIG), yamlStr, 'utf8');

        return [true, ""];
    }catch(err){
        console.error(err);
        return [false, `${err}`];
    }
}

export function fromRAMToYML(){
    console.log("Saving to YAML...");
    try{
        const yamlStr = yaml.stringify(config);
        fs.writeFileSync(path.join(ROOT_DIR, CONFIG), yamlStr, 'utf8');
    }catch(err){
        console.error(err);
    }
}