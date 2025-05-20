;; queries/highlights.scm
;; Tree-sitter query for syntax highlighting

;; Identifiers
(id) @variable

;; Literals
(number) @number
(text) @string
(bytes) @string.special
