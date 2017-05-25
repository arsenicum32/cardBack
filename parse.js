export const parse = (json)=> {
  try{
    return JSON.parse(json);
  }catch(e){
    return null;
  }
}
