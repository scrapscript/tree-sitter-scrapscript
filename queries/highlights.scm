;; queries/highlights.scm
;; Tree-sitter query for syntax highlighting

;; Identifiers
(identifier) @variable

;; Literals
(number) @number
(text) @string
(bytes) @string.special
