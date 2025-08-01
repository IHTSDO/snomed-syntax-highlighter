# SNOMED CT Expression Syntax Highlighter

A single-page web application for formatting and syntax highlighting SNOMED CT expressions using [Monaco Editor](https://microsoft.github.io/monaco-editor/). This webapp is designed to be embedded in other applications and provides a clean, white background with no layout styling.

## Features

- **Professional Syntax Highlighting**: Uses Monaco Editor (same as VS Code) for robust parsing and highlighting
- **Custom Language Definition**: Tailored specifically for SNOMED CT expressions
- **Automatic Normalization**: Cleans up spacing around description terms
- **Indentation Formatting**: Formats attribute groups with proper indentation
- **Nested Expression Support**: Handles complex nested structures with proper indentation
- **URL Parameter Support**: Accepts expressions via URL parameter
- **Embeddable**: Designed to be embedded in other applications
- **Lightweight**: Uses Monaco Editor with custom language definition
- **Clean Design**: White background with minimal styling

## Syntax Highlighting

The webapp highlights the following SNOMED CT expression components:

- **Concept IDs**: 9-digit numerical sequences (e.g., `243796009`) - Grey
- **Pipes**: Vertical bars (`|`) - Blue
- **Keywords**: `id` - Red, bold
- **Operators**: `:`, `=`, `<`, `<<`, `>>` - Red, bold
- **Brackets**: `{}`, `[]`, `()` - Red, bold
- **Role Group Identifiers**: `@Finding`, `@Relationship` - Red, bold
- **Separators**: Commas - Red, bold
- **Descriptions**: Text between pipes - Black

## Normalization

The formatter automatically normalizes spacing around description terms:

- **Before**: `|  Clinical finding  |` 
- **After**: `|Clinical finding|`

This ensures consistent formatting by removing extra spaces after the opening pipe and before the closing pipe in description terms.

## Indentation Formatting

The formatter automatically formats attribute groups with proper indentation:

### Single Attribute Group
**Before:**
```
243796009 |Situation with explicit context|: { 246090004|Associated finding|= [[+id (< 404684003|Clinical finding|) @Finding]], 408731000|Temporal context|= 410511007|Current or past (actual)|, 408729009|Finding context|= 410515003|Known present|, 408732007|Subject relationship context|= [[+id (<< 444148008|Person in family of subject| ) @Relationship]] }
```

**After:**
```
243796009 |Situation with explicit context| :
    {    246090004 |Associated finding|  = [[+id (<  404684003 |Clinical finding| ) @Finding]],
         408731000 |Temporal context|  =  410511007 |Current or past (actual)| ,
         408729009 |Finding context|  =  410515003 |Known present| ,
         408732007 |Subject relationship context|   =  [[+id (<<  444148008 |Person in family of subject| ) @Relationship]]  }
```

### Multiple Attribute Groups
The formatter also handles multiple attribute groups separated by commas, applying the same indentation rules to each group.

### Nested Expressions
The formatter handles complex nested expressions with proper indentation at each level:

**Example with nested expression:**
```
243796009 |Situation with explicit context| :
    {    246090004 |Associated finding|  = [[+id (<  404684003 |Clinical finding| ) @Finding]],
         408731000 |Temporal context|  =  410511007 |Current or past (actual)| ,
         408729009 |Finding context|  =  (
             243796009 |Situation with explicit context| :
             {    246090004 |Associated finding|  = [[+id (<  404684003 |Clinical finding| ) @Finding]],
                   408731000 |Temporal context|  =  410511007 |Current or past (actual)|)
             }
         )
         408732007 |Subject relationship context|   =  [[+id (<<  444148008 |Person in family of subject| ) @Relationship]]
    }
```

**Parentheses Formatting:**
- Adds a newline after opening parentheses `(`
- Indents the following line by 4 spaces
- Maintains proper structure for nested expressions

## Benefits of Using Monaco Editor

- **Professional Parsing**: Robust tokenization and syntax highlighting
- **Maintainable**: Clear grammar definition and token rules
- **Extensible**: Easy to add validation and new features
- **Performance**: Optimized for large expressions
- **Reliable**: No more brittle regex-based parsing
- **Professional**: Same editor used by VS Code

## Usage

### Basic Usage

Access the webapp with an expression parameter:

```
index.html?expression=YOUR_SNOMED_EXPRESSION_HERE
```

### Example

```
index.html?expression=243796009 | Situation with explicit context | : { 246090004 | Associated finding | = [[+id (< 404684003 | Clinical finding | )@Finding]], 408731000 | Temporal context = 410511007 | Current or past (actual), 408729009 | Finding context | = 410515003 | Known present, 408732007 | Subject relationship context = [[+id (<< 444148008 | Person in family of subject | ) @Relationship]] }
```

### Embedding in Other Applications

To embed this webapp in another application:

1. Host the files (`index.html`, `snomed-monaco.js`) on your web server
2. Use an iframe or redirect to the webapp with the expression parameter
3. The webapp will display the formatted expression with syntax highlighting

### URL Encoding

If your SNOMED CT expression contains special characters, make sure to URL-encode the expression parameter to avoid issues with URL parsing.

## Files

- `index.html` - Main HTML file with Monaco Editor integration
- `snomed-monaco.js` - Monaco Editor implementation with SNOMED CT language definition
- `test.html` - Test page with example expressions
- `README.md` - This documentation

## Custom Language Definition

The `snomed-monaco.js` file contains a custom Monaco Editor language definition that:

- Defines token patterns for each SNOMED CT component
- Uses proper token precedence for accurate highlighting
- Provides semantic token classification
- Can be easily extended for additional syntax elements

## Monaco Editor Features

The implementation includes:

- **Custom Language Registration** - SNOMED CT language definition
- **Syntax Highlighting** - Professional tokenization and coloring
- **Custom Theme** - Tailored color scheme for SNOMED CT
- **Document Formatting** - Automatic formatting and indentation
- **Read-only Mode** - Optimized for display purposes

## Testing

Open `test.html` in a web browser to see examples of the syntax highlighter in action with different SNOMED CT expressions, including normalization, indentation, and nested expression examples.

## Browser Compatibility

- Modern browsers with JavaScript enabled
- jQuery 3.6.0+ (loaded from CDN)
- Monaco Editor 0.45.0+ (loaded from CDN)
- No additional dependencies required

## Extending the Language Definition

To add new token types or modify existing ones, edit the `snomed-monaco.js` file. The language definition follows Monaco Editor conventions:

```javascript
monaco.languages.setMonarchTokensProvider('snomedct', {
    tokenizer: {
        root: [
            [/\b\d{9}\b/, 'concept-id'],
            [/\|/, 'pipe'],
            // Add new patterns here
        ]
    }
});
```

## Performance

- Monaco Editor is optimized for large files and expressions
- Custom language definition adds minimal overhead
- Efficient tokenization and rendering
- Optimized for real-time highlighting 