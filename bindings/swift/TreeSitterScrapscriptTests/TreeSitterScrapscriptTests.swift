import XCTest
import SwiftTreeSitter
import TreeSitterScrapscript

final class TreeSitterScrapscriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_scrapscript())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Scrapscript grammar")
    }
}
