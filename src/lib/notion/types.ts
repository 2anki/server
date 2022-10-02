export type ParagraphBlockObject = {
  paragraph: {
    color: string;
    text: [
      {
        type: string;
        text: {
          content: string;
        };
        annotations: {
          color: string;
        };
      }
    ];
  };
};
