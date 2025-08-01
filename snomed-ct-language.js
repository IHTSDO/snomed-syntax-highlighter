// SNOMED CT Language Definition for Prism.js
Prism.languages.snomedct = {
    // Keywords (must come first)
    'keyword': {
        pattern: /\b(\+?id)\b/,
        alias: 'keyword'
    },
    
    // ID text in brackets (specific pattern)
    'id-text': {
        pattern: /\bid\b/,
        alias: 'keyword'
    },
    
    // Role group identifiers
    'role-group': {
        pattern: /@\w+/,
        alias: 'class-name'
    },
    
    // Operators
    'operator': {
        pattern: /[:=<>]|<<|>>/,
        alias: 'operator'
    },
    
    // Separators (commas)
    'separator': {
        pattern: /,/,
        alias: 'punctuation'
    },
    
    // Concept IDs (9-digit numbers)
    'concept-id': {
        pattern: /\b\d{9}\b/,
        alias: 'number'
    },
    
    // Pipes (description delimiters)
    'pipe': {
        pattern: /\|/,
        alias: 'punctuation'
    },
    
    // Descriptions (text between vertical bars, including brackets within)
    'description': {
        pattern: /\|[^|]*\|/,
        alias: 'string'
    },
    
    // Brackets and parentheses (only outside descriptions)
    'bracket': {
        pattern: /[{}[\]()]/,
        alias: 'punctuation'
    },
    
    // Whitespace
    'whitespace': {
        pattern: /\s+/,
        alias: 'whitespace'
    }
};

// Add the language to Prism
Prism.languages.snomed = Prism.languages.snomedct; 