if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
	navigator.serviceWorker
	  .register("serviceWorker.js")
	  .then(res => console.log("service worker registered"))
	  .catch(err => console.log("service worker not registered", err))
  })
}

function setCookie(name,value,days) { //https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
	//console.log("cookie name=" + name + " value=" + value + " days=" + days);
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Strict";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function eraseCookie(name) {   
	document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

var last = null;
function $(id) { return document.getElementById(id); }
var unitTypeData = [
	{
		"id": "temp",
		"text": "Temperature",
		"defaultA": "c",
		"defaultB": "f"
	},
	{
		"id": "length",
		"text": "Length",
		"defaultA": "in",
		"defaultB": "mm"
	},
	{
		"id": "speed",
		"text": "Speed",
		"defaultA": "mph",
		"defaultB": "kph"
	},
	{
		"id": "power",
		"text": "Power",
		"defaultA": "w",
		"defaultB": "hp"
	}
];
var unitdata = [
	{
		"id": "in",
		"text": "in",
		"type": "length",
		"preoffset": 0,
		"multiplier": 0.0254,
		"postoffset": 0
	},
	{
		"id": "mm",
		"text": "mm",
		"type": "length",
		"preoffset": 0,
		"multiplier": 0.001,
		"postoffset": 0
	},
	{
		"id": "m",
		"text": "m",
		"type": "length",
		"preoffset": 0,
		"multiplier": 1,
		"postoffset": 0
	},
	{
		"id": "c",
		"text": "&#176;C",
		"type": "temp",
		"preoffset": 0,
		"multiplier": 1,
		"postoffset": 273.15
	},
	{
		"id": "f",
		"text": "&#176;F",
		"type": "temp",
		"preoffset": -32,
		"multiplier": 5/9,
		"postoffset": 273.15
	},
	{
		"id": "k",
		"text": "Kelvin",
		"type": "temp",
		"preoffset": 0,
		"multiplier": 1,
		"postoffset": 0
	},
	{
		"id": "mph",
		"text": "mph",
		"type": "speed",
		"preoffset": 0,
		"multiplier": 0.44704,
		"postoffset": 0
	},
	{
		"id": "kph",
		"text": "kph",
		"type": "speed",
		"preoffset": 0,
		"multiplier": 0.27777777778,
		"postoffset": 0
	},
	{
		"id": "m/s",
		"text": "m/s",
		"type": "speed",
		"preoffset": 0,
		"multiplier": 1,
		"postoffset": 0
	},
	{
		"id": "w",
		"text": "Watt",
		"type": "power",
		"preoffset": 0,
		"multiplier": 1,
		"postoffset": 0
	},
	{
		"id": "hp",
		"text": "hp",
		"type": "power",
		"preoffset": 0,
		"multiplier": 745.69987,
		"postoffset": 0
	}
];

var tempA = "";
var tempB = "";
var tempUnitA = "";
var tempUnitB = "";

function calculate(element) {
	//console.log("tempA=" + tempA + ", tempB=" + tempB + ", $a.value=" + $("a").value + ", $b.value=" + $("b").value);
	if($("a").value != tempA || $("b").value != tempB || $("aUnit").value != tempUnitA || $("bUnit").value != tempUnitB) { //prevents recalculating when you unfocus after typing in the input
		//console.log("calculate");
		setCookie("unitType",$("unitType").value,99);
		setCookie("aUnit",$("aUnit").value,99);
		setCookie("bUnit",$("bUnit").value,99);
		if($("a").value || $("b").value){
			if(element){
				last = element.id;
			}
			else{
				last = "a";
			}
			if(last == "a"){
				$("b").value = "";
			}
			else if(last == "b"){
				$("a").value = "";
			}
			if(!isNaN(parseFloat($(last).value))){
				let thisType = $("unitType").value;
				var oldUnit = "";
				var newUnit = "";
				if(last == "a"){
					//alert($("aUnit").value);
					oldUnit = $("aUnit").value;
					newUnit = $("bUnit").value;
				}
				else if(last == "b"){
					oldUnit = $("bUnit").value;
					newUnit = $("aUnit").value;
				}
				let oldUnitObject = unitdata.find(unitdata => unitdata.type === thisType && unitdata.id === oldUnit);
				let newUnitObject = unitdata.find(unitdata => unitdata.type === thisType && unitdata.id === newUnit);
				let normalizedValue = (parseFloat($(last).value) + oldUnitObject.preoffset) * oldUnitObject.multiplier + oldUnitObject.postoffset;
				let convertedValue = (normalizedValue - newUnitObject.postoffset) / newUnitObject.multiplier - newUnitObject.preoffset;
				if(last == "a"){
					//alert(convertedValue);
					$("b").value = matchSigFigs($(last).value,convertedValue+"");
					setCookie("b",$("b").value,99);
					setCookie("a",$(last).value,99);
				}
				else if(last == "b"){
					$("a").value = matchSigFigs($(last).value,convertedValue+"");
					setCookie("a",$("a").value,99);
					setCookie("b",$(last).value,99);
				}
				//alert(document.getElementById(last).value);
			}
		}
		tempA = $("a").value;
		tempB = $("b").value;
		tempUnitA = $("aUnit").value;
		tempUnitB = $("bUnit").value;
	}
}
//console.log(matchSigFigs("17.98","01.00050"));
function matchSigFigs(from,to) {
	//console.log("from=" + from + ", to=" + to);
	splitNum = from.split(".");
	//alert(splitNum[0] + " | " + splitNum[1]);
	before = parseInt(splitNum[0]).toString();
	if(splitNum.length > 1){
		after = splitNum[1];
		decimals = after.length;
	}
	else{
		after = 0;
		decimals = 0;
	}
	if(before == 0){
		ints = 0;
		//after = parseInt(splitNum[1]).toString();
	}
	else {
		ints = before.replace(/\D/g,'').length; //replace removes a negative sign or anything else non-digit
	}
	
	splitTo = to.split(".");
	toBefore = parseInt(splitTo[0]).toString();
	if(splitTo.length > 1){
		toAfter = parseInt(splitTo[1]).toString();
	}
	else{
		toAfter = 0;
	}
	
	sigFigs = ints+decimals;
	//console.log("sigFigs=" + sigFigs);
	//console.log("toAfter=" + toAfter);
	if(sigFigs < 3) { sigFigs = 3 } ;
	if(to == "0"){
		return "0";
	}
	else{
		//issue: 11.1C gives 52F instead of 52.0
		return parseFloat(parseFloat(to).toPrecision(sigFigs));
	}
}

function initLists() {
	//alert(getCookie("a"));
	if(getCookie("a")){
		$("a").value = getCookie("a");
	}
	if(getCookie("b")){
		$("b").value = getCookie("b");
	}
	for (i in unitTypeData) {
		var opt = document.createElement('option');
		opt.value = unitTypeData[i].id;
		opt.innerHTML = unitTypeData[i].text;
		$("unitType").appendChild(opt);
	}
	if(getCookie("unitType")){
		for(m of $("unitType").options){
			if(getCookie("unitType") == m.value){
				m.selected = true;
			}
		}
	}
	changeUnitType();
	if(getCookie("aUnit")){
		for(j of $("aUnit").options){
			if(getCookie("aUnit") == j.value){
				j.selected = true;
			}
			else{
				j.selected = false;
			}
		}
	}
	if(getCookie("bUnit")){
		for(k of $("bUnit").options){
			if(getCookie("bUnit") == k.value){
				k.selected = true;
			}
			else{
				k.selected = false;
			}
		}
	}
}

function changeUnitType(){
	const filteredUnits = unitdata.filter( x => 
		x.type === $("unitType").value
	);
	$("aUnit").innerHTML = "";
	$("bUnit").innerHTML = "";
	for (i in filteredUnits) {
		var thisType = unitTypeData.find(x => x.id === $("unitType").value)
		var opt = document.createElement('option');
		opt.value = filteredUnits[i].id;
		opt.innerHTML = filteredUnits[i].text;
		if(thisType.defaultA == opt.value) {
			opt.selected = true;
		}
		$("aUnit").appendChild(opt);
		var opt2 = document.createElement('option');
		opt2.value = filteredUnits[i].id;
		opt2.innerHTML = filteredUnits[i].text;
		if(thisType.defaultB == opt2.value) {
			opt2.selected = true;
		}
		$("bUnit").appendChild(opt2);
	}
}
