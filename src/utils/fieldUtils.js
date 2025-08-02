export const fieldFn = (data) => {
  if(data.liganame.includes("Herren")){
    if(data.liganame.includes("Kreisliga")){
      return "LSE"
    }
    return "LSD"
  }
  if(data.liganame.includes("Damen")) {
    if (data.liganame.includes("Bezirksliga")) {
      return "LSE"
    }
    if (data.liganame.includes("Landesliga")) {
      return "LSE"
    }
    return "LSD"
  }
  if(data.liganame.includes("Oberliga")){
    return "LSE+ | LSD"
  }
  if(data.liganame.includes("Playoffs")){
    return "LSE+ | LSD"
  }
  return "LSE"
} 