// Module-level registry to keep track of JSX signatures across files.
// Persisting state at module scope allows this rule to detect duplicates
// across multiple files when ESLint runs in a single process.
const globalSeen = new Map();

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Detect duplicated JSX and suggest extracting a shared component.",
    },
    messages: {
      duplicated: "This JSX also appears in {{file}}. Consider extracting a shared component.",
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Helper to create a stable signature for a JSX node. Collapse
    // whitespace so trivial formatting differences between files don't
    // prevent a match.
    function signatureFor(node) {
      const src = context.getSourceCode().getText(node);
      return src.replace(/\s+/g, " ").trim();
    }

    return {
      JSXElement(node) {
        const sig = signatureFor(node);

        if (!globalSeen.has(sig)) {
          // Record the first seen filename for this signature.
          globalSeen.set(sig, { filename });
          return;
        }

        const info = globalSeen.get(sig);

        // Only report when this occurrence is in a different file than
        // the first-seen occurrence. This avoids duplicate reports for
        // multiple nodes within the same file.
        if (info.filename && info.filename !== filename) {
          context.report({
            node,
            messageId: "duplicated",
            data: { file: info.filename },
          });
        }
      },
    };
  },
};