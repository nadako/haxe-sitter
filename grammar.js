module.exports = grammar({
	name: 'haxe',

	rules: {
		// TODO: add the actual grammar rules
		source_file: $ => seq(
			optional($.package_decl),
			repeat($.type_decl)
		),

		package_decl: $ => seq(
			"package",
			field("package", $.package_path),
			";"
		),

		type_decl: $ => choice(
			$.import_declaration,
			$.class_declaration,
		),

		import_declaration: $ => seq(
			"import",
			field("path", $.module_path),
			";"
		),

		class_declaration: $ => seq(
			field("modifiers", repeat(choice(
				"private",
				"final"
			))),
			field("kind", choice("class", "interface")),
			field("name", $._identifier),
			field("heritage", optional(seq(
				"extends",
				$.type_path
			))),
			field("interfaces", repeat(seq(
				"implements", $.type_path
			))),
			"{",
			field("fields", repeat($.class_field)),
			"}"
		),

		class_field: $ => seq(
			field("access", repeat(choice(
				"static",
				"macro",
				"public",
				"private",
				"override",
				"dynamic",
				"inline",
				"extern"
			))),
			choice(
				$.var_field,
				$.function_field,
			)
		),

		var_field: $ => seq(
			choice("var", "final"),
			field("name", $._identifier),
			field("type", optional($.type_hint)),
			field("init", seq(
				optional(seq(
					"=",
					$.expr
				)),
				";",
			))
		),

		function_field: $ => seq(
			"function",
			field("name", $._identifier),
			"(",
			field("args", sepBy(",", $.function_arg)),
			")",
			field("return_type", optional($.type_hint)),
			choice(
				";",
				$.expr
			),
		),

		function_arg: $ => seq(
			field("opt", optional("?")),
			field("name", $._identifier),
			field("type", optional($.type_hint)),
			field("init", optional(seq(
				"=",
				$.expr,
			)))
		),

		expr: $ => choice(
			$.expr_block,
			$.expr_if,
			$.expr_call,
			$.expr_field,
			$._identifier,
		),

		expr_block: $ => seq(
			"{",
			repeat(seq($.expr, ";")),
			"}",
		),

		expr_if: $ => prec.right(seq(
			"if",
			"(",
			field("cond", $.expr),
			")",
			field("then", $.expr),
			optional(seq(
				"else",
				field("else", $.expr)
			))
		)),

		expr_call: $ => seq(
			field("callee", $.expr),
			"(",
			field("args", sepBy(",", $.expr)),
			")"
		),

		expr_field: $ => seq(
			$.expr,
			".",
			field("name", $._identifier)
		),

		type_hint: $ => seq(
			":",
			$.complex_type,
		),

		complex_type: $ => choice(
			$.type_path
		),

		type_path: $ => seq($.module_path), // TODO type params

		package_path: $ => sepBy1(".", $._identifier),

		module_path: $ => sepBy1(".", $._identifier),

		_identifier: $ => /[a-zA-Z_]\w*/,
	}
});

function sepBy(sep, rule) {
	return optional(sepBy1(sep, rule))
}

function sepBy1(sep, rule) {
	return seq(rule, repeat(seq(sep, rule)));
}