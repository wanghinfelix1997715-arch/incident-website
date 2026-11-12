// Synthetic provider adapter for the revised writer + source-review protocol.
export function incidentProviderResult(documents,options){
 const request=JSON.parse(options.body);
 if(request.text.format.name==='incident_review')return {approved:true,issues:[],warnings:[]};
 return {documents,warnings:[],references:Object.entries(documents).map(([field,text])=>({field,source:text.slice(0,2000),draft:text.slice(0,2000)}))};
}
