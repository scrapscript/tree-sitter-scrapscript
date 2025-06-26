/**
 * @file a sharable programming language
 * @author Taylor Troesh <taylor@troe.sh>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  COMMENT: 1,
  STRING: 2,
  FIELD_ACCESS: 1,
  PART: 1,
  FUNCTION: 3,
  INFIX: 10,
  APPLY: 20, // Higher precedence than infix operators
};

function sepBy(rule, sep) {
  return optional(seq(rule, repeat(seq(sep, rule))));
}

module.exports = grammar({
  name: "scrapscript",
  conflicts: ($) => [
    [$._expr, $._callable],
    [$._expr, $.pattern],
  ],

   extras: $ => [
     $._whitespace,
     $._line_comment,
   ],
 
  rules: {
    program: ($) => $._subprogram,

    // The following two rules ensure the left-associativity of the
    // "where" declaration syntax production
    _subprogram: $ => choice($._expr, $.where),

    where: $ => seq($._subprogram, ";", $.declaration),

    declaration: $ => choice($._annotation, $._binding),

    _annotation: $ => seq($.pattern, ":", $.id),

    _binding: $ => choice(seq($.pattern, "=", $._expr), seq($._annotation, "=", $._expr)),

    _whitespace: _ => /\s+/,

    _line_comment: _ => /--.*/,

    _expr: ($) =>
      choice(
        $.apply,
        $.bytes,
        $.fun,
        $.hole,
        $.id,
        $.infix,
        $.list,
        $.match_fun,
        $.number,
        $.parens,
        $.record,
        $.tag,
        $.text,
      ),

    parens: ($) => seq("(", field("expr", $._subprogram), ")"),

    _unary: $ =>
      choice(
        $.bytes,
        $.hole,
        $.id,
        $.list,
        $.number,
        $.parens,
        $.record,
        $.tag,
        $.text,
        $.wildcard,
      ),

    // The following two rules ensures the left-associativity of the
    // partial function application syntax production
    _callable: $ =>
      choice(
        // $._callable doesn't include the following syntactically ambiguous
        // constructs like $.fun and $.match_fun.
        // [TODO]: Support record access
        $.apply,
        $.id,
        $.parens
      ),

    apply: ($) =>
      seq(field("caller", $._callable), field("callee", $._unary)),

    infix: ($) =>
      prec.left(
        PREC.INFIX,
        seq(field("left", $._expr), field("op", $.op), field("right", $._expr))
      ),

    number: ($) => seq(optional("-"), choice(/[0-9]+/, /[0-9]+\.[0-9]+/)),

    text: ($) => /"[^"]*"/,

    bytes: ($) => /~~[A-Za-z0-9+/=]+/,

    list: ($) => seq("[", sepBy($._expr, ","), "]"),

    id: ($) => /[a-zA-Z_][a-zA-Z0-9_\/\-]*/,

    hole: ($) => "()",

    tag: ($) => prec.right(5, seq("#", $.id, optional($._unary))),

    record: ($) => seq("{", optional(sepBy($.field, ",")), "}"),

    field: ($) =>
      choice(
        field("name", $.id),
        seq(field("name", $.id), "=", field("value", $._expr)),
        seq("..", field("value", $._expr)),
        field("record_wildcard", "...")
      ),

    // [TODO]: Do we want nested where clauses within regular
    // functions and match functions?
    // If so, we can use $._subprogram instead of $._expr in the
    // two productions below
    fun: ($) =>
      prec.right(PREC.FUNCTION, seq($.pattern, "->", $._expr)),

    match_fun: ($) =>
      prec.right(PREC.FUNCTION, seq("|", $.match_arm, repeat(seq("|", $.match_arm)))),

    match_arm: ($) => prec.right(PREC.FUNCTION + 1, seq($._guardable_pattern, "->", $._expr)),

    _guardable_pattern: ($) => seq($.pattern, optional(seq("?", field("guard", $._expr)))),

    pattern: ($) =>
      choice(
        $.bytes,
        $.cons,
        $.hole,
        $.id,
        $.list,
        $.number,
        $.parens,
        $.record,
        $.tag,
        $.text,
        $.wildcard,
      ),

    cons: $ => prec.right(seq($.pattern, ">+", $.pattern)),

    wildcard: _ => "_",

    op: ($) =>
      choice(
        "|>",
        "==",
        "/=",
        "<",
        ">",
        "<=",
        ">=",
        "*",
        "/",
        "//",
        "%",
        "+",
        "-",
        "&&",
        "||",
        "::",
        "..",
        "@",
        ">>",
        "<<",
        "^",
        ">*",
        "++",
        ">+",
        "+<",
        "'",
        ":",
        "?",
        "!",
        ".",
      ),
  },
});
