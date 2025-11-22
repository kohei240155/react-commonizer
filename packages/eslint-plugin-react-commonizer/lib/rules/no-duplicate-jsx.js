module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Detect duplicated JSX and suggest extracting a shared component.",
    },
    messages: {
      duplicated: "This JSX appears multiple times. Consider extracting a shared component.",
    },
  },

  create(context) {
    const seen = new Map();

    return {
      JSXElement(node) {
        const source = context.getSourceCode().getText(node).trim();

        if (!seen.has(source)) {
          seen.set(source, node);
        } else {
          context.report({
            node,
            messageId: "duplicated",
          });
        }
      },
    };
  },
};