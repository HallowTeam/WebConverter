(function($)
{
	/*******************************************************************************
	*** Variables
	******************************************************************************/

	BASES_TOPIC = "BaseConversion";

	/*******************************************************************************
	***
	******************************************************************************/

	function parseBase(input, base)
	{
		var value = undefined;
		var match = undefined;
		var input = input.replace(/\s+/g, "").split(/([\+\-\*\/\%])/g);

		if (input)
		{
			if (!(match = extractBase(((input[0])? input[0] : "0"), base)))
			{
				throw Error("[-] Invalid syntax");
			}

			input[0] = str2bigInt(match[1], base);

			for (var i = 1; i < input.length; i += 2)
			{
				if (!(match = extractBase(input[i + 1], base)))
				{
					throw Error("[-] Invalid syntax");
				}

				input[i + 1] = str2bigInt(match[1], base);
			}

			value = computeBase(input);
			value = mod(value, powMod(str2bigInt("2", 10), str2bigInt(baseBits().toString(), 10), str2bigInt("F00000000000000000000000000000000", 16)));
		}

		$.Topic(BASES_TOPIC).publish(value);
	}

	function computeBase(input)
	{
		var temp  = [input[0]];
		var value = str2bigInt("F00000000000000000000000000000000", 16);

		for (var i = 1; i < input.length - 1; i += 2)
		{
			switch (input[i])
			{
				case "%" : temp[temp.length - 1] = mod (temp[temp.length - 1], input[i + 1]); break;
				case "/" : temp[temp.length - 1] = div (temp[temp.length - 1], input[i + 1]); break;
				case "*" : temp[temp.length - 1] = mult(temp[temp.length - 1], input[i + 1]); break;
				default  : temp = temp.concat(input.slice(i, i + 2));
			}
		}

		value = add(value, temp[0]);

		for (var i = 1; i < temp.length - 1; i += 2)
		{
			switch (temp[i])
			{
				case "+" : value = add(value, temp[i + 1]); break;
				case "-" : value = sub(value, temp[i + 1]); break;
			}
		}

		return value;
	}

	function formatBase(value, base)
	{
		var ret = "";

		if (!isZero(value))
		{
			ret = bigInt2str(value, base).toUpperCase();
			ret = reverseString(ret);
			ret = ret.replace(/(.{4})/g, "$1 ");
			ret = reverseString(ret);
			ret = $.trim(ret);
		}

		return ret;
	}

	function baseBits()
	{
		if ($("input[name=radioBase]:checked").get(0) == $("#radioBase64").get(0)) { return 64 };
		if ($("input[name=radioBase]:checked").get(0) == $("#radioBase32").get(0)) { return 32 };
		if ($("input[name=radioBase]:checked").get(0) == $("#radioBase16").get(0)) { return 16 };
		if ($("input[name=radioBase]:checked").get(0) == $("#radioBase08").get(0)) { return 08 };

		return 0;
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

	function div(a, b)
	{
		var c = a.length > b.length ? expand(0, a.length) : expand(0, b.length);
		var d = a.length > b.length ? expand(0, a.length) : expand(0, b.length);

		divide_(a, b, c, d);

		return c;
	}

	/*******************************************************************************
	*** Bindings
	******************************************************************************/

	$.Topic(BASES_TOPIC).subscribe(function(v) { var e = $("#inputBase10"); if (!e.is(":focus")) { e.val(formatBase(v, 10)); } });
	$.Topic(BASES_TOPIC).subscribe(function(v) { var e = $("#inputBase02"); if (!e.is(":focus")) { e.val(formatBase(v, 02)); } });
	$.Topic(BASES_TOPIC).subscribe(function(v) { var e = $("#inputBase08"); if (!e.is(":focus")) { e.val(formatBase(v, 08)); } });
	$.Topic(BASES_TOPIC).subscribe(function(v) { var e = $("#inputBase16"); if (!e.is(":focus")) { e.val(formatBase(v, 16)); } });

	$("#inputBase10").on("input", function() { parseBase($(this).val(), 10) });
	$("#inputBase02").on("input", function() { parseBase($(this).val(), 02) });
	$("#inputBase08").on("input", function() { parseBase($(this).val(), 08) });
	$("#inputBase16").on("input", function() { parseBase($(this).val(), 16) });

	$("input[name=radioBase]").on("change", function()
	{
		var temp = $("#inputBase10").val();

		$("#inputBase10").trigger("input");
		$("#inputBase10").val(temp);

	});

	// TODO: Handle negative number & operations
	// TODO: Handle operand precedence
	// TODO: Handle enter key to compute the current field
	// TODO: Hex to string etc...
	// TODO: Change lib to handle 64 max and registers like c
})(jQuery);
