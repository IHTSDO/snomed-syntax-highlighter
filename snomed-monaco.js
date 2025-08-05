// Monaco Editor SNOMED CT Language Implementation
require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function() {
    // Register SNOMED CT language
    monaco.languages.register({ id: 'snomedct' });
    
    // Define SNOMED CT syntax highlighting
    monaco.languages.setMonarchTokensProvider('snomedct', {
        // Keywords
        keywords: ['id'],
        
        // Operators
        operators: ['=', ':', '<', '<<', '>', '>>'],
        
        // Tokenizer rules
        tokenizer: {
            root: [
                // Concept IDs (6-18 digit numbers)
                [/\b\d{6,18}\b/, 'concept-id'],
                
                // Pipes
                [/\|/, 'pipe'],
                
                // Keywords
                [/\bid\b/, 'keyword'],
                
                // Role groups
                [/@\w+/, 'role-group'],
                
                // Operators
                [/[=:<>]/, 'operator'],
                
                // Brackets
                [/[{}[\]()]/, 'bracket'],
                
                // Separators
                [/,/, 'separator'],
                
                // Whitespace
                [/\s+/, 'whitespace']
            ]
        }
    });
    
    // Define SNOMED CT theme
    monaco.editor.defineTheme('snomedct-theme', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'concept-id', foreground: '666666', fontStyle: 'normal' },
            { token: 'pipe', foreground: '4a9eff', fontStyle: 'normal' },
            { token: 'keyword', foreground: 'cc0000', fontStyle: 'bold' },
            { token: 'role-group', foreground: 'cc0000', fontStyle: 'bold' },
            { token: 'operator', foreground: 'cc0000', fontStyle: 'bold' },
            { token: 'bracket', foreground: 'cc0000', fontStyle: 'bold' },
            { token: 'separator', foreground: 'cc0000', fontStyle: 'bold' },
            { token: 'default', foreground: 'cc0000', fontStyle: 'bold' }
        ],
        colors: {}
    });
    
    // SNOMED CT formatter
    monaco.languages.registerDocumentFormattingEditProvider('snomedct', {
        provideDocumentFormattingEdits: function(model, options, token) {
            const text = model.getValue();
            const formattedText = formatSNOMEDExpression(text);
            
            return [{
                range: model.getFullModelRange(),
                text: formattedText
            }];
        }
    });
    
    // SNOMED CT link provider
    monaco.languages.registerLinkProvider('snomedct', {
        provideLinks: function(model, token) {
            const links = [];
            const text = model.getValue();
            
            // Smart regex that matches both standalone concept codes and codes with descriptions
            // Pattern: \b(\d{6,18})\b(?:\s*\|([^|]*)\|)?
            // This matches: 123456789 or 123456789 |description|
            const conceptRegex = /\b(\d{6,18})\b(?:\s*\|([^|]*)\|)?/g;
            let match;
            
            while ((match = conceptRegex.exec(text)) !== null) {
                const conceptId = match[1];
                const description = match[2] ? match[2].trim() : '';
                const fullMatch = match[0];
                const startPos = model.getPositionAt(match.index);
                const endPos = model.getPositionAt(match.index + fullMatch.length);
                
                // Create URL with concept ID
                let url = `http://snomed.info/id/${conceptId}`;
                
                links.push({
                    range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                    url: url
                });
            }
            
            return { links: links };
        }
    });
    
    // Initialize editor
    let editor;
    
    $(document).ready(function() {
        // Get expression from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const expression = urlParams.get('expression');
        
        if (!expression) {
            $('#expression-container').html('<div class="error">No expression parameter found in URL. Please provide an "expression" parameter.</div>');
            return;
        }
        
        try {
            // Normalize the expression
            const normalizedExpression = normalizeSNOMEDExpression(expression);
            
            // Create Monaco editor
            editor = monaco.editor.create(document.getElementById('expression-container'), {
                value: normalizedExpression,
                language: 'snomedct',
                theme: 'snomedct-theme',
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontSize: 14,
                lineHeight: 20,
                wordWrap: 'on',
                padding: { top: 0, bottom: 5, left: 0, right: 0 },
                links: true,
                renderLineHighlight: 'none',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0
            });
            
            // Adjust height based on content
            setTimeout(() => {
                const lineCount = editor.getModel().getLineCount();
                const minHeight = 10; // Minimum height in pixels
                const maxHeight = 800; // Maximum height in pixels
                const lineHeight = 20; // Line height in pixels
                const padding = 5; // Extra padding for borders, etc.

                let lineCountPlus = lineCount;
                if (lineCountPlus > 1) {
                    lineCountPlus++;
                }

                const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, (lineCountPlus * lineHeight) + padding));
                document.getElementById('expression-container').style.height = calculatedHeight + 'px';
                editor.layout();
            }, 100);
            
        } catch (error) {
            $('#expression-container').html('<div class="error">Error parsing expression: ' + error.message + '</div>');
        }
    });
    
    // SNOMED CT formatting functions
    function normalizeSNOMEDExpression(expression) {
        let normalized = expression;
        
        // Normalize concept descriptions using the same regex as link provider
        // Remove spaces after first pipe and before last pipe in concept descriptions
        normalized = normalized.replace(/\b(\d{6,18})\b(?:\s*\|([^|]*)\|)?/g, function(match, conceptId, description) {
            if (description) {
                // Remove spaces after first pipe and before last pipe
                const cleanedDescription = description.replace(/^\s+|\s+$/g, '');
                return `${conceptId}|${cleanedDescription}|`;
            }
            return match; // Return unchanged if no description
        });
        
        // Format indentation for attribute groups
        normalized = formatAttributeGroups(normalized);
        
        return normalized;
    }
    
    function formatAttributeGroups(expression) {
        return formatNestedExpression(expression, 0);
    }
    
    function formatNestedExpression(expression, depth) {
        let result = '';
        let current = '';
        let parenCount = 0;
        let braceCount = 0;
        let inAttributeGroup = false;
        let attributeGroupStart = -1;
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            
            if (char === '{') {
                if (braceCount === 0) {
                    // Start of a new attribute group
                    inAttributeGroup = true;
                    attributeGroupStart = i;
                    result += current;
                    current = '';
                }
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && inAttributeGroup) {
                    // End of attribute group, format it
                    const groupContent = expression.substring(attributeGroupStart + 1, i);
                    const formattedGroup = formatAttributeGroupContent(groupContent, depth + 1);
                    result += `{\n${formattedGroup}\n${'    '.repeat(depth)}}`;
                    inAttributeGroup = false;
                    current = '';
                    continue;
                }
            } else if (char === '(') {
                parenCount++;
                // Check if this parenthesis comes after an equals sign (indicating a nested expression)
                const beforeText = result + current;
                const afterText = expression.substring(i + 1);
                
                // Look for equals sign before the parenthesis
                const hasEqualsBefore = beforeText.match(/=\s*$/);
                // Check if the next non-whitespace character is a digit (concept ID)
                const hasConceptIdAfter = afterText.match(/^\s*(\d{9})/);
                
                if (hasEqualsBefore && hasConceptIdAfter) {
                    // This is a nested expression after an equals sign
                    result += current + '(\n' + '    '.repeat(depth);
                    current = '';
                    continue;
                }
            } else if (char === ')') {
                parenCount--;
            }
            
            if (!inAttributeGroup) {
                current += char;
            }
        }
        
        result += current;
        return result;
    }
    
    function formatAttributeGroupContent(content, depth) {
        // Split by top-level commas (not inside parentheses)
        const attributes = splitByTopLevelCommas(content);
        
        return attributes.map(attr => {
            const trimmed = attr.trim();
            if (trimmed.length === 0) return '';
            
            // Format the attribute with proper indentation
            const formatted = formatAttribute(trimmed, depth);
            return `${'    '.repeat(depth)}${formatted}`;
        }).filter(attr => attr.length > 0).join(',\n');
    }
    
    function splitByTopLevelCommas(content) {
        const result = [];
        let current = '';
        let parenCount = 0;
        let braceCount = 0;
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (char === '(') {
                parenCount++;
            } else if (char === ')') {
                parenCount--;
            } else if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
            } else if (char === ',' && parenCount === 0 && braceCount === 0) {
                // Top-level comma found
                result.push(current);
                current = '';
                continue;
            }
            
            current += char;
        }
        
        if (current.length > 0) {
            result.push(current);
        }
        
        return result;
    }
    
    function formatAttribute(attribute, depth) {
        // Clean up extra spaces around operators
        let formatted = attribute
            .replace(/\s*=\s*/g, ' = ')
            .replace(/\s*:\s*/g, ' : ')
            .trim();
        
        // Handle nested expressions within this attribute
        if (formatted.includes('(') || formatted.includes('{')) {
            formatted = formatNestedExpression(formatted, depth + 1);
        }
        
        return formatted;
    }
    
    function formatSNOMEDExpression(expression) {
        return normalizeSNOMEDExpression(expression);
    }
}); 