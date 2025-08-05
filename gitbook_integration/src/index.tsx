import {
  createIntegration,
  createComponent,
  FetchEventCallback,
  RuntimeContext,
} from "@gitbook/runtime";

type IntegrationContext = {} & RuntimeContext;
type IntegrationBlockProps = { content?: string };
type IntegrationBlockState = { content?: string };
type IntegrationAction = { action: 'click' } | { action: 'contentChange' };

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
        content: props.content,
      };
    }
    return {
      content: "initial content 1",
    };
  },
  action: async (element, action, context) => {
    switch (action.action) {
      case "click":
        console.log("Button Clicked");
        return element;
      case "contentChange":
        console.log("Content changed", JSON.stringify(element));
        const newValue = element.state.content
        console.log("New Value", newValue);
        return {
          ...element,
          // The state is already updated automatically by the codeblock
          // Just trigger the editor node update
          action: {
            action: '@editor.node.updateProps',
            props: {
              content: newValue // Use the current state content
            }
          }
        };
      default:
        console.log("❌ Unknown action:", action.action);
        return element;
    }
  },
  render: async (element, context) => {
    console.log("render ", JSON.stringify(element));
    const { content } = element.state;
    const isEditable = element.context.editable;
    
    const expressionUrl = `https://ihtsdo.github.io/snomed-syntax-highlighter/?expression=${encodeURIComponent(content || '')}`;

    if (isEditable) {
      return (
        <block>
          <text>You are in edit mode. Put the SNOMED ECL or Expression in this box.</text>
            <codeblock 
              state="content" 
              content={content || "initial content"} 
              onContentChange={{ 
                action: '@editor.node.updateProps',
                props: {
                  content: element.dynamicState('content')
                }
              }}
            />
          <text>This is how it will look:</text>
          <webframe
            source={{ url: expressionUrl }}
            />
        </block>
      );  
    } else {
    return (
      <block>
        <webframe
          source={{ url: expressionUrl }}
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
