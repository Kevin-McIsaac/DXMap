var DXMap = {}; //associative array

$(document).ready(function(){
  $("input").on("change", function() {
    $("#LeadershipScore").text(LeadershipScore());
    $("#DCMScore").text(DCMScore());

  });

  $( "#DXQuestions").submit(function( event ) {
    pinPoint( 290 *(DCMScore()/4) + 5, 290 *(1- LeadershipScore()/11) + 5);
    DXMap["eMail"] = $('input#emailaddress').val();
    DXMap["Date"] = new Date().toISOString();
    console.log(`DXQuestions Submit: `); console.log(DXMap);
    magnumSave("DXMap", DXMap);
    event.preventDefault();
  });
});

function pinPoint(x, y) {
  $("#x-line").attr("y1", y).attr("y2", y).attr("x2", x);
  $("#y-line").attr("x1", x).attr("x2", x).attr("y2", y);
  $("#pin").attr("cy", y).attr("cx", x) ;
}


function LeadershipScore() {
	return getScore("Who") + getScore("Timeframe") +  getScore("Change") +  getScore("Value")
}

function DCMScore() {
	return getScore("DCM")
}

function getScore(id) {
    var radio = $(`input[name='${id}']:checked`);
    var n = parseInt(radio.val());
    DXMap[id] = isNaN(n) ? null : n;
    DXMap[id+"Text"] = radio.closest('label').text();
    return isNaN(n) ? 0 : n;
}

// Magnum utility functions

function isValidID(id) {return id != null }

function magnumSave(name, doc) {
  console.log(`magnumSave ${name}`)
  if (doc.id) { return magnumUpdateDoc(name, doc)}
  else { return magnumCreateDoc(name, doc)}
}

function magnumCreateDoc(name, doc) {
  console.assert(!isValidID(doc.id) , `WARNING: magnumCreateDoc ${name} with valid id ${doc.id}`);
  return $.ajax({
    url: `/domo/magnum/v1/collection/${name}/documents`,
    headers: {
      "Accept": "application/json",
      "content-type": "application/json"
    },
    method: "POST",
    data: JSON.stringify({"content": doc})
  })
  .done(function(data){
    doc.id = data.id;
    console.log(`SUCESS: magnumCreateDoc ${name} id = ${doc.id} ... `); console.log(doc);
  })
  .fail(function(xhr) {
    console.log(`FAIL: magnumCreateDoc ${name}:`, xhr);
  });
}

function magnumUpdateDoc(name, doc){
  console.log(`${isValidID(doc.id) ? "OK": "ERROR"} magnumUpdateDoc ${name}: ${doc.id}  `)
  console.assert(isValidID(doc.id), `magnumUpdateDoc: ${name} no ID`)

  return $.ajax({
    url: `/domo/magnum/v1/collection/${name}/documents/${doc.id}`,
    headers: {
      "Accept": "application/json",
      "content-type": "application/json"
    },
    method: "PUT",
    data: JSON.stringify({"content": doc})
  })
  .done(function(data){
    console.log(`SUCESS: magnumUpdateDoc ${name} id = ${doc.id} ... `); //console.log(doc);
  })
  .fail(function(xhr) {
    console.log(`FAIL: magnumUpdateDoc ${name}:`, xhr);
  });
}
