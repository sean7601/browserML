// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];


// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}



function openModal(content){
    modal.style.display = "block";
    $("#modalContent").html(content);
}

//close modal
function closeModal(){
    modal.style.display = "none";
}