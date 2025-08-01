// SNOMED CT Language Definition for Prism.js
Prism.languages.snomedct = {
    // Concept IDs (9-digit numbers)
    'concept-id': {
        pattern: /\b\d{9}\b/,
        alias: 'number'
    },
    
    // Descriptions (text between vertical bars)
    'description': {
        pattern: /\|[^|]*\|/,
        alias: 'string'
    },
    
    // Keywords
    'keyword': {
        pattern: /\+id/,
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
    
    // Brackets and parentheses
    'bracket': {
        pattern: /[{}[\]()]/,
        alias: 'punctuation'
    },
    
    // Separators (commas)
    'separator': {
        pattern: /,/,
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