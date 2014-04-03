/*******************************************************************************
*** Variables
******************************************************************************/

BASE_TOPIC = "BaseConversion";

/*******************************************************************************
*** Convert
******************************************************************************/

function compute(input, base)
{
	var value = undefined;
	var match = undefined;
	var input = input.replace(/\s+/g, "").split(/([\+\-\*\/\%])/g);

	if (input)
	{
		if (!(match = extractBase(((input[0])? input[0] : "0"), base)))
		{
			return;
		}

		value = str2bigInt(match[1], base);

		for (var i = 1; i < input.length; i += 2)
		{
			if (!(match = extractBase(input[i + 1], base)))
			{
				return;
			}

			switch (input[i])
			{
				case "+" : value = add(value, str2bigInt(match[1], base)); break;
				case "-" : value = sub(value, str2bigInt(match[1], base)); break;
				default  : return;
			}
		}
	}

	$.Topic(BASE_TOPIC).publish(value);
}

/*******************************************************************************
*** Converter
******************************************************************************/

function extractBase(input, base)
{
	var match = undefined;

	switch (base)
	{
		case 02 : match = extractBin(input); break;
		case 08 : match = extractOct(input); break;
		case 10 : match = extractDec(input); break;
		case 16 : match = extractHex(input); break;
		default : break;
	}

	return match;
}

function extractBin(input)
{
	var matches = undefined;

	(matches = input.match(/^(?:0b)?([0-1]+)$/i)) ||
	(matches = input.match(/^([0-1]+)(?:b?)$/i));

	return matches;
}

function extractOct(input)
{
	var matches = undefined;

	(matches = input.match(/^(?:0o)?([0-7]+)$/i));

	return matches;
}

function extractDec(input)
{
	var matches = undefined;

	(matches = input.match(/^([0-9]+)$/i));

	return matches;
}

function extractHex(input)
{
	var matches = undefined;

	(matches = input.match(/^(?:0x)?([0-9a-f]+)$/i)) ||
	(matches = input.match(/^([0-9a-f]+)(?:h)?$/i));

	return matches;
}

/*******************************************************************************
*** Utilities
******************************************************************************/

function reverseString(input)
{
	return input.split("").reverse().join("");
}

/*******************************************************************************
*** Ready
******************************************************************************/

$(document).foundation();

$.Topic(BASE_TOPIC).subscribe(function(v) { var e = $("#inputBase10"); if (!e.is(":focus")) { if (!isZero(v)) { e.val($.trim(reverseString(reverseString(bigInt2str(v, 10).toUpperCase()).replace(/(.{4})/g, "$1 ")))); } else { e.val(""); } } });
$.Topic(BASE_TOPIC).subscribe(function(v) { var e = $("#inputBase02"); if (!e.is(":focus")) { if (!isZero(v)) { e.val($.trim(reverseString(reverseString(bigInt2str(v, 02).toUpperCase()).replace(/(.{4})/g, "$1 ")))); } else { e.val(""); } } });
$.Topic(BASE_TOPIC).subscribe(function(v) { var e = $("#inputBase08"); if (!e.is(":focus")) { if (!isZero(v)) { e.val($.trim(reverseString(reverseString(bigInt2str(v, 08).toUpperCase()).replace(/(.{4})/g, "$1 ")))); } else { e.val(""); } } });
$.Topic(BASE_TOPIC).subscribe(function(v) { var e = $("#inputBase16"); if (!e.is(":focus")) { if (!isZero(v)) { e.val($.trim(reverseString(reverseString(bigInt2str(v, 16).toUpperCase()).replace(/(.{4})/g, "$1 ")))); } else { e.val(""); } } });

$("#inputBase10").on("input", function() { compute($(this).val(), 10) });
$("#inputBase02").on("input", function() { compute($(this).val(), 02) });
$("#inputBase08").on("input", function() { compute($(this).val(), 08) });
$("#inputBase16").on("input", function() { compute($(this).val(), 16) });

$("#inputBase10").focus();

// TODO: Handle negative number & operations
// TODO: Handle enter key to compute the current field
// TODO: Hex to string etc...
// TODO: Change lib to handle 64 max and registers like c
