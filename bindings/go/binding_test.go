package tree_sitter_scrapscript_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_scrapscript "github.com/scrapscript/scrapscript/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_scrapscript.Language())
	if language == nil {
		t.Errorf("Error loading Scrapscript grammar")
	}
}
