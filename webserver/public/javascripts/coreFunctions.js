/* eslint-disable no-invalid-this */
/*eslint-env node*/
'use strict'
var etudiantsEtPhotos = []; //tableau de couple INE:nom:photo
var listePresence = []; //tableau de couple nom:présence
//var indexEtudiantCourant = 0;
var flagToCohorte = false; // set if Cohorte is loaded or not
var horraire;
var salle;
var semaine;
var $;
$ = require('jquery');
function getTextSelect(string) {
  var e = document.getElementById(string);
  var f = e.options[e.selectedIndex].text;
  return f;
}
document.addEventListener('DOMContentLoaded', function() {
  function loadingHSS(){
    var content = [];
    content = JSON.parse(httpGet("http://local.test:7001/HSS"));
    fillOptionHorraire(content[0]);
    fillOptionSemaine(content[1]);
    fillOptionSalle(content[2]);
  }
function fillOptionHorraire(content){
    for (var i = 0; i<content.length; i++) {
        $('#horraire').append('<option value="'+content[i]+'">'+content[i]+'</option>');
    }
  }
  function fillOptionSemaine(content){
    for (var i = 0; i<content.length; i++) {
          $('#semaine').append('<option value="'+content[i]+'">'+content[i]+'</option>');
    }
  }
  function fillOptionSalle(content){
    for (var i = 0; i<content.length; i++) {
          $('#salle').append('<option value="'+content[i]+'">'+content[i]+'</option>');
    }
  }
  document.getElementById('idCohorte').onclick = function (){
    if (flagToCohorte == false){
    flagToCohorte = true;
    identifierCohorte();
    }
    else{
      var horraireT = getTextSelect("horraire");
      var semaineT = getTextSelect("semaine");
      var salleT = getTextSelect("salle");
      if (!(horraireT === horraire && semaineT == semaine && salleT ==salle)){
        document.getElementById('tiles').innerHTML = "";
        flagToCohorte = true;
        identifierCohorte();
      }
    }
    $('#tiles').on('click', ".labelSlide[for^='slide_div'], .labelSlide[htmlFor^='slide_div']", function(){
       var that = $(this);
       var temp = that.attr('for');
       var temp2 = temp.split('_');
       var val = temp2[1];
       var text = $('#'+ val +"  .state").text();
       if (text == 'Absent'){
         presentAbscent($('#'+ val +"  h3").text(),true);
         $('#'+ val +"  .state").empty();
         $('#'+ val +"  .state").append('Present');
       }
       if(text == 'Present'){
         presentAbscent($('#'+ val +"  h3").text(),false);
         $('#'+ val +"  .state").empty();
         $('#'+ val +"  .state").append('Absent');
       }
    });
  }
  document.getElementById('validationButton').onclick = function(){
    if (flagToCohorte == true){
      validerListePresence();
      flagToCohorte = false;
    }
    else{
      alert('Veuillez Charger une Cohorte !');
    }
  };

  loadingHSS();
});

function identifierCohorte()
{
    horraire = getTextSelect("horraire");
    semaine = getTextSelect("semaine");
    salle = getTextSelect("salle");
    var content = document.getElementById("wait");
    if(content != null){
      content.remove();
    }
        if(salle !== "")
        {

            etudiantsEtPhotos = JSON.parse(httpGet("http://local.test:7001/listeElevesApi?horraire="+horraire+"&semaine="+semaine+"&salle="+salle));

            if(etudiantsEtPhotos !== 'undefined')
            {
                buildhtml();
            }
        }

}
function presentAbscent(nom,bool)
{
    var flag = false;
    for (var i in listePresence) {
      if (listePresence[i].nom == nom) {
        flag = true;
        if(bool === true)
        {
          listePresence[i].presence = "present";

        }
        else if(bool === false)
        {
           listePresence[i].presence = "absent";
        }

         break; //Stop this loop, we found it!
      }
    }
    if (flag ==false){
      if(bool === true)
      {
          listePresence.push({nom:nom,presence:"present"});
      }
      else if(bool === false)
      {
          listePresence.push({nom:nom,presence:"absent"});
      }
      else
      {
          listePresence.push({nom:nom,presence:"erreur"});
      }
    }
}

function validerListePresence()
{
    var erreur = 0;
    if(erreur === 0)
    {
        httpGet("http://local.test:7001/presenceElevesApi?listePresence="+JSON.stringify(listePresence));
    }
    else
    {
        alert("certaines présences/absences n'ont pas étées relevées ! ");
    }
}

function buildhtml()
{
    var cpt = 0;
    var x;
    for(x=0;x<Object.keys(etudiantsEtPhotos).length;x++)
    {
        listePresence.push({nom:etudiantsEtPhotos[cpt.toString()].INE,presence:"absent"});
        addContent(etudiantsEtPhotos[cpt.toString()].Photo,etudiantsEtPhotos[cpt.toString()].INE,etudiantsEtPhotos[cpt.toString()].Nom,cpt);
        cpt++;
    }
}

function addContent(src_images,INE,name,number){
        $('#tiles').append('<li><img src="'+ src_images +'" width="282" height="218"><div class="post-info" id="div'+number+'"><div class="post-basic-info"><h3>'+INE+'</h3><h3>'+name+'</h3></div><div class="info"><div class="here"><span class="state">Absent</span></div><div class="away"><div class="ChekBoxes"><input type="checkbox" value="None" id="slide_div'+number+'" name="check" /><label class ="labelSlide" for="slide_div'+number+'"></label></div></div></div></div></li>');
}
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
