exports.propComparator = function(sortBy, sortAs) {
  if (sortBy == "id") {

    if (sortAs == "DESC") {
      return function(a, b) {
           return a["Name"] > b["Name"] ? 1 : -1
      }
    }
    else {
      return function(a, b) {
           return a["Name"] < b["Name"] ? 1 : -1
      }
    }
  }


  if (sortBy == "MaleCount" || sortBy == "FemaleCount" || sortBy == "OtherCount") {
    if (sortAs == "DESC") {
      return function(a, b) {
        return Number(a[sortBy]) > Number(b[sortBy]) ? 1 : -1
      }
    }
    else {
      return function(a, b) {
        return Number(a[sortBy]) > Number(b[sortBy]) ? -1 : 1
      }
    }
  }


function getDateStr(v){

var comps = v.split("/")
var date = comps[0]
var mon = comps[1]
var yr = comps[2]
return [yr,mon,date]
}

  if (sortBy == "EventDate" || sortBy == "EventTime") {

    if (sortAs == "DESC") {
      return function(a, b) {
        var aD = new Date(getDateStr(a["EventDate"])).getTime()
        var bD = new Date(getDateStr(b['EventDate'])).getTime()
        console.log("ad" + aD)
        console.log("bd" + bD)
        return aD > bD ? -1 : 1
      }
    }
    else {
      return function(a, b) {
       var aD = new Date(getDateStr(a["EventDate"])).getTime()
        var bD = new Date(getDateStr(b['EventDate'])).getTime()
        console.log("ad" + aD)
        console.log("bd" + bD)
        return aD > bD ? 1 : -1
      }
    }
  }


  if (sortBy == "Status") {
    if (sortAs == "DESC") {
      return function(a, b) {
       return a[sortBy] == "Active" ? -1:1
       //return a[sortBy].localeCompare(b[sortBy])
      }
    }
    else {
      return function(a, b) {
         return a[sortBy] == "Active" ? 1:-1
        //return !a[sortBy].localeCompare(b[sortBy])
      }
    }
  }

}