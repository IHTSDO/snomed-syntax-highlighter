$(document).ready(function() {
    // Get expression from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const expression = urlParams.get('expression');
    
    if (!expression) {
        $('#expression-container').html('<div class="error">No expression parameter found in URL. Please provide an "expression" parameter.</div>');
        return;
    }
    
    try {
        // Normalize the expression to clean up spacing around description terms
        const normalizedExpression = normalizeSNOMEDExpression(expression);
        
        // Create a code element with the SNOMED CT language class
        const codeElement = $('<code class="language-snomedct"></code>').text(normalizedExpression);
        const preElement = $('<pre></pre>').append(codeElement);
        
        // Replace the container content
        $('#expression-container').empty().append(preElement);
        
        // Highlight the code using Prism
        Prism.highlightElement(codeElement[0]);
        
    } catch (error) {
        $('#expression-container').html('<div class="error">Error parsing expression: ' + error.message + '</div>');
    }
});

function normalizeSNOMEDExpression(expression) {
    let normalized = expression;
    
    // Normalize description terms: remove spaces after opening pipe and before closing pipe
    // This regex finds patterns like "| description |" and removes spaces around the description
    normalized = normalized.replace(/\|\s+([^|]*?)\s+\|/g, '|$1|');
    
    // Format indentation for attribute groups
    normalized = formatAttributeGroups(normalized);
    
    return normalized;
}

function formatAttributeGroups(expression) {
    // Use a more sophisticated approach to handle nested expressions
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