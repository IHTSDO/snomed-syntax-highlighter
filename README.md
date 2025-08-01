# SNOMED CT Expression Syntax Highlighter

A single-page web application for formatting and syntax highlighting SNOMED CT expressions using [Prism.js](https://prismjs.com/). This webapp is designed to be embedded in other applications and provides a clean, white background with no layout styling.

## Features

- **Robust Syntax Highlighting**: Uses Prism.js for reliable parsing and highlighting
- **Custom Language Definition**: Tailored specifically for SNOMED CT expressions
- **Automatic Normalization**: Cleans up spacing around description terms
- **Indentation Formatting**: Formats attribute groups with proper indentation
- **Nested Expression Support**: Handles complex nested structures with proper indentation
- **URL Parameter Support**: Accepts expressions via URL parameter
- **Embeddable**: Designed to be embedded in other applications
- **Lightweight**: Uses Prism.js core (2KB) with custom language definition
- **Clean Design**: White background with minimal styling

## Syntax Highlighting

The webapp highlights the following SNOMED CT expression components:

- **Concept IDs**: 9-digit numerical sequences (e.g., `243796009`) - Blue
- **Descriptions**: Text enclosed by vertical bars (e.g., `| Situation with explicit context |`) - Black
- **Operators**: `:`, `=`, `<`, `<<`, `>>` - Red
- **Brackets**: `{}`, `[]`, `()` - Gray
- **Keywords**: `+id` - Green
- **Role Group Identifiers**: `@Finding`, `@Relationship` - Purple
- **Separators**: Commas - Gray

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
- Indents the following line by 13 spaces
- Maintains proper structure for nested expressions

## Benefits of Using Prism.js

- **Robust Parsing**: Handles edge cases better than regex-based solutions
- **Extensible**: Easy to add new token types or modify existing ones
- **Well-Tested**: Used by millions of websites including MDN, CSS-Tricks, and more
- **Performance**: Optimized for speed with Web Worker support
- **Maintainable**: Clear separation of concerns with dedicated language definition

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

1. Host the files (`index.html`, `snomed-highlighter.js`, `snomed-ct-language.js`) on your web server
2. Use an iframe or redirect to the webapp with the expression parameter
3. The webapp will display the formatted expression with syntax highlighting

### URL Encoding

If your SNOMED CT expression contains special characters, make sure to URL-encode the expression parameter to avoid issues with URL parsing.

## Files

- `index.html` - Main HTML file with Prism.js integration and styling
- `snomed-highlighter.js` - Main JavaScript logic using Prism.js with normalization, indentation, and nested expression support
- `snomed-ct-language.js` - Custom Prism.js language definition for SNOMED CT
- `test.html` - Test page with example expressions
- `README.md` - This documentation

## Custom Language Definition

The `snomed-ct-language.js` file contains a custom Prism.js language definition that:

- Defines token patterns for each SNOMED CT component
- Uses regex patterns with proper precedence ordering
- Provides semantic aliases for consistent styling
- Can be easily extended for additional syntax elements

## Normalization and Formatting Functions

The `snomed-highlighter.js` file contains several functions:

- `normalizeSNOMEDExpression()` - Main normalization function
- `formatAttributeGroups()` - Handles indentation for attribute groups
- `formatNestedExpression()` - Recursively formats nested expressions
- `formatAttributeGroupContent()` - Formats content within attribute groups
- `splitByTopLevelCommas()` - Splits by commas not inside parentheses/braces
- `formatAttribute()` - Formats individual attributes

These functions:
- Remove extra spaces around description terms
- Format attribute groups with proper indentation
- Handle nested expressions with recursive formatting
- Clean up spacing around operators (=, :)
- Handle multiple attribute groups separated by commas
- Maintain proper indentation for each nesting level

## Testing

Open `test.html` in a web browser to see examples of the syntax highlighter in action with different SNOMED CT expressions, including normalization, indentation, and nested expression examples.

## Browser Compatibility

- Modern browsers with JavaScript enabled
- jQuery 3.6.0+ (loaded from CDN)
- Prism.js 1.29.0+ (loaded from CDN)
- No additional dependencies required

## Extending the Language Definition

To add new token types or modify existing ones, edit the `snomed-ct-language.js` file. The language definition follows Prism.js conventions:

```javascript
Prism.languages.snomedct['new-token'] = {
    pattern: /your-regex-pattern/,
    alias: 'semantic-alias'
};
```

## Performance

- Prism.js core is only 2KB minified & gzipped
- Custom language definition adds minimal overhead
- Supports Web Workers for parallel processing (if available)
- Optimized for real-time highlighting 