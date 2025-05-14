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
  FUNCTION: 10,
  INFIX: 2,
  APPLY: 20, // Higher precedence than infix operators
};

function sepBy(rule, sep) {
  return optional(seq(rule, repeat(seq(sep, rule))));
}

module.exports = grammar({
  name: "scrapscript",
  conflicts: ($) => [
    [$.apply, $.infix, $._arm],
    [$.tag, $.parens],
    [$.apply, $.infix, $.tag],
  ],

  rules: {
    program: ($) => $._expr,

    _expr: ($) =>
      choice(
        $.infix,
        $.apply,
        $.number,
        $.text,
        $.bytes,
        $.list,
        $.record,
        $.fun,
        $.id,
        $.hole,
        $.tag,
        $.parens
      ),

    parens: ($) => seq("(", field("expr", $._expr), ")"),

    apply: ($) =>
      prec.left(PREC.APPLY, field("apply", seq($._expr, repeat1($._expr)))),

    infix: ($) =>
      prec.left(
        PREC.INFIX,
        seq(field("left", $._expr), field("op", $.op), field("right", $._expr))
      ),

    number: ($) => choice(/[0-9]+/, /[0-9]+\.[0-9]+/),

    text: ($) => /"[^"]*"/,

    bytes: ($) => /~~[A-Za-z0-9+/=]+/,

    list: ($) => seq("[", sepBy($._expr, ","), "]"),

    id: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    hole: ($) => "()",

    tag: ($) => prec.right(5, seq("#", $.id, optional($._expr))),

    record: ($) => seq("{", optional(sepBy($.field, ",")), "}"),

    field: ($) =>
      choice(
        seq(field("name", $.id), "=", field("value", $._expr)),
        seq("..", field("value", $._expr)),
        seq("...", field("value", $._expr))
      ),

    fun: ($) =>
      prec.right(PREC.FUNCTION, seq("|", $._arm, repeat(seq("|", $._arm)))),

    _arm: ($) => prec.right(PREC.FUNCTION + 1, seq($.pattern, "->", $._expr)),

    pattern: ($) =>
      choice(
        $.id,
        $.number,
        $.text,
        $.bytes,
        $.list,
        $.record,
        $.hole,
        $.tag,
        $.parens
      ),

    op: ($) =>
      choice(
        "|>",
        "|",
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
        "#",
        "->",
        ":",
        "=",
        "?",
        "!",
        ".",
        ";"
      ),
  },
});
