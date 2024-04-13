//enable for cordova build
//screen.orientation.lock('portrait');

//enable for PWA
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

function $(id) { return document.getElementById(id); }
var last = null;
var disableAutoFocus = false;
var focused = [];
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
		"id": "ft",
		"text": "ft",
		"type": "length",
		"preoffset": 0,
		"multiplier": 0.3048,
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
		"id": "km",
		"text": "km",
		"type": "length",
		"preoffset": 0,
		"multiplier": 1000,
		"postoffset": 0
	},
	{
		"id": "mi",
		"text": "mi",
		"type": "length",
		"preoffset": 0,
		"multiplier": 1609.344,
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
		"id": "ft/s",
		"text": "ft/s",
		"type": "speed",
		"preoffset": 0,
		"multiplier": 0.3048,
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
		"id": "kw",
		"text": "kW",
		"type": "power",
		"preoffset": 0,
		"multiplier": 1000,
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
			else if(last===null){
				last = "a";
			}
			if(last == "a"){
				$("b").value = "";
			}
			else if(last == "b"){
				$("a").value = "";
			}
			if(!isNaN($(last).value) && !isNaN(parseFloat($(last).value))){
				//console.log(last + "isn't NaN");
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

function matchSigFigs(from,to){
	//console.log("from=" + from + ", to=" + to);
	if(from==0 && to==0){
		return("0");
	}
	else{
		from = from.replace(/\./,"");
		var firstNonZero = from.search(/[1-9]/);
		//var decimal = from.search(/\./);
		var lastDigit = from.search(/\d$/);
		var sigFigs = lastDigit - firstNonZero + 1; //not technically sigfigs when this applies to integers with trailing zeros
		if(sigFigs < 3){ sigFigs = 3; }
		//console.log("sigFigs=" + sigFigs);
		var toReturn = parseFloat(to).toPrecision(sigFigs);
		if(toReturn.indexOf("e") > -1){
			exp = parseInt(toReturn.substr(toReturn.indexOf("e") + 1));
			//console.log("exp=" + exp);
			var toFirstNonZero = to.search(/[1-9]/);
			var toLastDigit = to.search(/\d$/);
			var toDecimal = to.search(/\./);
			var fixedPlaces = null;
			if(toDecimal == -1){
				fixedPlaces = 0;
			}
			else{
				fixedPlaces = toFirstNonZero + sigFigs - toDecimal - 1; //can be negative
				if(fixedPlaces < 0){
					fixedPlaces = 0;
				}
			}
			//console.log("fixedPlaces=" + fixedPlaces);
			toReturn = parseFloat(to).toFixed(fixedPlaces);
		}
		return(toReturn);
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
	$("a").focus();
	$("a").setSelectionRange($("a").value.length,$("a").value.length);
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

function typeChar(buttonElement){
	//console.log("focused id=" + focused[0].id);
	preText = focused[0].value;
	//console.log("preText=" + preText);
	focused[0].value = preText.substring(0,focused[1]) + buttonElement.innerText + preText.substring(focused[1],preText.length);
	//console.log("focused[0].value=" + focused[0].value);
	calculate(focused[0]);
	focused[1] += 1;
	disableAutoFocus = true;
	focused[0].focus();
	focused[0].setSelectionRange(focused[1],focused[1]);
	disableAutoFocus = false;
	//console.log(focused[0].id + "," + focused[1]);
}
function backspace(){
	preText = focused[0].value;
	focused[0].value = preText.substring(0,focused[1]-1) + preText.substring(focused[1],preText.length);
	calculate(focused[0]);
	if(focused[1] > 0){
		focused[1] -= 1;
	}
	disableAutoFocus = true;
	focused[0].focus();
	focused[0].setSelectionRange(focused[1],focused[1]);
	disableAutoFocus = false;
}
function toggleNegative(){
	preText = focused[0].value;
	var postText = "";
	if(parseInt(focused[0].value) < 0){
		postText = preText.replace("-","");
		focused[1] -= 1;
	}
	else {
		postText = "-" + preText;
		focused[1] += 1;
	}
	focused[0].value = postText;
	calculate(focused[0]);
	disableAutoFocus = true;
	focused[0].focus();
	focused[0].setSelectionRange(focused[1],focused[1]);
	disableAutoFocus = false;
}

function checkFocus(inputElement){
	if(!disableAutoFocus){
		focused[0] = inputElement;
		focused[1] = inputElement.selectionStart;
		last = focused[0].id;
		//console.log(focused[0].id + "," + focused[1]);
		//inputElement.setSelectionRange(focused[1],focused[1]);
	}
}
