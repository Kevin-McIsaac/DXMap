var DXMap = {}; //associative array

// Update scores in the headings
$(document).ready(function(){
  $('input[type="radio"]').on("change", function() {
    $("#LeadershipScore").text(LeadershipScore());
    $("#DCMScore").text(DCMScore());
  });

  // Calculate the position on the map each time a radio buttion is changed
  $( "#DXQuestions").submit(function( event ) {
    var left = (DCMScore() / 5) * 100;
    var top = (1 - (LeadershipScore() / 15)) * 100;
    $("#chartMarker")
      .css('left', left + '%')
      .css('top', top + '%');
    $("#chartMarker").show();

    // Get values
    DXMap["FirstName"] = $("#firstName").val();
    DXMap["LastName"] = $("#lastName").val();
    DXMap["CompanyName"] = $("#companyName").val();
    DXMap["eMail"] = $('input#emailaddress').val();
    DXMap["CompanySize"] = $("#companySize").val();
    DXMap["Phone"] = $("#phone").val();
    DXMap["Country"] = $("#country").val();
    DXMap["State"] = $("#state").val();
    DXMap["Role"] = $("#role").val();
    DXMap["Industry"] = $("#industry").val();
    DXMap["Date"] = new Date().toISOString();

    magnumSave("DXMap", DXMap);
    event.preventDefault();
  });

  // Materialize plugin
  $('select').formSelect();

  // setup listener for custom event to re-initialize on change
  $('.materialSelect').on('contentChanged', function() {
    $(this).formSelect();
  });

  // Populate countries
  $("#country").empty();
  $("#country").append($("<option></option>")
    .attr("value", -1)
    .attr("disabled", "disabled")
    .text('Select Country'));
  $.each(country_arr, function(key, value) {
    $("#country").append($("<option></option>")
      .attr("value", value).text(value));
  });
  $("#country").val(-1);
  $("#country").trigger('contentChanged');

  // Populate states
  $("#country").change(function() {
    $("#state").empty();
    $("#state").append($("<option></option>")
      .attr("value", -1)
      .attr("disabled", "disabled")
      .text('Select State'));
    var selectedCountryIndex = $("#country").prop('selectedIndex');
    var state_arr = s_a[selectedCountryIndex].split("|");
    $.each(state_arr, function(key, value) {
      $("#state").append($("<option></option>")
        .attr("value", value).text(value));
    });
    $("#state").val(-1);
    $("#state").trigger('contentChanged');
  });
});

function LeadershipScore() {
	return getScore("Who") + getScore("Timeframe") +  getScore("Change") +  getScore("Value")
}

function DCMScore() {
	return getScore("DCM")
}

// Get the value from the radio buttion and convert into an integer
function getScore(id) {
    var radio = $(`input[name='${id}']:checked`);
    var n = parseInt(radio.val());
    DXMap[id] = isNaN(n) ? null : n;
    DXMap[id+"Text"] = radio.closest('label').text();
    return isNaN(n) ? 0 : n;
}

// Magnum (AppDB) utility functions
// These were created before the new libriay/apis were build.
// Consider replacing or updating.
function isValidID(id) {return id != null }

function magnumSave(name, doc) {
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
    console.log(`SUCESS: magnumCreateDoc ${name} id = ${doc.id} ... `);
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
    console.log(`SUCESS: magnumUpdateDoc ${name} id = ${doc.id} ... `);
  })
  .fail(function(xhr) {
    console.log(`FAIL: magnumUpdateDoc ${name}:`, xhr);
  });
}
