import {
  createIntegration,
  createComponent,
  FetchEventCallback,
  RuntimeContext,
} from "@gitbook/runtime";

type IntegrationContext = {} & RuntimeContext;
  type IntegrationBlockProps = { content?: string, lines?: number };
  type IntegrationBlockState = { content?: string, lines?: number, processed?: boolean };
type IntegrationAction = { action: 'click' } | { action: 'contentChange' } | { action: 'contentChangeLocal' } | { action: 'increaseSize' } | { action: 'keepSize' } | { action: 'decreaseSize' };

const handleFetchEvent: FetchEventCallback<IntegrationContext> = async (
  request,
  context
) => {
  const { api } = context;
  const user = api.user.getAuthenticatedUser();

  return new Response(JSON.stringify(user));
};

const exampleBlock = createComponent<
   IntegrationBlockProps,
   IntegrationBlockState,
   IntegrationAction,
   IntegrationContext
>({
  componentId: "snomed-syntax-highlighter",
  initialState: (props, renderContext, context) => {
    console.log("props", props);
    if (props.content) {
      return {
        lines: props.lines,
        content: props.content,
      };
    }
    return {
      lines: 1,
      content: "404684003 |Clinical finding (finding)|",
    };
  },
  action: async (element, action, context) => {
    switch (action.action) {
      case "contentChangeLocal":
        console.log("Change content local", element);
        if (element.state.processed) {
          return element;
        }

        // Process content to add newlines after "{" and "}" characters, with exceptions
        let content = element.state.content;
        let processedContent = content;
        let linesGuess = 1;
        if (content) {
          // Add newline after each "{" character if there isn't one already, and remove trailing whitespace
          processedContent = content.replace(/\{\s*/g, '{\n');
          
          // Add newline before "}" characters, but preserve "}, {" and "}," sequences
          processedContent = processedContent.replace(/(?<!,\s*)\}\s*(?!,|\s*,)/g, '\n}');
          
          // Remove trailing newline if the last character is "}"
          processedContent = processedContent.replace(/\n\s*$/, '');
          
          console.log("Processed content:", processedContent);
          linesGuess = (processedContent.match(/\n/g) || []).length + 1;
          console.log("linesGuess  ", linesGuess);
        }

        return {
          action: '@editor.node.updateProps',
          props: {
            lines: linesGuess,
            content: content,
            processed: true
          }
        }
      case "keepSize":
        console.log("Keep size lines", element.state.lines);
        let linesKeep = element.state.lines || 1;
        return {
          action: '@editor.node.updateProps',
          props: {
            lines: linesKeep,
            content: element.state.content
          }
        }
      case "increaseSize":
        console.log("Increase size", element);
        let lines = element.state.lines || 1;
        lines = lines + 1;
        if (lines > 15) {
          lines = 15;
        }
        return {
          action: '@editor.node.updateProps',
          props: {
            lines: lines,
            content: element.state.content
          }
        }
      case "decreaseSize":
        console.log("Decrease size", element);
        let linesB = element.state.lines || 1;
        linesB = linesB -1;
        if (linesB < 1) {
          linesB = 1;
        }
        return {
          action: '@editor.node.updateProps',
          props: {
            lines: linesB,
            content: element.state.content
          }
        }
      default:
        console.log("❌ Unknown action:", action.action);
        return element;
    }  },
  render: async (element, context) => {
    console.log("render ", JSON.stringify(element));
    const { content } = element.state;
    let lines = element.state.lines;
    console.log("render lines ", lines);
    const isEditable = element.context.editable;
    let linesGuess = 1;
    let guessedLines = false;
    

    
    const expressionUrl = `https://ihtsdo.github.io/snomed-syntax-highlighter/?expression=${encodeURIComponent(content || '')}`;

    if (isEditable) {
      return (
        <block>
          <text style="italic">You are in edit mode. Edit the Expression in this box.</text>
            <codeblock
              state="content"
              content={content || ""}
              onContentChange={{
                action: 'contentChangeLocal',
                props: {
                  lines: lines,
                  content: element.dynamicState('content')
                }
              }}
            />
            <text style="italic">This is how it will look:</text>
          <webframe
            source={{ url: expressionUrl }}
            aspectRatio={710/(23 + (20 * lines))}
            />
          <text>Frame size: {lines + ''} lines</text>
          <button label="Smaller" onPress={{ action: 'decreaseSize' }} />
          <button label="Bigger" onPress={{ action: 'increaseSize' }} />
        </block>
      );  
    } else {
    return (
      <block>
        <webframe
          source={{ url: expressionUrl }}
          aspectRatio={710/(23 + (20 * lines))}
          />
      </block>
    );
    }
  }
});

export default createIntegration({
  fetch: handleFetchEvent,
  components: [exampleBlock],
  events: {},
});
